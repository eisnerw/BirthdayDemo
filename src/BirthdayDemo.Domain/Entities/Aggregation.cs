namespace BirthdayDemo.Domain
{
    public class Aggregation
    {
        string key { get; set; }
        int doc_count { get; set; }
        object[] distinct { get; set; }
    }
}