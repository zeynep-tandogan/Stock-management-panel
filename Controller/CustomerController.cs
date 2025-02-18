using Microsoft.AspNetCore.Mvc;
using yazlab3.Dto;
using yazlab3.Services;
using Microsoft.Extensions.Logging;

[ApiController]
[Route("api/[controller]")]
public class CustomerController : ControllerBase
{
    private readonly CustomerService _customerService;
    private readonly ILogger<CustomerController> _logger;

    public CustomerController(CustomerService customerService, ILogger<CustomerController> logger)
    {
        _customerService = customerService;
        _logger = logger;
    }

    [HttpGet]
    public IActionResult GetCustomers()
    {
        var customers = _customerService.GetAllCustomers();
        return Ok(customers);
    }

    [HttpGet("{id}")]
    public IActionResult GetCustomer(int id)
    {
        var customer = _customerService.GetCustomerById(id);
        if (customer == null)
            return NotFound();

        return Ok(customer);
    }

    [HttpPost]
    public IActionResult CreateCustomer([FromBody] CustomerDTO customerDto)
    {
        if (customerDto == null)
            return BadRequest("Müşteri verisi eksik.");

        var newCustomer = _customerService.CreateCustomer(customerDto);
        return CreatedAtAction(nameof(GetCustomer), new { id = newCustomer.CustomerID }, customerDto);
    }

    [HttpPut("{id}")]
    public IActionResult UpdateCustomer(int id, [FromBody] CustomerDTO customerDto)
    {
        try
        {
            _customerService.UpdateCustomer(id, customerDto);
            return NoContent();
        }
        catch (NotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteCustomer(int id)
    {
        try
        {
            _customerService.DeleteCustomer(id);
            return NoContent();
        }
        catch (NotFoundException)
        {
            return NotFound();
        }
    }

    // POST: api/Customer/CreatePremium
    [HttpPost("CreatePremium")]
    public IActionResult CreatePremiumCustomer([FromBody] CustomerDTO customerDto)
    {
        if (customerDto == null || string.IsNullOrEmpty(customerDto.CustomerName))
            return BadRequest("Müşteri adı eksik.");

        var newCustomer = _customerService.CreatePremiumCustomer(customerDto);
        return CreatedAtAction(nameof(GetCustomer), new { id = newCustomer.CustomerID }, customerDto);
    }

    // POST: api/Customer/CreateStandard
    [HttpPost("CreateStandard")]
    public IActionResult CreateStandardCustomer([FromBody] CustomerDTO customerDto)
    {
        if (customerDto == null || string.IsNullOrEmpty(customerDto.CustomerName))
            return BadRequest("Müşteri adı eksik.");

        var newCustomer = _customerService.CreateStandardCustomer(customerDto);
        return CreatedAtAction(nameof(GetCustomer), new { id = newCustomer.CustomerID }, customerDto);
    }

    [HttpGet("budget/{customerID}")]
    public async Task<IActionResult> GetCustomerBudget(int customerID)
    {
        try
        {
            var budget = await _customerService.GetCustomerBudget(customerID);
            
            if (budget == 0)
            {
                return NotFound("Müşteri bulunamadı");
            }

            return Ok(new { budget = budget });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
     
    [HttpGet("type/{id}")]
    public async Task<IActionResult> GetCustomerType(int id)
    {
        try
        {
            _logger.LogInformation($"Müşteri tipi isteniyor, ID: {id}");
            var customerType = await _customerService.GetCustomerType(id);

            if (string.IsNullOrEmpty(customerType))
            {
                return NotFound(new { message = "Müşteri bulunamadı." });
            }

            return Ok(new { customerType = customerType });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Müşteri tipi alınırken hata oluştu");
            return StatusCode(500, new { message = "Bir hata oluştu." });
        }
    }
}