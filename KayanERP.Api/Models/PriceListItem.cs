namespace KayanERP.Api.Models;

public class PriceListItem
{
    public long Id { get; set; }
    public long PriceListId { get; set; }
    public PriceList? PriceList { get; set; }
    public long ItemId { get; set; }
    public Item? Item { get; set; }
    public decimal SellingPrice { get; set; }
}