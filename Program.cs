using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using yazlab3.Data;
using yazlab3.Services;


var builder = WebApplication.CreateBuilder(args);

// Veritaban� ba�lant�s�
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        new MySqlServerVersion(new Version(8, 0, 30))));

builder.Services.AddScoped<CustomerService>();

// CORS (iste�e ba�l�)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader());
});

builder.Services.AddControllers();

// Swagger Servisi Ekleyin
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<OrderService>();
builder.Services.AddScoped<LogService>();
builder.Services.AddScoped<IAuthService, AuthService>();

var app = builder.Build();


// CORS Middleware
app.UseCors("AllowAll");
app.UseStaticFiles();
app.UseRouting();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API v1");
        c.RoutePrefix = string.Empty; // Swagger'� ana URL'de a�ar
    });
}

app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Hata: {ex.Message}");
        Console.WriteLine($"Detaylar: {ex.StackTrace}");

        context.Response.StatusCode = 500;
        await context.Response.WriteAsync("Bir hata oluştu!");
    }
});

app.UseAuthorization();

app.MapControllers(); // API yollar�n� haritaland�r�r

app.Run();
