using Microsoft.AspNetCore.Mvc;
using yazlab3.Dto;
using yazlab3.Services;
using Microsoft.Extensions.Logging;
using System;
using System.Text.Json;

namespace yazlab3.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly ProductService _productService;
        private readonly ILogger<ProductController> _logger;

        public ProductController(ProductService productService, ILogger<ProductController> logger)
        {
            _productService = productService;
            _logger = logger;
        }

        // GET: api/Product
        [HttpGet]
        public IActionResult GetProducts()
        {
            try
            {
                var products = _productService.GetProducts();
                _logger.LogInformation($"Ürünler getirildi: {products.Count} adet");
                return Ok(products);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Ürünler getirilirken hata: {ex.Message}");
                return StatusCode(500, "Ürünler getirilirken bir hata oluştu");
            }
        }

        // GET: api/Product/{id}
        [HttpGet("{id}")]
        public IActionResult GetProduct(int id)
        {
            // Servisten tek bir Product nesnesi al
            var product = _productService.GetProduct(id);

            if (product == null)
            {
                return NotFound();
            }

            // Controller içinde DTO'ya dönüştür
            var productDto = new ProductDTO
            {
                id = product.id,  // ID'yi ekledik
                ProductName = product.ProductName,
                Stock = product.Stock,
                Price = product.Price
            };

            return Ok(productDto);
        }

        // POST: api/Product
        [HttpPost]
        public IActionResult CreateProduct([FromBody] ProductDTO productDto)
        {
            try
            {
                _logger.LogInformation($"Yeni ürün ekleme isteği: {JsonSerializer.Serialize(productDto)}");

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                if (_productService.CreateProduct(productDto, out var errorMessage))
                {
                    _logger.LogInformation("Ürün başarıyla eklendi");
                    return Ok(new { message = "Ürün başarıyla eklendi" });
                }

                return BadRequest(errorMessage);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Ürün eklenirken hata: {ex.Message}");
                return StatusCode(500, "Ürün eklenirken bir hata oluştu");
            }
        }

        // PUT: api/Product/{id}
        [HttpPut("{id}")]
        public IActionResult UpdateProduct(int id, [FromBody] ProductDTO productDto)
        {
            try
            {
                _logger.LogInformation($"Ürün güncelleme isteği - ID: {id}, Data: {JsonSerializer.Serialize(productDto)}");

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                if (_productService.UpdateProduct(id, productDto, out var errorMessage))
                {
                    _logger.LogInformation($"Ürün başarıyla güncellendi - ID: {id}");
                    return Ok(new { message = "Ürün başarıyla güncellendi" });
                }

                return BadRequest(errorMessage);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Ürün güncellenirken hata - ID: {id}, Error: {ex.Message}");
                return StatusCode(500, "Ürün güncellenirken bir hata oluştu");
            }
        }

        // DELETE: api/Product/{id}
        [HttpDelete("{id}")]
        public IActionResult DeleteProduct(int id)
        {
            try
            {
                _logger.LogInformation($"Ürün silme isteği - ID: {id}");

                if (_productService.DeleteProduct(id, out var errorMessage))
                {
                    _logger.LogInformation($"Ürün başarıyla silindi - ID: {id}");
                    return Ok(new { message = "Ürün başarıyla silindi" });
                }

                return BadRequest(errorMessage);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Ürün silinirken hata - ID: {id}, Error: {ex.Message}");
                return StatusCode(500, "Ürün silinirken bir hata oluştu");
            }
        }
    }
}