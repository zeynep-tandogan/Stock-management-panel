using yazlab3.Data;
using yazlab3.Models;
using yazlab3.Dto;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using yazlab3.Services;


public class OrderService
{
    private readonly AppDbContext _context;
    private readonly LogService _logService;
    private readonly CustomerService _customerService;
    private static readonly object _lock = new object();
    private static readonly SemaphoreSlim _semaphore = new SemaphoreSlim(1, 1);
    private readonly ProductService _productService;

    public OrderService(AppDbContext context, LogService logService, CustomerService customerService, ProductService productService)
    {
        _context = context;
        _logService = logService;
        _customerService = customerService;
        _productService = productService;
    }

    public async Task<List<OrderDTO>> GetOrders()
    {
        var now = DateTime.Now;
        
        // Önce tüm müşterileri al
        var customers = await _context.Customers.ToDictionaryAsync(c => c.CustomerID, c => c.CustomerType);

        var orders = await _context.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product)
            .ToListAsync();

        foreach (var order in orders.Where(o => o.OrderStatus == "Bekliyor"))
        {
            // CustomerID'den CustomerType'a eriş
            string customerType = customers.GetValueOrDefault(order.CustomerID, "Standard");
            
            // Temel puan hesaplama
            decimal baseScore = customerType == "Premium" ? 20m : 10m;
            
            // Bekleme süresi hesaplama
            TimeSpan waitingTime = now - order.OrderDate;
            decimal waitingScore = (decimal)(waitingTime.TotalSeconds * 0.5);
            
            // Toplam skor güncelleme
            order.PriorityScore = baseScore + waitingScore;
        }

        await _context.SaveChangesAsync();

