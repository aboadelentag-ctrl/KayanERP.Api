namespace KayanERP.Api.Models;

public class EmployeeShift
{
    public long Id { get; set; }
    public long EmployeeId { get; set; }
    public Employee? Employee { get; set; }
    public long ShiftId { get; set; }
    public Shift? Shift { get; set; }
    public System.DateTime WorkDate { get; set; }
    public string Status { get; set; } = "PRESENT";
}