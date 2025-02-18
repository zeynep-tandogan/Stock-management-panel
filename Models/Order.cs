using yazlab3.Models;

public class Order
{
    public int OrderID { get; set; }
    public int CustomerID { get; set; }
    public Customer Customer { get; set; }
    public DateTime OrderDate { get; set; }
    public string OrderStatus { get; set; } = string.Empty;
    public bool Onay { get; set; } = false; // Yeni sütun eklendi
    public decimal PriorityScore { get; set; } // Öncelik skoru


    // İlişkiler
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<Log> Logs { get; set; } = new List<Log>();

    // Toplam fiyat hesaplama - eğer gerekirse
    public decimal TotalPrice => OrderItems.Sum(item => item.TotalPrice);
}