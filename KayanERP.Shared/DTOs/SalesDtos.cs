using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace KayanERP.Shared.DTOs
{
    // ==========================================
    // 1. مبيعات (Sales)
    // ==========================================
    public class SalesInvoiceCreateDto
    {
        [Required] public long CustomerId { get; set; }
        [Required] public long BranchId { get; set; }
        public string PaymentMethod { get; set; } = "CASH";
        public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
        public string? Notes { get; set; }
        [Required]
        [MinLength(1)]
        public List<SalesInvoiceLineCreateDto> Lines { get; set; } = new();
    }

    public class SalesInvoiceLineCreateDto
    {
        [Required] public long ItemId { get; set; }
        [Range(0.01, double.MaxValue)] public decimal Quantity { get; set; }
        [Range(0.01, double.MaxValue)] public decimal UnitPrice { get; set; }
    }

    public class ExtendedSalesInvoiceCreateDto
    {
        [Required] public long CustomerId { get; set; }
        [Required] public long BranchId { get; set; }
        public string PaymentMethod { get; set; } = "CASH";
        public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
        public string? Notes { get; set; }
        [Required]
        [MinLength(1)]
        public List<SalesInvoiceLineCreateDto> InvoiceLines { get; set; } = new();
    }

    public class SalesInvoiceViewDto
    {
        public long Id { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public DateTime InvoiceDate { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public List<SalesInvoiceLineViewDto> Lines { get; set; } = new();
    }

    public class SalesInvoiceLineViewDto
    {
        public long Id { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Total { get; set; }
    }

    public class SalesInvoiceResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public long? InvoiceId { get; set; }
        public string? InvoiceNumber { get; set; }
        public decimal TotalAmount { get; set; }
        public int ItemsCount { get; set; }
    }

    // ==========================================
    // 2. الموردين (Suppliers)
    // ==========================================
    public class SupplierViewDto
    {
        public long Id { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public decimal CurrentBalance { get; set; }
    }

    public class SupplierCreateUpdateDto
    {
        [Required] public string SupplierName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? TaxNumber { get; set; }
    }

    // ==========================================
    // 3. المخازن والفروع (Warehouses & Branches)
    // ==========================================
    public class WarehouseDto
    {
        public long Id { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
        public string WarehouseCode { get; set; } = string.Empty;
        public string? Location { get; set; }
    }

    public class BranchLookupDto
    {
        public long Id { get; set; }
        public string BranchName { get; set; } = string.Empty;
        public string BranchCode { get; set; } = string.Empty;
    }

    public class SalesWarehouseLookupDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    // ==========================================
    // 4. الوصفات وكارت الصنف (Recipes & Stock Card)
    // ==========================================
    public class RecipeImportPreviewDto
    {
        public string ProductName { get; set; } = string.Empty;
        public string RawMaterialName { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public bool IsValid { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public class QuickCreateDto
    {
        [Required] public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
    }

    public class StockCardLookupsResponse
    {
        public List<WarehouseDto> Warehouses { get; set; } = new();
        public List<ItemLookupDto> Items { get; set; } = new();
    }

    public class StockCardReportDto
    {
        public long ItemId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public decimal OpeningBalance { get; set; }
        public decimal TotalIn { get; set; }
        public decimal TotalOut { get; set; }
        public decimal ClosingBalance { get; set; }
    }

    public class ItemStockSummaryDto
    {
        public long ItemId { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public decimal TotalIn { get; set; }
        public decimal TotalOut { get; set; }
        public decimal CurrentBalance { get; set; }
    }

    public class ItemStockCardDetailDto
    {
        public long Id { get; set; }
        public DateTime MovementDate { get; set; }
        public string MovementType { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public string? Notes { get; set; }
    }

    // ==========================================
    // 5. الكلاسات الناقصة اللي بتعمل أخطاء
    // ==========================================
    public class WarehouseLookupDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class ItemLookupDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
    }

    public class CustomerLookupDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class SalesLookupsDto
    {
        public List<CustomerLookupDto> Customers { get; set; } = new();
        public List<ItemLookupDto> Items { get; set; } = new();
        public List<WarehouseLookupDto> Warehouses { get; set; } = new();
    }
}