using System.ComponentModel.DataAnnotations;

namespace yazlab3.Dto
{
    public class CustomerDTO
    {
        public int? CustomerID { get; set; }
        [Required]
        public string CustomerName { get; set; } = string.Empty;
        public decimal Budget { get; set; }
        [Required]
        public string CustomerType { get; set; } = "standart";
    }

}
