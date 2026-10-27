namespace KayanERP.Api.Models;

public class JournalEntryLine
{
    public long Id { get; set; }
    public long JournalEntryId { get; set; }
    public JournalEntry? JournalEntry { get; set; }
    public long AccountId { get; set; }
    public Account? Account { get; set; }
    public decimal Debit { get; set; }
    public decimal Credit { get; set; }
    public string Description { get; set; } = string.Empty;
}