using System;
using System.Collections.Generic;

namespace KayanERP.Shared.DTOs
{
    // ==========================================
    // 0. نموذج إدارة حالة الجلسة والتطبيق (AppState)
    // ==========================================
    public class AppState
    {
        public long UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public long CompanyId { get; set; }
        public string TenantName { get; set; } = string.Empty;
        public List<string> Permissions { get; set; } = new();

        public bool HasPermission(string permission) => Permissions.Contains(permission);
        public bool HasAnyPermission(params string[] permissions)
        {
            foreach (var p in permissions) if (Permissions.Contains(p)) return true;
            return false;
        }
        public void SetUserSession(long userId, string username, string role, string tenantName, long companyId, List<string> permissions)
        {
            UserId = userId;
            Username = username;
            Role = role;
            TenantName = tenantName;
            CompanyId = companyId;
            Permissions = permissions;
        }
    }

    // ==========================================
    // 1. الكلاسات الأساسية واللوكات
    // ==========================================
    public class BranchLookupDto
    {
        public long Id { get; set; }
        public string BranchCode { get; set; } = string.Empty;
        public string BranchName { get; set; } = string.Empty;
    }

    public class CustomerDto
    {
        public long Id { get; set; }
        public long CompanyId { get; set; }
        public string CustomerCode { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerType { get; set; } = "Regular";
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public decimal CreditLimit { get; set; }
        public string? PaymentTerms { get; set; }
        public string? TaxNumber { get; set; }
        public bool Active { get; set; } = true;
        public string? Notes { get; set; }
    }

    public class SalesInvoiceLineDto
    {
        public long ItemId { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal LineTotal { get; set; }
    }

    // ==========================================
    // 2. المصادقة والـ Auth
    // ==========================================
    public class LoginRequestDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponseDto
    {
        public bool Success { get; set; }
        public string Token { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public long UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public long CompanyId { get; set; }
        public DateTime ExpiresAt { get; set; }
    }

    public class AccountCreateDto
    {
        public string AccountCode { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public string AccountType { get; set; } = string.Empty;
        public long? ParentAccountId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }

