using Microsoft.AspNetCore.Mvc;
using yazlab3.Data;
using yazlab3.Models;
using yazlab3.Dto;
using Microsoft.Extensions.Logging;

namespace yazlab3.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LogController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<LogController> _logger;

        public LogController(AppDbContext context, ILogger<LogController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Log
        [HttpGet]
        public IActionResult GetLogs()
        {
            var logs = _context.Logs
                .Select(l => new LogDTO
                {
                    CustomerID = l.CustomerID,
                    OrderID = l.OrderID ?? 0,
                    LogDate = l.LogDate,
                    LogType = l.LogType ?? string.Empty, 
                    LogDetails = l.LogDetails
                }).ToList();

            return Ok(logs);
        }

        // GET: api/Log/{id}
        [HttpGet("{id}")]
        public IActionResult GetLog(int id)
        {
            var log = _context.Logs
                .Where(l => l.LogID == id)
                .Select(l => new LogDTO
                {
                    CustomerID = l.CustomerID,
                    OrderID = l.OrderID ?? 0,
                    LogDate = l.LogDate,
                    LogType = l.LogType ?? string.Empty, 
                    LogDetails = l.LogDetails
                }).FirstOrDefault();

            if (log == null)
            {
                return NotFound();
            }

            return Ok(log);
        }

        // POST: api/Log
        [HttpPost]
        public async Task<IActionResult> CreateLog([FromBody] LogDTO logDto)
        {
            try
            {
                _logger.LogInformation("Log oluşturma isteği alındı: {@LogDto}", logDto);

                if (logDto == null)
                {
                    _logger.LogWarning("Log verisi boş geldi");
                    return BadRequest("Log bilgisi eksik.");
                }

                var newLog = new Log
                {
                    CustomerID = logDto.CustomerID,
                    OrderID = logDto.OrderID > 0 ? logDto.OrderID : null,
                    LogDate = logDto.LogDate,
                    LogType = logDto.LogType ?? "Bilinmeyen",
                    LogDetails = logDto.LogDetails ?? "Detay yok"
                };

                _logger.LogInformation("Yeni log oluşturuluyor: {@Log}", newLog);

                await _context.Logs.AddAsync(newLog);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Log başarıyla oluşturuldu. LogID: {LogID}", newLog.LogID);

                return CreatedAtAction(nameof(GetLog), new { id = newLog.LogID }, logDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Log oluşturulurken hata oluştu: {Message}", ex.Message);
                return StatusCode(500, new { error = "Log oluşturulurken bir hata oluştu", details = ex.Message });
            }
        }

        // DELETE: api/Log/{id}
        [HttpDelete("{id}")]
        public IActionResult DeleteLog(int id)
        {
            var log = _context.Logs.Find(id);
            if (log == null)
            {
                return NotFound();
            }

            _context.Logs.Remove(log);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
