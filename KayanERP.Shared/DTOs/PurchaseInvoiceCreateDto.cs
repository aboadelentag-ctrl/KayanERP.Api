using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace KayanERP.Shared.DTOs
{
    public class PurchaseInvoiceCreateDto
    {
        [Required]
        public long SupplierId { get; set; }

        public string? InvoiceNumber { get; set; }
        public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
        public string? Notes { get; set; }

        [Required]
        [MinLength(1)]
        public List<PurchaseInvoiceLineDto> InvoiceLines { get; set; } = new();
    }

    public class PurchaseInvoiceLineDto
    {
        [Required]
        public long ItemId { get; set; }

        [Range(0.01, double.MaxValue)]
        public decimal Quantity { get; set; }

        [Range(0.01, double.MaxValue)]
        public decimal UnitPrice { get; set; }
    }
}