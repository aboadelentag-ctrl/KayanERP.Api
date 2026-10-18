using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace KayanERP.Shared.DTOs
{
    public class TransferLookupsDto
    {
        public List<TransferWarehouseLookupDto> Warehouses { get; set; } = new();
        public List<FinishedItemLookupDto> FinishedItems { get; set; } = new();
    }

    public class TransferWarehouseLookupDto
    {
        public int Id { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
        public string WarehouseCode { get; set; } = string.Empty;
        public string WarehouseType { get; set; } = string.Empty;
    }

    public class FinishedItemLookupDto
    {
        public int Id { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string ItemType { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public int? DepartmentId { get; set; }
        public int? ShelfLifeDays { get; set; }
    }

    public class FinishedGoodsTransferViewDto
    {
        public long Id { get; set; }
        public string TransferNumber { get; set; } = string.Empty;
        public DateOnly TransferDate { get; set; }
        public string SourceWarehouseName { get; set; } = string.Empty;
        public string DestinationWarehouseName { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string ItemCode { get; set; } = string.Empty;
        public string BatchNumber { get; set; } = string.Empty;
        public DateOnly? ExpiryDate { get; set; }
        public decimal ProdDispatchedQty { get; set; }
        public int ProdDispatchedCount { get; set; }
        public string? ProdNotes { get; set; }
        public decimal? CostingActualQty { get; set; }
        public int? CostingActualCount { get; set; }
        public decimal? CostingWeightDiff { get; set; }
        public int? CostingCountDiff { get; set; }
        public bool CostingDiscrepancyFlag { get; set; }
        public string? CostingDisputeStatus { get; set; }
        public string? CostingDisputeReason { get; set; }
        public string? CostingDisputeChargeTo { get; set; }
        public decimal? QcApprovedQty { get; set; }
        public decimal? QcSampleQty { get; set; }
        public decimal? QcReworkQty { get; set; }
        public decimal? QcScrapQty { get; set; }
        public decimal? ReceivedActualQty { get; set; }
        public int? ReceivedActualCount { get; set; }
        public bool HasDispute { get; set; }
        public string? DisputeReason { get; set; }
        public string? DisputeStatus { get; set; }
        public string? ControlDisputeChargeTo { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class CreateTransferRequestDto
    {
        [Required(ErrorMessage = "يجب تحديد مخزن المصدر (صالة التشغيل).")]
        public int SourceWarehouseId { get; set; }

        [Required(ErrorMessage = "يجب تحديد مخزن الوجهة (الكنترول).")]
        public int DestinationWarehouseId { get; set; }

        [Required(ErrorMessage = "يجب تحديد الصنف.")]
        public int ItemId { get; set; }

        public string? BatchNumber { get; set; }
        public DateOnly? ExpiryDate { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "الكمية الوزنية يجب أن تكون صفر أو أكثر.")]
        public decimal DispatchedQty { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "عدد الصاجات يجب أن يكون صفر أو أكثر.")]
        public int DispatchedCount { get; set; }

        public string? Notes { get; set; }

        [Required(ErrorMessage = "يجب تحديد اسم المُسلّم.")]
        public string SubmittedBy { get; set; } = string.Empty;
    }

    public class CostingAuditDto
    {
        [Required] public long TransferId { get; set; }
        [Required] public decimal ActualWeight { get; set; }
        [Required] public int ActualCount { get; set; }
        [Required] public string AuditorName { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public bool EscalateDispute { get; set; }
    }

    public class ResolveCostingDisputeDto
    {
        [Required] public long TransferId { get; set; }
        [Required] public decimal FinalAcceptedWeight { get; set; }
        [Required] public int FinalAcceptedCount { get; set; }
        [Required] public string ResolvedBy { get; set; } = string.Empty;
        [Required] public string ChargeTo { get; set; } = string.Empty;
        public string? ResolutionNotes { get; set; }
    }

    public class QcInspectionDto
    {
        [Required] public long TransferId { get; set; }
        [Range(0, double.MaxValue)] public decimal SampleQty { get; set; }
        [Range(0, double.MaxValue)] public decimal ReworkQty { get; set; }
        [Range(0, double.MaxValue)] public decimal ScrapQty { get; set; }
        [Required] public string InspectorName { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    public class ReSubmitReworkDto
    {
        [Required] public long TransferId { get; set; }
        [Required] public decimal AdjustedQty { get; set; }
        [Required] public int AdjustedCount { get; set; }
        public string? Notes { get; set; }
    }

    public class ControlReceiptDto
    {
        [Required] public long TransferId { get; set; }
        [Required] public decimal ReceivedQty { get; set; }
        [Required] public int ReceivedCount { get; set; }
        [Required] public string ReceiverName { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    public class ResolveDisputeDto
    {
        [Required] public long TransferId { get; set; }
        [Required] public decimal FinalAcceptedQty { get; set; }
        [Required] public string ResolvedBy { get; set; } = string.Empty;
        [Required] public string ChargeTo { get; set; } = string.Empty;
        public string? ResolutionNotes { get; set; }
    }
}