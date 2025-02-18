using yazlab3.Data;
using yazlab3.Models;
using yazlab3.Dto;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using System;
using System.Text.Json;

public class ProductService
{
    private readonly AppDbContext _context;

    public ProductService(AppDbContext context)
    {
        _context = context;
    }

    public List<ProductDTO> GetProducts()
    {
        var products = _context.Products
            .Select(p => new ProductDTO
            {
                id = p.ProductID,
                ProductName = p.ProductName,
                Stock = p.Stock,
                Price = p.Price
            }).ToList();

        Console.WriteLine($"Returning products: {JsonSerializer.Serialize(products)}");
        return products;
    }

    public ProductDTO? GetProduct(int id)
    {
        return _context.Products
            .Where(p => p.ProductID == id)
            .Select(p => new ProductDTO
            {
                id = p.ProductID,
                ProductName = p.ProductName,
                Stock = p.Stock,
                Price = p.Price
            }).FirstOrDefault();
    }

    public bool CreateProduct(ProductDTO productDto, out string errorMessage)
    {
        errorMessage = string.Empty;

        if (productDto == null)
        {
            errorMessage = "Ürün bilgisi eksik.";
            return false;
        }

        var newProduct = new Product
        {
            ProductName = productDto.ProductName,
            Stock = productDto.Stock,
            Price = productDto.Price
        };

        _context.Products.Add(newProduct);
        _context.SaveChanges();

        return true;
    }

    public bool UpdateProduct(int id, ProductDTO productDto, out string errorMessage)
    {
        errorMessage = string.Empty;

        var existingProduct = _context.Products.Find(id);
        if (existingProduct == null)
        {
            errorMessage = "Ürün bulunamadý.";
            return false;
        }

        existingProduct.ProductName = productDto.ProductName;
        existingProduct.Stock = productDto.Stock;
        existingProduct.Price = productDto.Price;

        _context.SaveChanges();
        return true;
    }

    public bool DeleteProduct(int id, out string errorMessage)
    {
        errorMessage = string.Empty;

        var product = _context.Products.Find(id);
        if (product == null)
        {
            errorMessage = "Ürün bulunamadý.";
            return false;
        }

        _context.Products.Remove(product);
        _context.SaveChanges();
        return true;
    }

    public async Task<Product?> GetProductByIdAsync(int productId)
    {
        return await _context.Products.FirstOrDefaultAsync(p => p.ProductID == productId);
    }

    public async Task DecreaseStockAsync(int productId, int quantity)
    {
        var product = await GetProductByIdAsync(productId);
        if (product != null)
        {
            product.Stock -= quantity;
            await _context.SaveChangesAsync();
        }
    }
}