using yazlab3.Data;
using yazlab3.Models;
using yazlab3.Dto;
using System;
using Microsoft.Extensions.Logging;

public class LogService
{
    private readonly AppDbContext _context;
    private readonly ILogger<LogService> _logger;

    public LogService(AppDbContext context, ILogger<LogService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task CreateLog(LogDTO logDto)
    {
        try
        {
            _logger.LogInformation("LogService - Log oluşturma başladı: {@LogDto}", logDto);

            var log = new Log
            {
                CustomerID = logDto.CustomerID,
                OrderID = logDto.OrderID,
                LogDate = logDto.LogDate,
                LogType = logDto.LogType ?? "Bilinmeyen",
                LogDetails = logDto.LogDetails ?? "Detay yok"
            };

            await _context.Logs.AddAsync(log);
            await _context.SaveChangesAsync();

            _logger.LogInformation("LogService - Log başarıyla oluşturuldu. LogID: {LogID}", log.LogID);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "LogService - Log oluşturulurken hata: {Message}", ex.Message);
            throw; // Hatayı yukarı fırlat
        }
    }
}