    // ==========================================
    // 3. الموردين والأسعار
    // ==========================================
    public class SupplierDto
    {
        public long Id { get; set; }
        public long CompanyId { get; set; }
        public string SupplierCode { get; set; } = string.Empty;
        public string SupplierName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? TaxNumber { get; set; }
        public string? PaymentTerms { get; set; }
        public decimal CreditLimit { get; set; }
        public bool Active { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class SupplierCreateDto
    {
        public string SupplierCode { get; set; } = string.Empty;
        public string SupplierName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? TaxNumber { get; set; }
        public string? PaymentTerms { get; set; }
        public decimal CreditLimit { get; set; }
        public bool Active { get; set; } = true;
        public string? Notes { get; set; }
    }

    public class SupplierViewDto
    {
        public long Id { get; set; }
        public string SupplierCode { get; set; } = string.Empty;
        public string SupplierName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? TaxNumber { get; set; }
        public string? PaymentTerms { get; set; }
        public decimal CreditLimit { get; set; }
        public bool Active { get; set; }
        public string? Notes { get; set; }
    }

    public class SupplierCreateUpdateDto
    {
        public string SupplierCode { get; set; } = string.Empty;
        public string SupplierName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? TaxNumber { get; set; }
        public string? PaymentTerms { get; set; }
        public decimal CreditLimit { get; set; }
        public bool Active { get; set; } = true;
        public string? Notes { get; set; }
    }

    public class SupplierItemPriceDto
    {
        public long Id { get; set; }
        public long SupplierId { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public string SupplierCode { get; set; } = string.Empty;
        public long ItemId { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Currency { get; set; } = "EGP";
        public int LeadTimeDays { get; set; }
        public int DeliveryDays { get; set; }
        public string EffectiveDate { get; set; } = string.Empty;
        public bool IsPreferred { get; set; }
        public string? Notes { get; set; }
    }

    public class CreateSupplierPriceDto
    {
        public long SupplierId { get; set; }
        public long ItemId { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; } = "EGP";
        public int LeadTimeDays { get; set; }
        public int DeliveryDays { get; set; }
        public string EffectiveDate { get; set; } = string.Empty;
        public bool IsPreferred { get; set; }
        public string? Notes { get; set; }
    }

    public class SupplierPriceOperationResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public long Id { get; set; }
    }

    public class SupplierLookupDto
    {
        public long Id { get; set; }
        public string SupplierName { get; set; } = string.Empty;
    }

    // ==========================================
    // 4. المخازن والفروع والأصناف
    // ==========================================
    public class WarehouseDto
    {
        public long Id { get; set; }
        public string WarehouseCode { get; set; } = string.Empty;
        public string WarehouseName { get; set; } = string.Empty;
        public string WarehouseType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public long BranchId { get; set; }
        public string? BranchName { get; set; }
        public long? ParentWarehouseId { get; set; }
        public string? ParentWarehouseName { get; set; }
        public bool Active { get; set; }
    }

    public class WarehouseCreateDto
    {
        public string WarehouseCode { get; set; } = string.Empty;
        public string WarehouseName { get; set; } = string.Empty;
        public string WarehouseType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public long BranchId { get; set; }
        public long? ParentWarehouseId { get; set; }
        public bool Active { get; set; } = true;
    }

    public class WarehouseLookupDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string WarehouseName { get; set; } = string.Empty;
        public string WarehouseCode { get; set; } = string.Empty;
    }

    public class WarehouseForBalanceDto
    {
        public long Id { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
    }

    public class WarehouseBranchLookupDto
    {
        public long Id { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
    }

    public class WarehouseImportDto
    {
        public string WarehouseCode { get; set; } = string.Empty;
        public string WarehouseName { get; set; } = string.Empty;
        public string BranchCodeOrName { get; set; } = string.Empty;
        public long BranchId { get; set; }
        public string WarehouseType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool Active { get; set; } = true;
        public string? ParentWarehouseCodeOrName { get; set; }
    }

    public class TransferWarehouseLookupDto
    {
        public long Id { get; set; }
        public string WarehouseCode { get; set; } = string.Empty;
        public string WarehouseName { get; set; } = string.Empty;
        public string WarehouseType { get; set; } = string.Empty;
    }

    public class SalesWarehouseLookupDto
    {
        public long Id { get; set; }
        public long BranchId { get; set; }
        public string WarehouseCode { get; set; } = string.Empty;
        public string WarehouseName { get; set; } = string.Empty;
    }

    public class ItemLookupDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public string ItemType { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal BasePrice { get; set; }
    }

    public class TransferItemLookupDto
    {
        public long Id { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public string ItemType { get; set; } = string.Empty;
    }

    public class FinishedItemLookupDto
    {
        public long Id { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string ItemType { get; set; } = string.Empty;
        public long DepartmentId { get; set; }
        public int ShelfLifeDays { get; set; }
        public string Unit { get; set; } = string.Empty;
        public decimal SellingPrice { get; set; }
    }

    public class ProductionItemLookupDto
    {
        public long Id { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string ItemType { get; set; } = string.Empty;
        public long DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public decimal CurrentStock { get; set; }
        public string Unit { get; set; } = string.Empty;
    }

    public class ItemApiDto
    {
        public long Id { get; set; }
        public long CompanyId { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public long CategoryId { get; set; }
        public long DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public string ItemType { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public bool Active { get; set; } = true;
        public bool HasExpiryDate { get; set; }
        public int ShelfLifeDays { get; set; }
        public decimal ReorderLevel { get; set; }
        public decimal SafetyStock { get; set; }
        public decimal MaxStock { get; set; }
        public decimal BasePrice { get; set; }
        public decimal Price { get; set; }
        public string? Barcode { get; set; }
        public bool HasVariants { get; set; }
        public bool IsVariant { get; set; }
        public bool IsMerged { get; set; }
        public bool IsContainer { get; set; }
        public bool MultiUom { get; set; }
        public bool HideDetailPrint { get; set; }
        public long? ParentItemId { get; set; }
        public List<ItemVariantApiDto> Variants { get; set; } = new();
    }

    public class ItemVariantApiDto
    {
        public long Id { get; set; }
        public string VariantName { get; set; } = string.Empty;
    }

    public class QuickItemCreateDto
    {
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public string ItemType { get; set; } = "Raw";
    }

    public class ItemCategoryDto
    {
        public long Id { get; set; }
        public long CompanyId { get; set; }
        public string CategoryCode { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string ItemType { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool Active { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateItemCategoryDto
    {
        public string CategoryCode { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string ItemType { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool Active { get; set; } = true;
    }

    public class UomConversionDto
    {
        public long Id { get; set; }
        public long ItemId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public string FromUnit { get; set; } = string.Empty;
        public string ToUnit { get; set; } = string.Empty;
        public decimal ConversionFactor { get; set; }
        public decimal Factor { get; set; }
        public string? Notes { get; set; }
    }

    public class UomConversionCreateDto
    {
        public long ItemId { get; set; }
        public string FromUnit { get; set; } = string.Empty;
        public string ToUnit { get; set; } = string.Empty;
        public decimal ConversionFactor { get; set; }
        public decimal Factor { get; set; }
        public string? Notes { get; set; }
    }

    public class ParentItemLookupDto
    {
        public long Id { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
    }

    public class ItemVariantDto
    {
        public long Id { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string ItemType { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public long ParentItemId { get; set; }
        public string ParentItemName { get; set; } = string.Empty;
        public bool Active { get; set; } = true;
    }

    public class ItemVariantCreateDto
    {
        public string VariantCode { get; set; } = string.Empty;
        public string VariantName { get; set; } = string.Empty;
        public long ParentItemId { get; set; }
        public string Unit { get; set; } = string.Empty;
        public decimal PackingFactor { get; set; }
        public string PackingUnit { get; set; } = string.Empty;
    }

    public class BulkQuickImportRequest
    {
        public string RawData { get; set; } = string.Empty;
        public long DefaultCategoryId { get; set; }
        public string DataJson { get; set; } = string.Empty;
    }

    // ==========================================
    // 5. طلبات الصرف والمستلزمات (Requisitions)
    // ==========================================
    public class RequisitionLookupsDto
    {
        public List<WarehouseLookupDto> Warehouses { get; set; } = new();
        public List<ItemLookupDto> Items { get; set; } = new();
        public List<RequisitionDepartmentLookupDto> Departments { get; set; } = new();
        public List<RequisitionWarehouseLookupDto> RawMaterialsWarehouses { get; set; } = new();
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

    public class CreateRequisitionDto
    {
        public long FromWarehouseId { get; set; }
        public long DepartmentId { get; set; }
        public string RequestedBy { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public List<RequisitionLineCreateDto> Lines { get; set; } = new();
    }

    public class RequisitionLineCreateDto
    {
        public long ItemId { get; set; }
        public decimal RequestedQty { get; set; }
        public string? Notes { get; set; }
    }

    public class RequisitionDetailDto
    {
        public long Id { get; set; }
        public string RequisitionNumber { get; set; } = string.Empty;
        public long FromWarehouseId { get; set; }
        public string FromWarehouseName { get; set; } = string.Empty;
        public long DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public string RequestedBy { get; set; } = string.Empty;
        public string? DispatchedBy { get; set; }
        public string? ReceivedBy { get; set; }
        public string Status { get; set; } = string.Empty;
        public string OverallStatus { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? DispatchedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public List<RequisitionLineDto> Lines { get; set; } = new();
    }

    public class RequisitionLineDto
    {
        public long Id { get; set; }
        public long ItemId { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public decimal RequestedQty { get; set; }
        public decimal DispatchedQty { get; set; }
        public decimal ReceivedQty { get; set; }
        public string LineStatus { get; set; } = string.Empty;
        public string? BatchNumber { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public decimal UnitCost { get; set; }
        public string? DiscrepancyReason { get; set; }
        public string? WarehouseNotes { get; set; }
    }

    public class RequisitionLineDetailDto
    {
        public long Id { get; set; }
        public long ItemId { get; set; }
        public decimal RequestedQty { get; set; }
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
        public string? DispatchedBy { get; set; }
        public DateTime? DispatchedAt { get; set; }
        public string FromWarehouseName { get; set; } = string.Empty;
        public decimal DispatchedQty { get; set; }
        public string? BatchNumber { get; set; }
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

    public class DispatchRequisitionDto
    {
        public long RequisitionId { get; set; }
        public string DispatchedBy { get; set; } = string.Empty;
        public List<DispatchRequisitionLineDto> Lines { get; set; } = new();
    }

    public class DispatchRequisitionLineDto
    {
        public long LineId { get; set; }
        public long WarehouseId { get; set; }
        public decimal DispatchedQty { get; set; }
        public string BatchNumber { get; set; } = string.Empty;
        public DateTime? ExpiryDate { get; set; }
        public decimal UnitCost { get; set; }
    }

    public class ReceiveLineItemDto
    {
        public long LineId { get; set; }
        public decimal ReceivedQty { get; set; }
        public bool IsAccepted { get; set; }
        public bool IsQcPassed { get; set; }
        public string? DiscrepancyReason { get; set; }
        public string ReceivedBy { get; set; } = string.Empty;
    }

    public class ResolveDiscrepancyDto
    {
        public long LineId { get; set; }
        public decimal FinalApprovedQty { get; set; }
        public decimal LossQty { get; set; }
        public string WarehouseResolutionNotes { get; set; } = string.Empty;
    }

    public class FefoBatchSuggestionDto
    {
        public string BatchNumber { get; set; } = string.Empty;
        public DateTime? ExpiryDate { get; set; }
        public decimal AvailableQty { get; set; }
        public decimal UnitCost { get; set; }
    }

    // ==========================================
    // 6. المشتريات وأوامر الشراء (Procurement)
    // ==========================================
    public class ProcurementPendingRequestDto
    {
        public long Id { get; set; }
        public string RequestNumber { get; set; } = string.Empty;
        public DateTime RequestDate { get; set; }
        public long WarehouseId { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int ItemsCount { get; set; }
        public List<ProcurementPendingLineDto> Lines { get; set; } = new();
    }

    public class ProcurementPendingLineDto
    {
        public long LineId { get; set; }
        public long ItemId { get; set; }
        public long SupplierId { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public decimal RequestedQuantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TaxAmount { get; set; }
    }

    public class ProcurementConvertDto
    {
        public long RequestId { get; set; }
        public long SupplierId { get; set; }
        public string InvoiceNumberPrefix { get; set; } = string.Empty;
        public DateTime InvoiceDate { get; set; }
        public List<PurchaseOrderLineCreateDto> Lines { get; set; } = new();
    }

    public class ProcurementApprovedInvoiceDto
    {
        public long Id { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public string SupplierName { get; set; } = string.Empty;
        public string WarehouseName { get; set; } = string.Empty;
        public DateTime InvoiceDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class PurchaseOrderLineCreateDto
    {
        public long Id { get; set; }
        public long ItemId { get; set; }
        public long SupplierId { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal ReceivedQuantity { get; set; }
        public decimal RemainingQuantity { get; set; }
        public string? Notes { get; set; }
    }

    public class PurchaseOrderCreateLineDto
    {
        public long ItemId { get; set; }
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }

    public class PurchaseOrderLineDto
    {
        public long Id { get; set; }
        public long ItemId { get; set; }
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }

    public class PurchaseOrderDto
    {
        public long Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string SupplierName { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public List<PurchaseOrderLineCreateDto> Lines { get; set; } = new();
    }

    public class PurchaseOrderCreateDto
    {
        public long SupplierId { get; set; }
        public long WarehouseId { get; set; }
        public DateTime OrderDate { get; set; }
        public List<PurchaseOrderLineCreateDto> Lines { get; set; } = new();
    }

    public class PurchaseOrderResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public long OrderId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
    }

    public class PoApproveDto
    {
        public long OrderId { get; set; }
        public string ApprovedBy { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public List<PoApproveLineDto> Lines { get; set; } = new();
    }

    public class PoApproveLineDto
    {
        public long LineId { get; set; }
        public long ItemId { get; set; }
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public string? Notes { get; set; }
    }

    public class PurchaseOrderLookupDto
    {
        public long Id { get; set; }
        public long WarehouseId { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
        public string SupplierName { get; set; } = string.Empty;
        public string OrderNumber { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public List<PurchaseOrderLineDto> Lines { get; set; } = new();
    }

    public class PurchaseOrderLookupsDto
    {
        public List<SupplierDto> Suppliers { get; set; } = new();
        public List<WarehouseLookupDto> Warehouses { get; set; } = new();
        public List<ItemLookupDto> Items { get; set; } = new();
    }

    public class PurchaseInvoiceCreateDto
    {
        public long SupplierId { get; set; }
        public decimal Amount { get; set; }
    }

    public class PendingInvoiceDto
    {
        public long Id { get; set; }
        public long InvoiceId { get; set; }
        public long WarehouseId { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public DateTime InvoiceDate { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public long SupplierId { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public List<PurchaseOrderLineCreateDto> Lines { get; set; } = new();
    }

    public class PendingInvoiceLineDto
    {
        public long Id { get; set; }
    }

    public class PurchaseRequestDto
    {
        public long Id { get; set; }
        public long WarehouseId { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
        public string RequestNumber { get; set; } = string.Empty;
        public DateTime RequestDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
    }

    public class PurchaseRequestCreateDto
    {
        public string RequestNumber { get; set; } = string.Empty;
        public long WarehouseId { get; set; }
        public DateTime RequestDate { get; set; }
        public string Notes { get; set; } = string.Empty;
        public List<PurchaseOrderLineCreateDto> Lines { get; set; } = new();
    }

    public class PurchaseRequestItemLookupDto
    {
        public long Id { get; set; }
        public string ItemCode { get; set; } = string.Empty;
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

    // ==========================================
    // 7. الإنتاج والتصنيع والتشغيل (Production)
    // ==========================================
    public class ProductionSubmissionDto
    {
        public long FormId { get; set; }
        public long DepartmentId { get; set; }
        public long UserId { get; set; }
        public long CompanyId { get; set; }
        public long WarehouseId { get; set; }
        public long ProductItemId { get; set; }
        public decimal ProducedQuantity { get; set; }
        public decimal ActualHours { get; set; }
        public decimal WasteCost { get; set; }
        public string? Notes { get; set; }
    }

    public class ProductionDepartmentLookupDto
    {
        public long Id { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
    }

    public class ProductionWarehouseLookupDto
    {
        public long Id { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
    }

    public class ProductionEmployeeLookupDto
    {
        public long Id { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
    }

    public class ProductionOperationsLookupsDto
    {
        public List<WarehouseLookupDto> Warehouses { get; set; } = new();
        public List<ProductionItemLookupDto> Items { get; set; } = new();
        public List<ProductionDepartmentLookupDto> Departments { get; set; } = new();
        public List<ProductionEmployeeLookupDto> Employees { get; set; } = new();
    }

    public class ActiveProductionOrderDto
    {
        public long Id { get; set; }
        public long OrderId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public long WarehouseId { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
        public long DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public List<ActiveProductionOrderDetailDto> Details { get; set; } = new();
    }

    public class ActiveProductionOrderDetailDto
    {
        public long Id { get; set; }
    }

    public class CreateBatchOrderDto
    {
        public long CompanyId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public long WarehouseId { get; set; }
        public string? Notes { get; set; }
        public long ProductItemId { get; set; }
        public decimal Quantity { get; set; }
        public List<ItemLookupDto> Items { get; set; } = new();
    }

    public class OrderExecutionItemDto
    {
        public long ItemId { get; set; }
        public decimal Quantity { get; set; }
    }

    public class OrderExecutionMaterialDto
    {
        public long MaterialId { get; set; }
        public decimal QuantityUsed { get; set; }
    }

    public class OrderExecutionFullDto
    {
        public long Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public List<OrderExecutionItemDto> Items { get; set; } = new();
    }

    public class CompleteOrderFinalizeDto
    {
        public long OrderId { get; set; }
        public decimal ActualOutput { get; set; }
        public List<OrderExecutionMaterialDto> Items { get; set; } = new();
    }

    public class ShiftProductivityDto
    {
        public long ShiftId { get; set; }
        public long ProductionOrderId { get; set; }
        public string ShiftName { get; set; } = string.Empty;
        public decimal TotalProducedQuantity { get; set; }
        public decimal EfficiencyRate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public List<ShiftCrewMemberDto> CrewMembers { get; set; } = new();
    }

    public class DepartmentKpiDto
    {
        public long DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public decimal Score { get; set; }
        public decimal TotalHours { get; set; }
        public decimal TotalProduced { get; set; }
        public decimal TotalLaborCost { get; set; }
        public decimal ProductivityPerHour { get; set; }
        public decimal EstimatedWaste { get; set; }
    }

    public class DetailedAttendanceLogDto
    {
        public long Id { get; set; }
        public DateTime LogDate { get; set; }
        public long EmployeeId { get; set; }
        public string EmployeeCode { get; set; } = string.Empty;
        public string EmployeeName { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public string AttendanceStatus { get; set; } = string.Empty;
        public decimal HoursWorked { get; set; }
        public decimal HourlyRate { get; set; }
        public decimal LaborCost { get; set; }
        public decimal ProducedQuantity { get; set; }
        public decimal ProductivityPerHour { get; set; }
        public DateTime CheckIn { get; set; }
        public string? Notes { get; set; }
    }

    public class EmployeeDossierDto
    {
        public long EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public string EmployeeCode { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public int TotalOrdersExecuted { get; set; }
        public decimal TotalQuantityProduced { get; set; }
        public decimal TotalWorkingHours { get; set; }
        public decimal TotalLaborCost { get; set; }
        public decimal ProductionPerHour { get; set; }
        public decimal TotalWaste { get; set; }
        public decimal WastePercentage { get; set; }
        public string Evaluation { get; set; } = string.Empty;
        public string DossierDetails { get; set; } = string.Empty;
    }

    public class BatchCostCalculationResultDto
    {
        public long Id { get; set; }
        public long BatchId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public decimal ProducedQuantity { get; set; }
        public decimal ActualHoursWorked { get; set; }
        public decimal TotalBatchCost { get; set; }
        public decimal UnitCost { get; set; }
        public decimal TotalCalculatedCost { get; set; }
        public List<CostBreakdownDto> CostBreakdown { get; set; } = new();
    }

    public class CostBreakdownDto
    {
        public string Category { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }

    public class BatchCostCalculationRequestDto
    {
        public long BatchId { get; set; }
        public long ProductionOrderId { get; set; }
        public decimal OverheadCost { get; set; }
        public decimal LaborCostPerHour { get; set; }
        public decimal ActualRawMaterialsCost { get; set; }
    }

    public class ProductionOrderListDto
    {
        public long Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string WarehouseName { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public int ItemsCount { get; set; }
        public string? Notes { get; set; }
        public List<ProductionOrderDetailViewDto> Details { get; set; } = new();
    }

    public class ProductionOrderDetailViewDto
    {
        public long Id { get; set; }
    }

    public class ProductionOrderMaterialViewDto
    {
        public long Id { get; set; }
    }

    public class CreateProductionOrderDto
    {
        public long CompanyId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public long WarehouseId { get; set; }
        public DateTime OrderDate { get; set; }
        public string? Notes { get; set; }
        public long ProductItemId { get; set; }
        public decimal Quantity { get; set; }
        public List<ItemLookupDto> Items { get; set; } = new();
    }

    public class ShiftCrewMemberDto
    {
        public long UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public decimal HourlyRate { get; set; }
    }

    // ==========================================
    // 8. الحركات والمخازن والتقارير (Stock & Inventory)
    // ==========================================
    public class StockMovementLedgerDto
    {
        public long MovementId { get; set; }
        public DateTime MovementAt { get; set; }
        public string MovementType { get; set; } = string.Empty;
        public decimal InQuantity { get; set; }
        public decimal OutQuantity { get; set; }
        public decimal RunningBalance { get; set; }
        public decimal UnitCost { get; set; }
        public string ReferenceType { get; set; } = string.Empty;
        public long? ReferenceId { get; set; }
        public string Notes { get; set; } = string.Empty;
    }

    public class StockLedgerLineDto
    {
        public long MovementId { get; set; }
        public DateTime MovementAt { get; set; }
        public DateTime MovementDate { get; set; }
        public string MovementType { get; set; } = string.Empty;
        public string MovementTypeLabel { get; set; } = string.Empty;
        public string WarehouseName { get; set; } = string.Empty;
        public string BranchName { get; set; } = string.Empty;
        public decimal InQuantity { get; set; }
        public decimal OutQuantity { get; set; }
        public decimal RunningBalance { get; set; }
        public decimal BalanceAfter { get; set; }
        public decimal UnitCost { get; set; }
        public decimal TotalCost { get; set; }
        public string ReferenceType { get; set; } = string.Empty;
        public long? ReferenceId { get; set; }
        public string? BatchNumber { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string Notes { get; set; } = string.Empty;
    }

    public class StockTransferLineDetailDto
    {
        public long Id { get; set; }
        public long ItemId { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public decimal DispatchedQty { get; set; }
        public decimal ReceivedQty { get; set; }
        public string BatchNumber { get; set; } = string.Empty;
        public DateTime? ExpiryDate { get; set; }
        public decimal UnitCost { get; set; }
        public string LineStatus { get; set; } = string.Empty;
        public string? DiscrepancyReason { get; set; }
        public string? ResolutionNotes { get; set; }
        public decimal LossQty { get; set; }
    }

    public class StockTransferLineDto
    {
        public long Id { get; set; }
        public long ItemId { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public decimal DispatchedQty { get; set; }
        public decimal ReceivedQty { get; set; }
        public string BatchNumber { get; set; } = string.Empty;
        public DateTime? ExpiryDate { get; set; }
        public decimal UnitCost { get; set; }
        public string LineStatus { get; set; } = string.Empty;
    }

    public class StockLookupsDto
    {
        public List<WarehouseLookupDto> Warehouses { get; set; } = new();
        public List<ItemLookupDto> Items { get; set; } = new();
        public List<BranchLookupDto> Branches { get; set; } = new();
    }

    public class StockBalanceListItemDto
    {
        public long Id { get; set; }
        public long WarehouseId { get; set; }
        public string WarehouseCode { get; set; } = string.Empty;
        public string WarehouseName { get; set; } = string.Empty;
        public long BranchId { get; set; }
        public string BranchName { get; set; } = string.Empty;
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
        public decimal Balance { get; set; }
        public DateTime LastUpdatedAt { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class StockKpiSummaryDto
    {
        public decimal TotalValue { get; set; }
        public decimal EstimatedStock { get; set; }
        public int TotalItemsCount { get; set; }
        public decimal TotalAvailableQuantity { get; set; }
        public decimal TotalStockQuantity { get; set; }
        public int LowStockCount { get; set; }
        public int OutOfStockCount { get; set; }
    }

    public class StockOperationResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public decimal CurrentBalance { get; set; }
    }

    public class InitialStockDto
    {
        public long ItemId { get; set; }
        public long WarehouseId { get; set; }
        public decimal Quantity { get; set; }
        public decimal UnitCost { get; set; }
        public string? Notes { get; set; }
    }

    public class StockBalanceViewDto
    {
        public long ItemId { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public long WarehouseId { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
        public string BranchName { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal ReservedQuantity { get; set; }
        public decimal AvailableQuantity { get; set; }
        public string Unit { get; set; } = string.Empty;
        public decimal ReorderLevel { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime LastUpdatedAt { get; set; }
    }

    public class StockMovementItemLedgerDto
    {
        public long MovementId { get; set; }
        public DateTime MovementDate { get; set; }
        public long ItemId { get; set; }
        public long WarehouseId { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
        public string MovementType { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal UnitCost { get; set; }
        public string ReferenceType { get; set; } = string.Empty;
        public long? ReferenceId { get; set; }
        public string? Notes { get; set; }
    }

    public class ItemStockCardDetailDto
    {
        public long ItemId { get; set; }
        public string Details { get; set; } = string.Empty;
        public ItemStockSummaryDto Summary { get; set; } = new();
        public List<ItemBatchStockDto> Batches { get; set; } = new();
        public List<StockLedgerLineDto> Ledger { get; set; } = new();
    }

    public class ItemStockSummaryDto
    {
        public long ItemId { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public long WarehouseId { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
        public decimal TotalQuantity { get; set; }
        public decimal AvailableQuantity { get; set; }
        public decimal ReservedQuantity { get; set; }
        public bool HasExpiryDate { get; set; }
        public decimal ReorderLevel { get; set; }
        public decimal SafetyStock { get; set; }
        public decimal MaxStock { get; set; }
        public decimal TotalIn { get; set; }
        public decimal TotalOut { get; set; }
        public string StockStatus { get; set; } = string.Empty;
        public string StatusMessage { get; set; } = string.Empty;
    }

    public class ItemBatchStockDto
    {
        public string BatchNumber { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public DateTime? ExpiryDate { get; set; }
    }

    public class StockCardLookupsResponse
    {
        public List<ItemLookupDto> Items { get; set; } = new();
        public List<WarehouseLookupDto> Warehouses { get; set; } = new();
    }

    public class StockCardReportDto
    {
        public long ItemId { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public decimal OpeningBalance { get; set; }
        public decimal TotalInbound { get; set; }
        public decimal TotalOutbound { get; set; }
        public decimal ClosingBalance { get; set; }
        public string Unit { get; set; } = string.Empty;
        public List<StockLedgerLineDto> Lines { get; set; } = new();
    }

    public class StockTransferLookupsDto
    {
        public List<WarehouseLookupDto> Warehouses { get; set; } = new();
        public List<ItemLookupDto> Items { get; set; } = new();
    }

    public class StockTransferDetailDto
    {
        public long Id { get; set; }
        public string TransferNumber { get; set; } = string.Empty;
        public long FromWarehouseId { get; set; }
        public string FromWarehouseName { get; set; } = string.Empty;
        public long ToWarehouseId { get; set; }
        public string ToWarehouseName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? DriverName { get; set; }
        public string? VehicleNumber { get; set; }
        public string? Notes { get; set; }
        public string? CreatedBy { get; set; }
        public string? ReceivedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? DispatchedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public List<StockTransferLineDto> Lines { get; set; } = new();
    }

    public class AvailableBatchItemDto
    {
        public string BatchNumber { get; set; } = string.Empty;
        public decimal AvailableQty { get; set; }
        public DateTime? ExpiryDate { get; set; }
    }

    public class AvailableStockInfoDto
    {
        public decimal AvailableQty { get; set; }
        public decimal TotalAvailableQty { get; set; }
        public List<AvailableBatchItemDto> Batches { get; set; } = new();
    }

    public class CreateStockTransferDto
    {
        public long FromWarehouseId { get; set; }
        public long ToWarehouseId { get; set; }
        public string? DriverName { get; set; }
        public string? VehicleNumber { get; set; }
        public string? Notes { get; set; }
        public string? DispatchedBy { get; set; }
        public List<StockTransferLineDto> Lines { get; set; } = new();
    }

    public class ConfirmTransferLineReceiveDto
    {
        public long LineId { get; set; }
        public decimal ReceivedQty { get; set; }
        public bool IsAccepted { get; set; }
        public string? DiscrepancyReason { get; set; }
        public string ReceivedBy { get; set; } = string.Empty;
    }

    public class ResolveTransferDisputeDto
    {
        public long LineId { get; set; }
        public decimal FinalApprovedQty { get; set; }
        public decimal LossQty { get; set; }
        public string ResolutionNotes { get; set; } = string.Empty;
    }

    // ==========================================
    // 9. استلام المواد والجودة (Material Receipt & QC)
    // ==========================================
    public class MaterialReceiptLinePostDto
    {
        public long LineId { get; set; }
        public long ItemId { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public decimal RemainingQuantity { get; set; }
        public decimal ReceivedQty { get; set; }
        public decimal AcceptedQuantity { get; set; }
        public decimal RejectedQuantity { get; set; }
        public decimal UnitPrice { get; set; }
        public string? QcDecision { get; set; }
        public bool IsQcPassed { get; set; }
        public string? RejectionReason { get; set; }
        public string? BatchNumber { get; set; }
        public DateTime? ExpiryDate { get; set; }
    }

    public class MaterialReceiptItemPostDto
    {
        public long ItemId { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public decimal RemainingQuantity { get; set; }
        public decimal AcceptedQuantity { get; set; }
        public decimal RejectedQuantity { get; set; }
        public decimal UnitPrice { get; set; }
        public string? QcDecision { get; set; }
        public string? RejectionReason { get; set; }
        public string? BatchNumber { get; set; }
        public DateTime? ExpiryDate { get; set; }
    }

    public class MaterialReceiptLookupsDto
    {
        public List<SupplierDto> Suppliers { get; set; } = new();
        public List<WarehouseLookupDto> Warehouses { get; set; } = new();
    }

    public class MaterialReceiptResultDto
    {
        public bool Success { get; set; }
        public string ReceiptNumber { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    public class MaterialReceiptPostDto
    {
        public long InvoiceId { get; set; }
        public long SupplierId { get; set; }
        public long WarehouseId { get; set; }
        public string CoaNumber { get; set; } = string.Empty;
        public string InspectorName { get; set; } = string.Empty;
        public string InspectorCode { get; set; } = string.Empty;
        public List<MaterialReceiptLinePostDto> Items { get; set; } = new();
        public List<MaterialReceiptLinePostDto> Lines { get; set; } = new();
    }

    public class MaterialReceiptDto
    {
        public long Id { get; set; }
        public long PurchaseOrderId { get; set; }
        public long WarehouseId { get; set; }
        public string ReceiptNumber { get; set; } = string.Empty;
        public DateTime ReceiptDate { get; set; }
        public string QcInspectorName { get; set; } = string.Empty;
        public string CoaNumber { get; set; } = string.Empty;
        public List<MaterialReceiptLinePostDto> Lines { get; set; } = new();
    }

    public class QualityInspectionCreateDto
    {
        public long ReceiptId { get; set; }
        public long ProductionOrderId { get; set; }
        public bool Passed { get; set; }
        public bool IsGmpPassed { get; set; }
        public bool IsHaccpPassed { get; set; }
        public bool IsWeightsPassed { get; set; }
        public string InspectorName { get; set; } = string.Empty;
        public string InspectorNotes { get; set; } = string.Empty;
    }

    public class VendorQcScoreDto
    {
        public long SupplierId { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public int TotalShipments { get; set; }
        public decimal TotalReceivedQty { get; set; }
        public decimal TotalAcceptedQty { get; set; }
        public decimal TotalRejectedQty { get; set; }
        public decimal AcceptanceRate { get; set; }
        public string QualityGrade { get; set; } = string.Empty;
        public int RejectionIncidentsCount { get; set; }
    }

    public class QcInspectionHistoryDto
    {
        public long MovementId { get; set; }
        public DateTime InspectionDate { get; set; }
        public long SupplierId { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public long ItemId { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string MovementType { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public string Notes { get; set; } = string.Empty;
    }

    // ==========================================
    // 10. الوصفات والتكويد (Recipes)
    // ==========================================
    public class RecipeDto
    {
        public long Id { get; set; }
        public long CompanyId { get; set; }
        public long ProductItemId { get; set; }
        public string ProductItemCode { get; set; } = string.Empty;
        public string RecipeCode { get; set; } = string.Empty;
        public string RecipeName { get; set; } = string.Empty;
        public string ProductItemName { get; set; } = string.Empty;
        public decimal BatchQuantity { get; set; }
        public string BatchUnit { get; set; } = string.Empty;
        public decimal YieldQuantity { get; set; }
        public string YieldUnit { get; set; } = string.Empty;
        public int LinesCount { get; set; }
        public decimal TotalEstimatedCost { get; set; }
        public decimal PiecesPerBatch { get; set; }
        public decimal CostPerPiece { get; set; }
        public decimal WastePercentage { get; set; }
        public int PreparationTimeMinutes { get; set; }
        public bool Active { get; set; } = true;
        public string? Notes { get; set; }
        public List<RecipeLineDto> Lines { get; set; } = new();
    }

    public class RecipeImportPreviewDto
    {
        public string RecipeCode { get; set; } = string.Empty;
        public string RecipeName { get; set; } = string.Empty;
        public long ProductItemId { get; set; }
        public string MatchedProductName { get; set; } = string.Empty;
        public string RawProductName { get; set; } = string.Empty;
        public decimal BatchQuantity { get; set; }
        public string BatchUnit { get; set; } = string.Empty;
        public decimal YieldQuantity { get; set; }
        public decimal PiecesPerBatch { get; set; }
        public decimal WastePercentage { get; set; }
        public int PreparationTimeMinutes { get; set; }
        public List<RecipeLineDto> Lines { get; set; } = new();
    }

    public class SaveRecipeDto
    {
        public long Id { get; set; }
        public long CompanyId { get; set; }
        public long ProductItemId { get; set; }
        public string RecipeCode { get; set; } = string.Empty;
        public string RecipeName { get; set; } = string.Empty;
        public decimal BatchQuantity { get; set; }
        public string BatchUnit { get; set; } = string.Empty;
        public decimal YieldQuantity { get; set; }
        public string YieldUnit { get; set; } = string.Empty;
        public decimal PiecesPerBatch { get; set; }
        public decimal WastePercentage { get; set; }
        public int PreparationTimeMinutes { get; set; }
        public bool Active { get; set; } = true;
        public string? Notes { get; set; }
        public List<RecipeLineDto> Lines { get; set; } = new();
    }

    public class RecipeLineDto
    {
        public long Id { get; set; }
        public long ComponentItemId { get; set; }
        public string ComponentItemCode { get; set; } = string.Empty;
        public string ComponentItemName { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public string Unit { get; set; } = string.Empty;
        public decimal UnitCost { get; set; }
        public decimal WastePercentage { get; set; }
        public string? Notes { get; set; }
    }

    // ==========================================
    // 11. المبيعات (Sales)
    // ==========================================
    public class SalesLookupsDto
    {
        public List<CustomerDto> Customers { get; set; } = new();
        public List<BranchLookupDto> Branches { get; set; } = new();
        public List<SalesWarehouseLookupDto> Warehouses { get; set; } = new();
        public List<FinishedItemLookupDto> FinishedItems { get; set; } = new();
        public List<ItemLookupDto> Items { get; set; } = new();
    }

    public class SalesInvoiceViewDto
    {
        public long Id { get; set; }
        public long BranchId { get; set; }
        public string BranchName { get; set; } = string.Empty;
        public string InvoiceNumber { get; set; } = string.Empty;
        public DateTime InvoiceDate { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int ItemsCount { get; set; }
        public decimal TotalAmount { get; set; }
        public List<SalesInvoiceLineDto> Lines { get; set; } = new();
    }

    public class SalesInvoiceResultDto
    {
        public bool Success { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public long InvoiceId { get; set; }
        public decimal TotalAmount { get; set; }
        public int ItemsCount { get; set; }
    }

    public class ExtendedSalesInvoiceCreateDto
    {
        public long BranchId { get; set; }
        public long CustomerId { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public List<SalesInvoiceLineDto> InvoiceLines { get; set; } = new();
    }

    public class SalesInvoiceCreateDto
    {
        public long BranchId { get; set; }
        public long WarehouseId { get; set; }
        public long CustomerId { get; set; }
        public decimal TotalAmount { get; set; }
        public List<SalesInvoiceLineDto> InvoiceLines { get; set; } = new();
    }

    // ==========================================
    // 12. الصناديق والعملاء والموظفين والأصول والتكاليف
    // ==========================================
    public class ContainerLookupDto
    {
        public long Id { get; set; }
        public string ContainerName { get; set; } = string.Empty;
    }

    public class CrateClientTransactionViewDto
    {
        public long Id { get; set; }
        public long CrateClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string TransactionType { get; set; } = string.Empty;
        public DateTime TransactionDate { get; set; }
        public string? DriverName { get; set; }
        public decimal ClientCurrentBalance { get; set; }
        public string? Notes { get; set; }
    }

    public class CreateCrateClientTransactionDto
    {
        public long CrateClientId { get; set; }
        public long ClientId { get; set; }
        public int Quantity { get; set; }
        public string TransactionType { get; set; } = string.Empty;
        public string? DriverName { get; set; }
        public string? Notes { get; set; }
    }

    public class CrateTransactionCreateDto
    {
        public long ClientId { get; set; }
        public int Quantity { get; set; }
    }

    public class CrateLookupsDto
    {
        public List<CustomerDto> Clients { get; set; } = new();
        public List<ContainerLookupDto> Containers { get; set; } = new();
        public List<DepartmentDto> Departments { get; set; } = new();
        public List<WarehouseLookupDto> Warehouses { get; set; } = new();
    }

    public class CirculatingContainerViewDto
    {
        public long Id { get; set; }
        public string ContainerCode { get; set; } = string.Empty;
        public string ContainerName { get; set; } = string.Empty;
        public string Specification { get; set; } = string.Empty;
        public int TotalFactoryQuantity { get; set; }
        public int InPackagingWarehouseQuantity { get; set; }
        public int WithDriversAndBranchesQuantity { get; set; }
        public int DisputedQuantity { get; set; }
        public int DamagedQuantity { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class CrateMovementViewDto
    {
        public long Id { get; set; }
        public string MovementNumber { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string ContainerCode { get; set; } = string.Empty;
        public string ContainerName { get; set; } = string.Empty;
        public string MovementType { get; set; } = string.Empty;
        public int DispatchedQuantity { get; set; }
        public int ReceivedQuantity { get; set; }
        public int ShortageQuantity { get; set; }
        public int DamagedCount { get; set; }
        public string SourceLocation { get; set; } = string.Empty;
        public string DestinationLocation { get; set; } = string.Empty;
        public string DispatchedByCode { get; set; } = string.Empty;
        public string DispatchedByName { get; set; } = string.Empty;
        public string ReceivedByCode { get; set; } = string.Empty;
        public string ReceivedByName { get; set; } = string.Empty;
        public DateTime? ReceivedAt { get; set; }
        public string? ReceiveNotes { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? ArbitrationDecision { get; set; }
        public string? ArbitrationText { get; set; }
        public decimal FinancialPenalty { get; set; }
    }

    public class DispatchCrateDto
    {
        public string ContainerName { get; set; } = string.Empty;
        public string MovementType { get; set; } = string.Empty;
        public long ClientId { get; set; }
        public int Quantity { get; set; }
        public int DispatchedQuantity { get; set; }
        public string DispatchedByCode { get; set; } = string.Empty;
        public string DispatchedByName { get; set; } = string.Empty;
        public string SourceLocation { get; set; } = string.Empty;
        public string DestinationLocation { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    public class ReceiveCrateDto
    {
        public long ClientId { get; set; }
        public int Quantity { get; set; }
        public int ActualReceivedQuantity { get; set; }
        public int DamagedCount { get; set; }
        public string ReceivedByCode { get; set; } = string.Empty;
        public string ReceivedByName { get; set; } = string.Empty;
        public string? ReceiveNotes { get; set; }
        public string? Notes { get; set; }
    }

    public class SettleDisputeDto
    {
        public long DisputeId { get; set; }
        public long TransactionId { get; set; }
        public decimal SettleAmount { get; set; }
        public string ArbitratedByCode { get; set; } = string.Empty;
        public string ArbitratedByName { get; set; } = string.Empty;
        public string ArbitrationDecision { get; set; } = string.Empty;
        public string ArbitrationText { get; set; } = string.Empty;
        public decimal FinancialPenalty { get; set; }
        public string ResolutionNotes { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    public class FinishedGoodsTransferViewDto
    {
        public long Id { get; set; }
        public string TransferNumber { get; set; } = string.Empty;
        public DateTime TransferDate { get; set; }
        public string SourceWarehouseName { get; set; } = string.Empty;
        public string DestinationWarehouseName { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string ItemCode { get; set; } = string.Empty;
        public string BatchNumber { get; set; } = string.Empty;
        public DateTime? ExpiryDate { get; set; }
        public decimal ProdDispatchedQty { get; set; }
        public int ProdDispatchedCount { get; set; }
        public string? ProdNotes { get; set; }
        public decimal CostingActualQty { get; set; }
        public int CostingActualCount { get; set; }
        public decimal CostingWeightDiff { get; set; }
        public int CostingCountDiff { get; set; }
        public bool CostingDiscrepancyFlag { get; set; }
        public string CostingDisputeStatus { get; set; } = string.Empty;
        public string? CostingDisputeReason { get; set; }
        public string? CostingDisputeChargeTo { get; set; }
        public decimal QcApprovedQty { get; set; }
        public decimal QcSampleQty { get; set; }
        public decimal QcReworkQty { get; set; }
        public decimal QcScrapQty { get; set; }
        public decimal ReceivedActualQty { get; set; }
        public int ReceivedActualCount { get; set; }
        public bool HasDispute { get; set; }
        public string? DisputeReason { get; set; }
        public string DisputeStatus { get; set; } = string.Empty;
        public string? ControlDisputeChargeTo { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class CreateTransferRequestDto
    {
        public long ProductItemId { get; set; }
        public decimal Quantity { get; set; }
        public decimal DispatchedQty { get; set; }
        public int DispatchedCount { get; set; }
        public long SourceWarehouseId { get; set; }
        public long DestinationWarehouseId { get; set; }
        public string BatchNumber { get; set; } = string.Empty;
        public DateTime? ExpiryDate { get; set; }
        public string? Notes { get; set; }
        public string SubmittedBy { get; set; } = string.Empty;
    }

    public class CostingAuditDto
    {
        public long Id { get; set; }
        public long TransferId { get; set; }
        public string BatchNumber { get; set; } = string.Empty;
        public decimal ActualWeight { get; set; }
        public int ActualCount { get; set; }
        public decimal TotalCost { get; set; }
        public DateTime AuditDate { get; set; }
        public string AuditorName { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public bool EscalateDispute { get; set; }
    }

    public class ResolveCostingDisputeDto
    {
        public long AuditId { get; set; }
        public long TransferId { get; set; }
        public decimal AdjustedCost { get; set; }
        public decimal FinalAcceptedWeight { get; set; }
        public int FinalAcceptedCount { get; set; }
        public string ResolvedBy { get; set; } = string.Empty;
        public string ChargeTo { get; set; } = string.Empty;
        public string ResolutionNotes { get; set; } = string.Empty;
    }

    public class QcInspectionDto
    {
        public long Id { get; set; }
        public long TransferId { get; set; }
        public string InspectorName { get; set; } = string.Empty;
        public decimal SampleQty { get; set; }
        public decimal ReworkQty { get; set; }
        public decimal ScrapQty { get; set; }
        public bool Passed { get; set; }
        public string? Notes { get; set; }
    }

    public class ControlReceiptDto
    {
        public long ReceiptId { get; set; }
        public long TransferId { get; set; }
        public decimal ReceivedQty { get; set; }
        public int ReceivedCount { get; set; }
        public string ReceiverName { get; set; } = string.Empty;
        public bool Approved { get; set; }
        public string? Notes { get; set; }
    }

    public class ResolveDisputeDto
    {
        public long LineId { get; set; }
        public decimal FinalApprovedQty { get; set; }
        public string ResolvedBy { get; set; } = string.Empty;
        public string ChargeTo { get; set; } = string.Empty;
        public string ResolutionNotes { get; set; } = string.Empty;
    }

    public class CreateCustomerDto
    {
        public string CustomerCode { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerType { get; set; } = "Regular";
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public decimal CreditLimit { get; set; }
        public string? PaymentTerms { get; set; }
        public string? TaxNumber { get; set; }
        public bool Active { get; set; } = true;
        public string? Notes { get; set; }
    }

    public class UpdateCustomerDto
    {
        public string CustomerCode { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerType { get; set; } = "Regular";
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public decimal CreditLimit { get; set; }
        public string? PaymentTerms { get; set; }
        public string? TaxNumber { get; set; }
        public bool Active { get; set; } = true;
        public string? Notes { get; set; }
    }

    public class CustomerItemDto
    {
        public long Id { get; set; }
        public long CompanyId { get; set; }
        public string CustomerCode { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerType { get; set; } = "Regular";
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public decimal CreditLimit { get; set; }
        public string? PaymentTerms { get; set; }
        public string? TaxNumber { get; set; }
        public bool Active { get; set; } = true;
        public string? Notes { get; set; }
    }

    public class DepartmentDto
    {
        public long Id { get; set; }
        public long CompanyId { get; set; }
        public string DepartmentCode { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public long? ParentDepartmentId { get; set; }
        public bool Active { get; set; } = true;
        public string? Description { get; set; }
    }
}
