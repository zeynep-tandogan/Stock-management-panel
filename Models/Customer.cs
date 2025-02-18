namespace yazlab3.Models
{
    public class Customer
    {
        public int CustomerID { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public decimal Budget { get; set; }
        public string CustomerType { get; set; } = "Standart";
        public decimal TotalSpent { get; set; }

        // İlişkiler
        public ICollection<Order>? Orders { get; set; }
        public ICollection<Log>? Logs { get; set; }
    }
}
