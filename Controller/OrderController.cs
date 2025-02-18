using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using yazlab3.Dto;
using yazlab3.Data;

using yazlab3.Services;

namespace yazlab3.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly OrderService _orderService;
        private readonly AppDbContext _context;
        private readonly ILogger<OrderController> _logger;

        public OrderController(OrderService orderService, AppDbContext context, ILogger<OrderController> logger)
        {
            _orderService = orderService;
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetOrders()
        {
            try
            {
                var orders = await _orderService.GetOrders();
                if (!orders.Any())
                {
                    return NotFound("Henüz herhangi bir sipariş bulunmamaktadır.");
                }
                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Siparişler getirilirken hata: {ex.Message}");
                return StatusCode(500, "Siparişler getirilirken bir hata oluştu.");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrder(int id)
        {
            try
            {
                var order = await _orderService.GetOrder(id);
                if (order == null)
                {
                    return NotFound($"ID {id} ile eşleşen bir sipariş bulunamadı.");
                }
                return Ok(order);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Sipariş getirme hatası (ID: {id}): {ex.Message}");
                return StatusCode(500, "Sipariş getirilirken bir hata oluştu.");
            }
        }

        [HttpPost("createOrder")]
        public async Task<IActionResult> CreateOrder([FromBody] OrderDTO orderDto)
        {
            try
            {
                _logger.LogInformation($"Gelen sipariş verisi: {JsonSerializer.Serialize(orderDto)}");

                // Müşteri kontrolü
                var customerName = HttpContext.Request.Headers["CustomerName"].ToString();
                _logger.LogInformation($"Gelen müşteri adı: {customerName}");

                var customer = await _context.Customers
                    .FirstOrDefaultAsync(c => c.CustomerName == customerName);

                if (customer == null)
                {
                    _logger.LogWarning($"Müşteri bulunamadı: {customerName}");
                    return BadRequest(new { message = "Müşteri bulunamadı" });
                }

                // Bulunan müşterinin ID'sini kullan
                orderDto.CustomerID = customer.CustomerID;
                _logger.LogInformation($"Müşteri ID bulundu: {customer.CustomerID}");

                var result = await _orderService.CreateOrder(orderDto);

                if (result == null)
                {
                    return BadRequest(new { message = "Sipariş oluşturulamadı." });
                }

                return CreatedAtAction(nameof(GetOrder), 
                    new { id = result.OrderID }, 
                    new { 
                        message = "Sipariş başarıyla oluşturuldu", 
                        orderId = result.OrderID 
                    });
            }
            catch (ValidationException ex)
            {
                _logger.LogError($"Validasyon hatası: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Sipariş oluşturma hatası: {ex.Message}");
                return StatusCode(500, new { message = "Sipariş oluşturulurken bir hata oluştu", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrder(int id, [FromBody] OrderDTO orderDto)
        {
            try
            {
                var result = await _orderService.UpdateOrder(id, orderDto);
                if (result == null)
                {
                    return BadRequest("Sipariş güncellenemedi.");
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Sipariş güncelleme hatası (ID: {id}): {ex.Message}");
                return StatusCode(500, "Sipariş güncellenirken bir hata oluştu.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            try
            {
                var (success, errorMessage) = await _orderService.DeleteOrder(id);
                if (success)
                {
                    return Ok(new { message = "Sipariş başarıyla silindi" });
                }
                return NotFound(new { message = errorMessage });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Sipariş silme hatası (ID: {id}): {ex.Message}");
                return StatusCode(500, "Sipariş silinirken bir hata oluştu.");
            }
        }

        [HttpPut("approve-and-distribute")]
        public async Task<IActionResult> ApproveAndDistributeOrders()
        {
            try
            {
                var pendingOrders = await _orderService.GetPendingApprovalOrders();
                if (!pendingOrders.Any())
                {
                    return BadRequest("Onay bekleyen herhangi bir sipariş bulunmamaktadır.");
                }

                await _orderService.ApproveOrdersAndCalculatePriority();
                await _orderService.DistributeProductsByPriority();

                return Ok("Siparişler onaylandı ve ürünler öncelik sırasına göre dağıtıldı.");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Sipariş onaylama ve dağıtma hatası: {ex.Message}");
                return StatusCode(500, $"Bir hata oluştu: {ex.Message}");
            }
        }
    }
}
