namespace KayanERP.Api.Models;

public class JournalEntry : Interfaces.ITenantEntity
{
    public long Id { get; set; }
    public long CompanyId { get; set; }

    // الحقول التي طلبها الكومبايلر للربط مع الكود القديم
    public string EntryNumber { get; set; } = string.Empty;
    public string ReferenceType { get; set; } = string.Empty;
    public string ReferenceNumber { get; set; } = string.Empty;

    public System.DateTime EntryDate { get; set; }
    public string Status { get; set; } = "DRAFT";
    public string Notes { get; set; } = string.Empty;

    public System.DateTime CreatedAt { get; set; } = System.DateTime.UtcNow;

    public System.Collections.Generic.ICollection<JournalEntryLine> Lines { get; set; } = new System.Collections.Generic.List<JournalEntryLine>();
}