namespace KayanERP.Api.Models;

public class PriceList : Interfaces.ITenantEntity
{
    public long Id { get; set; }
    public long CompanyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public System.Collections.Generic.ICollection<PriceListItem> Items { get; set; } = new System.Collections.Generic.List<PriceListItem>();
}