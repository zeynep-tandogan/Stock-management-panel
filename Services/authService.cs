using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using yazlab3.Models;
using yazlab3.Data;

namespace yazlab3.Services
{
    public interface IAuthService
    {
        Task<AuthResult> LoginAsync(string customerName, string password);
    }

    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;

        private const string ADMIN_USERNAME = "admin";
        private const string ADMIN_PASSWORD = "admin";

        public AuthService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<AuthResult> LoginAsync(string customerName, string password)
        {
            // Admin kontrolü
            if (customerName == ADMIN_USERNAME)
            {
                if (password != ADMIN_PASSWORD)
                {
                    Console.WriteLine($"Admin girişi başarısız: Yanlış şifre");
                    return new AuthResult { Success = false, Message = "Admin şifresi yanlış!" };
                }
                
                var adminResult = new AuthResult 
                { 
                    Success = true,
                    CustomerName = "Admin",
                    CustomerID = 0,
                    IsAdmin = true
                };

                Console.WriteLine($"Admin girişi başarılı:");
                Console.WriteLine($"Customer ID: {adminResult.CustomerID}");
                Console.WriteLine($"Customer Name: {adminResult.CustomerName}");
                Console.WriteLine($"Is Admin: {adminResult.IsAdmin}");

                return adminResult;
            }

            // Normal müşteri kontrolü
            var existingCustomer = await _context.Customers
                .FirstOrDefaultAsync(c => c.CustomerName == customerName);
            
            if (existingCustomer == null)
            {
                Console.WriteLine($"Müşteri girişi başarısız: {customerName} bulunamadı");
                return new AuthResult { Success = false, Message = "Müşteri bulunamadı!" };
            }

            var customerResult = new AuthResult 
            { 
                Success = true,
                CustomerName = existingCustomer.CustomerName,
                CustomerID = existingCustomer.CustomerID,
                IsAdmin = false
            };

            Console.WriteLine($"Müşteri girişi başarılı:");
            Console.WriteLine($"Customer ID: {customerResult.CustomerID}");
            Console.WriteLine($"Customer Name: {customerResult.CustomerName}");
            Console.WriteLine($"Is Admin: {customerResult.IsAdmin}");

            return customerResult;
        }
    }

    public class AuthResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public int? CustomerID { get; set; }
        public bool IsAdmin { get; set; }
    }
}
