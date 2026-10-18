using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace KayanERP.Shared.DTOs
{
    public class PurchaseOrderLookupsDto
    {
        public List<SupplierLookupDto> Suppliers { get; set; } = new();
        public List<WarehouseLookupDto> Warehouses { get; set; } = new();
        public List<ItemLookupDto> Items { get; set; } = new();
    }

    public class PurchaseOrderDto
    {
        public long Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public List<PurchaseOrderLineDto> Lines { get; set; } = new();
    }

    public class PurchaseOrderLineDto
    {
        public long LineId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Total { get; set; }
    }

    public class PurchaseOrderCreateDto
    {
        [Required] public long SupplierId { get; set; }
        [Required] public long WarehouseId { get; set; }
        public DateTime? ExpectedDeliveryDate { get; set; }
        public string? Notes { get; set; }

        [Required]
        [MinLength(1)]
        public List<PurchaseOrderLineCreateDto> Lines { get; set; } = new();
    }

    public class PurchaseOrderLineCreateDto
    {
        [Required] public long ItemId { get; set; }
        [Range(0.01, double.MaxValue)] public decimal Quantity { get; set; }
        [Range(0.01, double.MaxValue)] public decimal UnitPrice { get; set; }
    }

    public class PurchaseOrderResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public long? OrderId { get; set; }
        public string? OrderNumber { get; set; }
    }

    public class PoApproveDto
    {
        [Required] public long OrderId { get; set; }
        [Required] public string InvoiceNumber { get; set; } = string.Empty;
        public string? SupplierInvoiceNumber { get; set; }
        public DateTime? InvoiceDate { get; set; }
    }

    public class MaterialReceiptDto
    {
        [Required] public long PurchaseOrderId { get; set; }
        [Required] public long WarehouseId { get; set; }
        public string? ReceivedBy { get; set; }
        [Required][MinLength(1)] public List<MaterialReceiptLineDto> Lines { get; set; } = new();
    }

    public class PurchaseOrderLookupDto
    {
        public long Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string SupplierName { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
    }
}