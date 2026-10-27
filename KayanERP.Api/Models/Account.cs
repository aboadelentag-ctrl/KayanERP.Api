namespace KayanERP.Api.Models;

public class Account : Interfaces.ITenantEntity
{
    public long Id { get; set; }
    public long CompanyId { get; set; }
    public string AccountCode { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public string AccountType { get; set; } = string.Empty;
    public long? ParentAccountId { get; set; }
    public Account? ParentAccount { get; set; }
    public System.Collections.Generic.ICollection<Account> SubAccounts { get; set; } = new System.Collections.Generic.List<Account>();

    public bool Active { get; set; } = true;
    public System.DateTime CreatedAt { get; set; } = System.DateTime.UtcNow;
}