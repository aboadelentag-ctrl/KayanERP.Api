using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace KayanERP.Shared.DTOs
{
    public class PurchaseRequestItemLookupDto
    {
        public long Id { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
    }

    public class PurchaseRequestDepartmentLookupDto
    {
        public long Id { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
    }

    public class PurchaseRequestWarehouseLookupDto
    {
        public long Id { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
    }

    public class PurchaseRequestDto
    {
        public long Id { get; set; }
        public string RequestNumber { get; set; } = string.Empty;
        public DateTime RequestDate { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public List<PurchaseRequestLineDto> Lines { get; set; } = new();
    }

    public class PurchaseRequestLineDto
    {
        public long Id { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public decimal RequestedQty { get; set; }
    }

    public class PurchaseRequestCreateDto
    {
        [Required] public long DepartmentId { get; set; }
        public long? WarehouseId { get; set; }
        public string? Notes { get; set; }

        [Required]
        [MinLength(1)]
        public List<PurchaseRequestLineCreateDto> Lines { get; set; } = new();
    }

    public class PurchaseRequestLineCreateDto
    {
        [Required] public long ItemId { get; set; }
        [Range(0.01, double.MaxValue)] public decimal RequestedQty { get; set; }
    }
}