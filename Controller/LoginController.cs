using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using yazlab3.Models;
using yazlab3.Services;
using yazlab3.Dto;

namespace yazlab3.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly IAuthService _authService;

        public LoginController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.LoginAsync(loginDto.CustomerName, loginDto.Password);

            if (!result.Success)
                return BadRequest(new { message = result.Message });

            // Kullanıcı bilgilerini logla
            Console.WriteLine($"Giriş yapan kullanıcı bilgileri:");
            Console.WriteLine($"Customer ID: {result.CustomerID}");
            Console.WriteLine($"Customer Name: {result.CustomerName}");
            Console.WriteLine($"Is Admin: {result.IsAdmin}");

            return Ok(new
            {
                success = result.Success,
                customerName = result.CustomerName,
                customerID = result.CustomerID,
                isAdmin = result.IsAdmin
            });
        }
    }
}
