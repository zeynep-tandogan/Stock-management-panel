using yazlab3.Data;
using yazlab3.Models;
using yazlab3.Dto;
using Microsoft.EntityFrameworkCore;

namespace yazlab3.Services
{
    public class CustomerService
    {
        private readonly AppDbContext _context;

        public CustomerService(AppDbContext context)
        {
            _context = context;
        }

        //Tüm müþterileri DTO olarak döndürmek için GetAllCustomers metodu
        public List<CustomerDTO> GetAllCustomers()
        {
            return _context.Customers
                .Select(c => new CustomerDTO
                {
                    CustomerID = c.CustomerID,
                    CustomerName = c.CustomerName,
                    Budget = c.Budget,
                    CustomerType = c.CustomerType
                })
                .ToList();
        }

        //Id'ye göre müþteri döndüren GetCustomerById metodu
        public async Task<CustomerDTO> GetCustomerById(int id)
        {
            var customer = await _context.Customers
                .Where(c => c.CustomerID == id)
                .Select(c => new CustomerDTO
                {
                    CustomerID = c.CustomerID,
                    CustomerName = c.CustomerName,
                    Budget = c.Budget,
                    CustomerType = c.CustomerType
                })
                .FirstOrDefaultAsync();
            
            return customer ?? throw new NotFoundException($"Customer with ID {id} not found.");
        }

        //Müþteri oluþturan CreateCustomer metodu
        public Customer CreateCustomer(CustomerDTO customerDto)
        {
            var newCustomer = new Customer
            {
                CustomerName = customerDto.CustomerName,
                Budget = customerDto.Budget,
                CustomerType = customerDto.CustomerType,
                TotalSpent = 0
            };

            _context.Customers.Add(newCustomer);
            _context.SaveChanges();

            return newCustomer;
        }

        //Müþteri güncelleyen UpdateCustomer metodu
        public void UpdateCustomer(int id, CustomerDTO customerDto)
        {
            var existingCustomer = _context.Customers.Find(id);
            if (existingCustomer == null)
                throw new NotFoundException("Müþteri bulunamadý.");

            existingCustomer.CustomerName = customerDto.CustomerName;
            existingCustomer.Budget = customerDto.Budget;
            existingCustomer.CustomerType = customerDto.CustomerType;

            _context.SaveChanges();
        }

        //Müþteri silen DeleteCustomer metodu
        public void DeleteCustomer(int id)
        {
            var customer = _context.Customers.Find(id);
            if (customer == null)
                throw new NotFoundException("Müþteri bulunamadý.");

            _context.Customers.Remove(customer);
            _context.SaveChanges();
        }

        //Premium müþteri oluþturan CreatePremiumCustomer metodu
        public Customer CreatePremiumCustomer(CustomerDTO customerDto)
        {
            var newCustomer = new Customer
            {
                CustomerName = customerDto.CustomerName,
                Budget = new Random().Next(2000, 3001),
                TotalSpent = new Random().Next(2000, 5001),
                CustomerType = "Premium"
            };

            _context.Customers.Add(newCustomer);
            _context.SaveChanges();

            return newCustomer;
        }


        //Standart müþteri oluþturan CreateStandardCustomer metodu
        public Customer CreateStandardCustomer(CustomerDTO customerDto)
        {
            var newCustomer = new Customer
            {
                CustomerName = customerDto.CustomerName,
                Budget = new Random().Next(500, 2000),
                TotalSpent = new Random().Next(0, 2000),
                CustomerType = "Standard"
            };

            _context.Customers.Add(newCustomer);
            _context.SaveChanges();

            return newCustomer;
        }


        public async Task<bool> CheckBudget(int customerId, int quantity, decimal unitPrice)
        {
            var customer = await _context.Customers.FindAsync(customerId);
            if (customer == null)
            {
                return false;
            }
            var totalPrice = quantity * unitPrice;
            return customer.Budget >= totalPrice;
        }

        //--------------------------------------------
/*
        public async Task<Customer> GetCustomerByIdAsync(int customerId)
        {
            return await _context.Customers.FirstOrDefaultAsync(c => c.CustomerID == customerId);
        }
*/
        public async Task<bool> CheckBudgetAsync(int customerId, decimal totalCost)
        {
            var customer = await _context.Customers.FindAsync(customerId);
            if (customer == null)
                throw new ValidationException($"CustomerID {customerId} mevcut değil.");

            return customer.Budget >= totalCost;
        }

        public async Task DecreaseBudgetAsync(int customerId, decimal amount)
        {

            var customer = await _context.Customers.FindAsync(customerId);
            if (customer == null)
                throw new ValidationException($"CustomerID {customerId} mevcut değil.");

            customer.Budget -= amount;
            customer.TotalSpent += amount; 
            await _context.SaveChangesAsync();
        }

        public async Task<decimal> GetCustomerBudget(int customerId)
        {
            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.CustomerID == customerId);

            if (customer == null)
                return 0;

            return customer.Budget;
        }
        
        public async Task<string> GetCustomerType(int customerId)
        {
        // Veritabanında müşteri tipini çekiyoruz
        var customer = await _context.Customers
            .Where(c => c.CustomerID == customerId)
            .Select(c => c.CustomerType)
            .FirstOrDefaultAsync();

        return customer ?? ""; // Eğer müşteri bulunamazsa boş string döndür
        }
    }
}