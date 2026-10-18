using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace KayanERP.Shared.DTOs
{
    public class MaterialReceiptLookupsDto
    {
        public List<SupplierLookupDto> Suppliers { get; set; } = new();
        public List<WarehouseLookupDto> Warehouses { get; set; } = new();
    }

    public class SupplierLookupDto
    {
        public long Id { get; set; }
        public string SupplierName { get; set; } = string.Empty;
    }

    public class PendingInvoiceDto
    {
        public long InvoiceId { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public DateTime InvoiceDate { get; set; }
        public long SupplierId { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public List<PendingInvoiceLineDto> Lines { get; set; } = new();
    }

    public class PendingInvoiceLineDto
    {
        public long LineId { get; set; }
        public long ItemId { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public decimal OrderedQty { get; set; }
        public decimal ReceivedQty { get; set; }
        public decimal RemainingQty { get; set; }
        public decimal UnitPrice { get; set; }
    }

    public class MaterialReceiptPostDto
    {
        [Required]
        public long InvoiceId { get; set; }

        [Required]
        public long WarehouseId { get; set; }

        public string? ReceivedBy { get; set; }
        public string? Notes { get; set; }

        [Required]
        [MinLength(1)]
        public List<MaterialReceiptLineDto> Lines { get; set; } = new();
    }

    public class MaterialReceiptLineDto
    {
        [Required]
        public long LineId { get; set; }
        public decimal ReceivedQty { get; set; }
        public string? BatchNumber { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public bool IsQcPassed { get; set; } = true;
    }

    public class MaterialReceiptResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string ReceiptNumber { get; set; } = string.Empty;
        public decimal TotalReceived { get; set; }
    }
}