using System;
using System.ComponentModel.DataAnnotations;

namespace KayanERP.Shared.DTOs
{
    public class VendorQcScoreDto
    {
        public long SupplierId { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public int TotalInspections { get; set; }
        public int PassedInspections { get; set; }
        public int FailedInspections { get; set; }
        public decimal ScorePercentage { get; set; }
    }

    public class QcInspectionHistoryDto
    {
        public long Id { get; set; }
        public long SupplierId { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public DateTime InspectionDate { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public bool IsPassed { get; set; }
        public string? Notes { get; set; }
    }
}