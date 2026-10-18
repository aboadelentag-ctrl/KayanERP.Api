using System;
using System.ComponentModel.DataAnnotations;

namespace KayanERP.Shared.DTOs
{
    public class SupplierItemPriceDto
    {
        public long Id { get; set; }
        public long SupplierId { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public long ItemId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public DateTime EffectiveDate { get; set; }
    }

    public class CreateSupplierPriceDto
    {
        [Required] public long SupplierId { get; set; }
        [Required] public long ItemId { get; set; }
        [Range(0.01, double.MaxValue)] public decimal Price { get; set; }
        public DateTime? EffectiveDate { get; set; }
    }
}