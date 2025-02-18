using System.ComponentModel.DataAnnotations;

namespace yazlab3.Dto
{
    public class ProductDTO
    {
        public int? id { get; set; } // nullable yapıyoruz çünkü her zaman gerekli değil
        [Required]
        public string ProductName { get; set; } = string.Empty;
        public int Stock { get; set; }
        public decimal Price { get; set; }
    }
}
