namespace yazlab3.Models
{
    public class Log
    {
        public int LogID { get; set; }
        public int CustomerID { get; set; }
        public int? OrderID { get; set; }
        public DateTime LogDate { get; set; } = DateTime.Now.AddHours(3);
        public string? LogType { get; set; }
        public string LogDetails { get; set; }

        // Navigation property
        public virtual Customer Customer { get; set; }
        public virtual Order Order { get; set; }
    }
}
