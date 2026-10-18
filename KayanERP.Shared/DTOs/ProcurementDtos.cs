using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace KayanERP.Shared.DTOs
{
    public class ProcurementPendingRequestDto
    {
        public long RequestId { get; set; }
        public string RequestNumber { get; set; } = string.Empty;
        public DateTime RequestDate { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public string RequestedBy { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public List<ProcurementPendingLineDto> Lines { get; set; } = new();
    }

    public class ProcurementPendingLineDto
    {
        public long LineId { get; set; }
        public long ItemId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public decimal RequestedQty { get; set; }
        public decimal? LastPurchasePrice { get; set; }
    }

    public class ProcurementConvertDto
    {
        [Required]
        public long RequestId { get; set; }

        [Required]
        public long SupplierId { get; set; }

        [Required]
        [MinLength(1)]
        public List<ProcurementConvertLineDto> Lines { get; set; } = new();
    }

    public class ProcurementConvertLineDto
    {
        [Required]
        public long LineId { get; set; }
        [Required]
        public decimal AgreedPrice { get; set; }
        public decimal ConvertedQty { get; set; }
    }

    public class ProcurementApprovedInvoiceDto
    {
        public long InvoiceId { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public DateTime InvoiceDate { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}