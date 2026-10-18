using System;
using System.ComponentModel.DataAnnotations;

namespace KayanERP.Shared.DTOs
{
    public class InitialStockDto
    {
        [Required(ErrorMessage = "يجب تحديد الصنف.")]
        public long ItemId { get; set; }

        [Required(ErrorMessage = "يجب تحديد المخزن.")]
        public long WarehouseId { get; set; }

        [Range(0.001, double.MaxValue, ErrorMessage = "يجب أن تكون الكمية أكبر من الصفر.")]
        public decimal Quantity { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "سعر الوحدة لا يمكن أن يكون سالباً.")]
        public decimal UnitCost { get; set; }

        public string? Notes { get; set; }
    }
}