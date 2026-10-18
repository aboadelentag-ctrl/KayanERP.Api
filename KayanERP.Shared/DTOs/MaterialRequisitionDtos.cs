using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace KayanERP.Shared.DTOs
{
    public class RequisitionLookupsDto
    {
        public List<RequisitionDepartmentLookupDto> Departments { get; set; } = new();
        public List<RequisitionWarehouseLookupDto> Warehouses { get; set; } = new();
        public List<RequisitionRawMaterialLookupDto> RawMaterials { get; set; } = new();
    }

    public class RequisitionDepartmentLookupDto
    {
        public long Id { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
    }

    public class RequisitionWarehouseLookupDto
    {
        public long Id { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
    }

    public class RequisitionRawMaterialLookupDto
    {
        public long Id { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string ItemType { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
    }

    public class RequisitionDetailDto
    {
        public long Id { get; set; }
        public string RequisitionNumber { get; set; } = string.Empty;
        public long DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public long FromWarehouseId { get; set; }
        public string FromWarehouseName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string? RequestedBy { get; set; }
        public string? DispatchedBy { get; set; }
        public string? ReceivedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? DispatchedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public List<RequisitionLineDetailDto> Lines { get; set; } = new();
    }

    public class RequisitionLineDetailDto
    {
        public long Id { get; set; }
        public long ItemId { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public long? WarehouseId { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
        public decimal RequestedQty { get; set; }
        public decimal DispatchedQty { get; set; }
        public decimal ReceivedQty { get; set; }
        public string? BatchNumber { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public decimal UnitCost { get; set; }
        public string LineStatus { get; set; } = string.Empty;
        public string? DiscrepancyReason { get; set; }
        public string? WarehouseNotes { get; set; }
    }

    public class CreateRequisitionDto
    {
        [Required]
        public long DepartmentId { get; set; }

        public long FromWarehouseId { get; set; }
        public string? Notes { get; set; }
        public string? RequestedBy { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "يجب إضافة صنف واحد على الأقل.")]
        public List<CreateRequisitionLineDto> Lines { get; set; } = new();
    }

    public class CreateRequisitionLineDto
    {
        [Required]
        public long ItemId { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "الكمية المطلوبة يجب أن تكون أكبر من صفر.")]
        public decimal RequestedQty { get; set; }
    }

    public class FefoBatchSuggestionDto
    {
        public string BatchNumber { get; set; } = string.Empty;
        public DateTime? ExpiryDate { get; set; }
        public decimal AvailableQty { get; set; }
        public decimal UnitCost { get; set; }
    }

    public class DispatchRequisitionDto
    {
        [Required]
        public long RequisitionId { get; set; }
        public string? DispatchedBy { get; set; }

        [Required]
        public List<DispatchRequisitionLineDto> Lines { get; set; } = new();
    }

    public class DispatchRequisitionLineDto
    {
        [Required]
        public long LineId { get; set; }
        public long WarehouseId { get; set; }
        public decimal DispatchedQty { get; set; }
        public string? BatchNumber { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public decimal UnitCost { get; set; }
    }

    public class ReceiveLineItemDto
    {
        [Required]
        public long LineId { get; set; }
        public decimal ReceivedQty { get; set; }
        public bool IsAccepted { get; set; }
        public string? DiscrepancyReason { get; set; }
        public string? ReceivedBy { get; set; }
    }

    public class ResolveDiscrepancyDto
    {
        [Required]
        public long LineId { get; set; }
        public decimal FinalApprovedQty { get; set; }
        public string? WarehouseResolutionNotes { get; set; }
    }

    public class RequisitionLifecycleAuditDto
    {
        public long RequisitionId { get; set; }
        public string RequisitionNumber { get; set; } = string.Empty;
        public DateTime RequestDate { get; set; }
        public long DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public string RequestedBy { get; set; } = string.Empty;
        public string OverallStatus { get; set; } = string.Empty;

        public long ItemId { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;

        public decimal RequestedQty { get; set; }
        public string DispatchedBy { get; set; } = string.Empty;
        public DateTime? DispatchedAt { get; set; }
        public string FromWarehouseName { get; set; } = string.Empty;
        public decimal DispatchedQty { get; set; }

        public string BatchNumber { get; set; } = string.Empty;
        public DateTime? ExpiryDate { get; set; }
        public decimal ReceivedQty { get; set; }
        public string LineStatus { get; set; } = string.Empty;

        public string DisputeStatusTitle { get; set; } = string.Empty;
        public string? DiscrepancyReason { get; set; }
        public decimal FinalApprovedQty { get; set; }
        public decimal ScrapOrLossQty { get; set; }
        public string? ResolutionNotes { get; set; }
        public string FloorStoreName { get; set; } = string.Empty;

        public decimal FloorStockBefore { get; set; }
        public decimal FloorStockAfter { get; set; }
        public decimal CurrentFloorStock { get; set; }
    }
}