namespace yazlab3.Models
{
    public class Product
    {
        public int ProductID { get; set; } // Primary Key
        public string ProductName { get; set; } = string.Empty;
        public int Stock { get; set; }
        public decimal Price { get; set; }

        // İlişkiler
        public ICollection<Order> Orders { get; set; }
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
