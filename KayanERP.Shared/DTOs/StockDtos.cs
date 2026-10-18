using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace KayanERP.Shared.DTOs
{
    // ==========================================
    // 1. نتائج العمليات المخزنية
    // ==========================================
    public class StockOperationResultDto
    {
        public bool Success { get; set; } = true;
        public string Message { get; set; } = string.Empty;
        public decimal CurrentBalance { get; set; }
    }

    // ==========================================
    // 2. عرض الأرصدة (View)
    // ==========================================
    public class StockBalanceViewDto
    {
        public long WarehouseId { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
        public long ItemId { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal AvailableQuantity { get; set; }
        public decimal ReservedQuantity { get; set; }
        public DateTime? LastUpdatedAt { get; set; }
    }

    // ==========================================
    // 3. سجل حركات الصنف (Item Ledger)
    // ==========================================
    public class StockMovementItemLedgerDto
    {
        public long MovementId { get; set; }
        public DateTime MovementDate { get; set; }
        public long WarehouseId { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
        public string MovementType { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal UnitCost { get; set; }
        public string ReferenceType { get; set; } = string.Empty;
        public long? ReferenceId { get; set; }
        public string Notes { get; set; } = string.Empty;
    }

    // ==========================================
    // 4. القوائم المرجعية لشاشة الأرصدة (Lookups)
    // ==========================================
    public class StockLookupsDto
    {
        public List<BranchForBalanceDto> Branches { get; set; } = new();
        public List<WarehouseForBalanceDto> Warehouses { get; set; } = new();
    }

    public class BranchForBalanceDto
    {
        public long Id { get; set; }
        public string BranchCode { get; set; } = string.Empty;
        public string BranchName { get; set; } = string.Empty;
    }

    public class WarehouseForBalanceDto
    {
        public long Id { get; set; }
        public long? BranchId { get; set; }
        public string WarehouseCode { get; set; } = string.Empty;
        public string WarehouseName { get; set; } = string.Empty;
    }

    // ==========================================
    // 5. عناصر قائمة الأرصدة (List Item)
    // ==========================================
    public class StockBalanceListItemDto
    {
        public long Id { get; set; }
        public long WarehouseId { get; set; }
        public string WarehouseCode { get; set; } = string.Empty;
        public string WarehouseName { get; set; } = string.Empty;
        public long? BranchId { get; set; }
        public string BranchName { get; set; } = string.Empty;
        public long ItemId { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal ReservedQuantity { get; set; }
        public decimal AvailableQuantity { get; set; }
        public decimal ReorderLevel { get; set; }
        public decimal SafetyStock { get; set; }
        public decimal BasePrice { get; set; }
        public decimal TotalStock { get; set; }
        public DateTime? LastUpdatedAt { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    // ==========================================
    // 6. مؤشرات الأداء (KPIs)
    // ==========================================
    public class StockKpiSummaryDto
    {
        public int TotalItemsCount { get; set; }
        public decimal TotalStockQuantity { get; set; }
        public decimal TotalAvailableQuantity { get; set; }
        public decimal EstimatedStock { get; set; }
        public int LowStockCount { get; set; }
        public int OutOfStockCount { get; set; }
    }
}