        return orders.Select(o => new OrderDTO
        {
            OrderID = o.OrderID,
            CustomerID = o.CustomerID,
            CustomerType = customers.GetValueOrDefault(o.CustomerID, "Standard"),
            OrderDate = o.OrderDate,
            OrderStatus = o.OrderStatus,
          
            OrderItems = o.OrderItems.Select(oi => new OrderItemDTO
            {
                ProductID = oi.ProductID,
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice
            }).ToList()
        }).ToList();
    }

    public async Task<OrderDTO> GetOrder(int id)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product)
            .Where(o => o.OrderID == id)
            .Select(o => new OrderDTO
            {
                OrderID = o.OrderID,
                CustomerID = o.CustomerID,
                OrderDate = o.OrderDate,
                OrderStatus = o.OrderStatus,
                OrderItems = o.OrderItems.Select(oi => new OrderItemDTO
                {
                    ProductID = oi.ProductID,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice
                }).ToList()
            }).FirstOrDefaultAsync();

        if (order == null)
            throw new NotFoundException($"ID {id} ile eşleşen bir sipariş bulunamadı.");

        return order;
    }

    public async Task<OrderDTO> CreateOrder(OrderDTO orderDto)
    {
        await _semaphore.WaitAsync();
        try
        {
            Console.WriteLine($"CreateOrder started at {DateTime.Now} for CustomerID: {orderDto.CustomerID}");

            if (orderDto == null || !orderDto.OrderItems.Any())
                throw new ValidationException("Sipariş bilgisi veya ürün bilgisi eksik.");

            var customerExists = await _context.Customers.AnyAsync(c => c.CustomerID == orderDto.CustomerID);
            if (!customerExists)
                throw new ValidationException($"CustomerID {orderDto.CustomerID} mevcut değil.");

            var newOrder = new Order
            {
                CustomerID = orderDto.CustomerID,
                OrderDate = DateTime.Now,
                OrderStatus = "Bekliyor",
                Onay = false,
                OrderItems = new List<OrderItem>()
            };

            // Ürünleri kontrol et ve sipariş öğelerini ekle
            foreach (var item in orderDto.OrderItems)
            {
                var product = await _productService.GetProductByIdAsync(item.ProductID);
                if (product == null)
                    throw new ValidationException($"ProductID {item.ProductID} mevcut değil.");

                // Stok kontrolü
                if (product.Stock < item.Quantity)
                    throw new ValidationException($"Ürün {product.ProductName} için yeterli stok yok. Mevcut stok: {product.Stock}");

                newOrder.OrderItems.Add(new OrderItem
                {
                    ProductID = item.ProductID,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price
                });
            }

            _context.Orders.Add(newOrder);
            await _context.SaveChangesAsync();

            // Loglama
            await LogSuccess(newOrder.CustomerID, newOrder.OrderID, "Oluşturma",
                $"Yeni sipariş oluşturuldu. Sipariş ID: {newOrder.OrderID}, Müşteri ID: {newOrder.CustomerID}");

            return await GetOrder(newOrder.OrderID);
        }
        finally
        {
            _semaphore.Release();
        }
    }



    public async Task<OrderDTO> UpdateOrder(int id, OrderDTO orderDto)
    {
        await _semaphore.WaitAsync();
        try
        {
            Console.WriteLine($"UpdateOrder started at {DateTime.Now} for OrderID: {id}");

            var existingOrder = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.OrderID == id);

            if (existingOrder == null)
                throw new NotFoundException($"ID {id} ile eşleşen bir sipariş bulunamadı.");

            _context.OrderItems.RemoveRange(existingOrder.OrderItems);
            existingOrder.OrderItems.Clear();

            foreach (var item in orderDto.OrderItems)
            {
                var product = await _context.Products.FindAsync(item.ProductID);
                if (product == null)
                {
                    await LogError(existingOrder.CustomerID, "Ürün Eksik",
                        $"Sipariş güncellenemedi. ProductID {item.ProductID} mevcut değil.");
                    throw new ValidationException($"ProductID {item.ProductID} mevcut değil.");
                }

                if (!await _customerService.CheckBudget(existingOrder.CustomerID, item.Quantity, product.Price))
                {
                    await LogError(existingOrder.CustomerID, "Bütçe Aşımı",
                        $"Sipariş güncellenemedi. Müşterinin bütçesi aşıldı. ProductID: {item.ProductID}");
                    throw new InvalidOperationException($"Müşterinin bütçesi aşıldı. ProductID: {item.ProductID}");
                }

                existingOrder.OrderItems.Add(new OrderItem
                {
                    ProductID = item.ProductID,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price
                });
            }

            existingOrder.OrderDate = orderDto.OrderDate;
            existingOrder.OrderStatus = orderDto.OrderStatus;

            await _context.SaveChangesAsync();

            await LogSuccess(existingOrder.CustomerID, existingOrder.OrderID, "Güncelleme",
                $"Sipariş güncellendi. Sipariş ID: {existingOrder.OrderID}, Müşteri ID: {existingOrder.CustomerID}, " +
                $"Yeni Sipariş Durumu: {existingOrder.OrderStatus}, Yeni Sipariş Tarihi: {existingOrder.OrderDate}.");

            Console.WriteLine($"UpdateOrder completed at {DateTime.Now} for OrderID: {id}");

            return await GetOrder(id);
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task<(bool Success, string ErrorMessage)> DeleteOrder(int id)
    {
        await _semaphore.WaitAsync();
        try
        {
            Console.WriteLine($"DeleteOrder started at {DateTime.Now} for OrderID: {id}");

            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.OrderID == id);

            if (order == null)
                return (false, $"ID {id} ile eşleşen bir sipariş bulunamadı.");

            _context.OrderItems.RemoveRange(order.OrderItems);
            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            await LogSuccess(order.CustomerID, order.OrderID, "Silme",
                $"Bir sipariş silindi. Sipariş ID: {order.OrderID}, Müşteri ID: {order.CustomerID}, " +
                $"Sipariş Durumu: {order.OrderStatus}, Sipariş Tarihi: {order.OrderDate}.");

            Console.WriteLine($"DeleteOrder completed at {DateTime.Now} for OrderID: {id}");

            return (true, string.Empty);
        }
        catch (Exception ex)
        {
            return (false, $"Sipariş silinirken bir hata oluştu: {ex.Message}");
        }
        finally
        {
            _semaphore.Release();
        }
    }

    private async Task LogError(int customerId, string logType, string details)
    {
        await _logService.CreateLog(new LogDTO
        {
            CustomerID = customerId,
            LogDate = DateTime.UtcNow,
            LogType = logType,
            LogDetails = details
        });
    }

    private async Task LogSuccess(int customerId, int orderId, string logType, string details)
    {
        await _logService.CreateLog(new LogDTO
        {
            CustomerID = customerId,
            OrderID = orderId,
            LogDate = DateTime.UtcNow,
            LogType = logType,
            LogDetails = details
        });
    }
    public async Task ApproveOrdersAndCalculatePriority()
    {
        await _semaphore.WaitAsync();
        try
        {
            var pendingOrders = await _context.Orders
                .Where(o => o.OrderStatus == "Bekliyor" && !o.Onay)
                .Include(o => o.Customer)
                .ToListAsync();

            if (!pendingOrders.Any())
                return;

            var now = DateTime.Now;

            foreach (var order in pendingOrders)
            {
                // Temel öncelik skoru
                decimal baseScore = order.Customer.CustomerType == "Premium" ? 20m : 10m;
                System.Console.WriteLine(order.Customer.CustomerType);
                // Bekleme süresi (saniye)
                double waitingTimeInSeconds = (now - order.OrderDate).TotalSeconds;

                // Bekleme süresi puanı (her saniye için 0.5 puan)
                decimal waitingScore = (decimal)(waitingTimeInSeconds * 0.5);

                order.PriorityScore = baseScore + waitingScore;
                order.Onay = true;
                order.OrderStatus = "Onaylandı";

                // Onay logu
                await _context.Logs.AddAsync(new Log
                {
                    CustomerID = order.CustomerID,
                    OrderID = order.OrderID,
                    LogDate = now,
                    LogType = "Sipariş Onaylandı",
                    LogDetails = $"Temel Puan: {baseScore}, " +
                               $"Bekleme Süresi: {waitingTimeInSeconds:F2} sn, " +
                               $"Bekleme Puanı: {waitingScore:F2}, " +
                               $"Toplam Öncelik: {order.PriorityScore:F2}"
                });
            }

            await _context.SaveChangesAsync();
        }
        finally
        {
            _semaphore.Release();
        }
    }


    public async Task<List<OrderDTO>> GetPendingApprovalOrders()
    {
        var orders = await _context.Orders
            .Where(o => !o.Onay) // Sadece onay bekleyen siparişler
            .Include(o => o.OrderItems) // Sipariş detayları da eklensin
            .ToListAsync();

        return orders.Select(order => new OrderDTO
        {
            //OrderID = order.OrderID,
            CustomerID = order.CustomerID,
            OrderDate = order.OrderDate,
            OrderStatus = order.OrderStatus,
            OrderItems = order.OrderItems.Select(item => new OrderItemDTO
            {
                ProductID = item.ProductID,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice
            }).ToList()
        }).ToList();
    }

    public async Task DistributeProductsByPriority()
    {
        await _semaphore.WaitAsync();
        try
        {
            var approvedOrders = await _context.Orders
                .Where(o => o.Onay && o.OrderStatus == "Onaylandı")
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Include(o => o.Customer)
                .OrderByDescending(o => o.PriorityScore)
                .ToListAsync();

            foreach (var order in approvedOrders)
            {
                bool orderComplete = true;
                decimal totalOrderCost = 0;

                // Toplam sipariş tutarını hesapla
                foreach (var item in order.OrderItems)
                {
                    totalOrderCost += item.Quantity * item.UnitPrice;
                }

                // Bütçe kontrolü
                if (order.Customer.Budget < totalOrderCost)
                {
                    order.OrderStatus = "Bütçe Yetersiz";
                    await _context.Logs.AddAsync(new Log
                    {
                        CustomerID = order.CustomerID,
                        OrderID = order.OrderID,
                        LogDate = DateTime.Now,
                        LogType = "Bütçe Yetersiz",
                        LogDetails = $"Sipariş tutarı: {totalOrderCost:C}, Mevcut bütçe: {order.Customer.Budget:C}"
                    });
                    continue;
                }

                // Stok kontrolü ve güncelleme
                foreach (var item in order.OrderItems)
                {
                    var product = item.Product;
                    if (product.Stock < item.Quantity)
                    {
                        orderComplete = false;
                        order.OrderStatus = "Stok Yetersiz";
                        await _context.Logs.AddAsync(new Log
                        {
                            CustomerID = order.CustomerID,
                            OrderID = order.OrderID,
                            LogDate = DateTime.Now,
                            LogType = "Stok Yetersiz",
                            LogDetails = $"Ürün: {product.ProductName}, İstenen: {item.Quantity}, Mevcut stok: {product.Stock}"
                        });
                        break;
                    }
                }

                if (orderComplete)
                {
                    // Stok ve bütçe güncellemeleri
                    foreach (var item in order.OrderItems)
                    {
                        item.Product.Stock -= item.Quantity;
                    }

                    order.Customer.Budget -= totalOrderCost;
                    order.Customer.TotalSpent += totalOrderCost;
                    order.OrderStatus = "Tamamlandı";

                    // Başarılı dağıtım logu
                    await _context.Logs.AddAsync(new Log
                    {
                        CustomerID = order.CustomerID,
                        OrderID = order.OrderID,
                        LogDate = DateTime.Now,
                        LogType = "Sipariş Dağıtıldı",
                        LogDetails = $"Toplam tutar: {totalOrderCost:C}, " +
                                   $"Kalan bütçe: {order.Customer.Budget:C}, " +
                                   $"Öncelik puanı: {order.PriorityScore}"
                    });
                }
            }

            await _context.SaveChangesAsync();
        }
        finally
        {
            _semaphore.Release();
        }
    }

    private async Task<decimal> CalculatePriorityScore(Order order, DateTime now)
    {
        // CustomerType'ı veritabanından al
        var customerType = await _context.Customers
            .Where(c => c.CustomerID == order.CustomerID)
            .Select(c => c.CustomerType)
            .FirstOrDefaultAsync() ?? "Standard";

        decimal baseScore = customerType == "Premium" ? 20m : 10m;
        double waitingTimeInSeconds = (now - order.OrderDate).TotalSeconds;
        decimal waitingScore = (decimal)(waitingTimeInSeconds * 0.5);
        
        return baseScore + waitingScore;
    }
}

public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }
}

public class ValidationException : Exception
{
    public ValidationException(string message) : base(message) { }
}