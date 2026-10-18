using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace KayanERP.Shared.DTOs
{
    // Lookups
    public class ProductionOperationsLookupsDto
    {
        public List<ProductionDepartmentLookupDto> Departments { get; set; } = new();
        public List<ProductionWarehouseLookupDto> Warehouses { get; set; } = new();
        public List<ProductionEmployeeLookupDto> Employees { get; set; } = new();
        public List<ProductionItemLookupDto> Items { get; set; } = new();
    }

    public class ProductionDepartmentLookupDto { public long Id { get; set; } public string Name { get; set; } = string.Empty; }
    public class ProductionWarehouseLookupDto { public long Id { get; set; } public string Name { get; set; } = string.Empty; }
    public class ProductionEmployeeLookupDto { public long Id { get; set; } public string Name { get; set; } = string.Empty; }
    public class ProductionItemLookupDto { public long Id { get; set; } public string Name { get; set; } = string.Empty; }

    // Active Orders
    public class ActiveProductionOrderDto
    {
        public long OrderId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CreateBatchOrderDto
    {
        [Required] public long DepartmentId { get; set; }
        [Required] public long WarehouseId { get; set; }
        [Required] public long ItemId { get; set; }
        [Required] public decimal TargetQty { get; set; }
        public DateTime? TargetDate { get; set; }
        public string? Notes { get; set; }
    }

    public class CreateBatchOrderResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public long OrderId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
    }

    // Execution
    public class OrderExecutionFullDto
    {
        public long OrderId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public List<OrderExecutionLineDto> Lines { get; set; } = new();
    }

    public class OrderExecutionLineDto
    {
        public long LineId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public decimal ExecutedQty { get; set; }
        public decimal ScrapQty { get; set; }
    }

    public class CompleteOrderFinalizeDto
    {
        [Required] public long OrderId { get; set; }
        [Required] public List<FinalizeOrderLineDto> Lines { get; set; } = new();
    }

    public class FinalizeOrderLineDto
    {
        [Required] public long LineId { get; set; }
        public decimal FinalQty { get; set; }
        public decimal ScrapQty { get; set; }
    }

    // Productivity & Reporting
    public class ShiftProductivityDto
    {
        [Required] public long DepartmentId { get; set; }
        [Required] public DateTime ShiftDate { get; set; }
        public int ShiftNumber { get; set; }
        public List<ShiftProductivityEmployeeDto> Employees { get; set; } = new();
    }

    public class ShiftProductivityEmployeeDto
    {
        public long EmployeeId { get; set; }
        public decimal WorkingHours { get; set; }
        public bool IsPresent { get; set; }
    }

    public class DepartmentKpiDto
    {
        public long DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public decimal TotalProducedQty { get; set; }
        public decimal ScrapQty { get; set; }
        public decimal ScrapPercentage { get; set; }
    }

    public class DetailedAttendanceLogDto
    {
        public long EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public decimal WorkingHours { get; set; }
        public bool IsPresent { get; set; }
    }

    public class EmployeeDossierDto
    {
        public long EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public decimal TotalWorkingHours { get; set; }
        public List<EmployeeAttendanceLogDto> Logs { get; set; } = new();
    }

    public class EmployeeAttendanceLogDto
    {
        public DateTime Date { get; set; }
        public decimal WorkingHours { get; set; }
    }

    // Cost Calculation
    public class BatchCostCalculationRequestDto
    {
        [Required] public long OrderId { get; set; }
        public decimal LaborCost { get; set; }
        public decimal OverheadCost { get; set; }
    }

    public class BatchCostCalculationResultDto
    {
        public long OrderId { get; set; }
        public decimal MaterialCost { get; set; }
        public decimal LaborCost { get; set; }
        public decimal OverheadCost { get; set; }
        public decimal TotalCost { get; set; }
        public decimal CostPerUnit { get; set; }
    }
}