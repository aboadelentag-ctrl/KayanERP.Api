namespace KayanERP.Api.Models;

public class Shift : Interfaces.ITenantEntity
{
    public long Id { get; set; }
    public long CompanyId { get; set; }
    public string ShiftName { get; set; } = string.Empty;
    public System.TimeSpan StartTime { get; set; }
    public System.TimeSpan EndTime { get; set; }
}