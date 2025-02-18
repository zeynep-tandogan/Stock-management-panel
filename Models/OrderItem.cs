namespace yazlab3.Models
{
    public class OrderItem
    {
        public int OrderItemID { get; set; } // Primary Key

        public int OrderID { get; set; } // Foreign Key
        public Order Order { get; set; }

        public int ProductID { get; set; } // Foreign Key
        public Product Product { get; set; }

        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; } // Ürünün birim fiyatı
        public decimal TotalPrice => Quantity * UnitPrice; // Toplam fiyat
    }
}
