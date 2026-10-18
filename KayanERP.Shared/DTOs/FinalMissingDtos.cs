using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace KayanERP.Shared.DTOs
{
    // ==========================================
    // 1. مبيعات (Sales) - (ملاحظة: SalesInvoiceCreateDto موجود في SalesDtos.cs، فتم حذفه من هنا لتجنب التكرار)
    // ==========================================

    // ==========================================
    // 2. الموردين (Suppliers) - تم حذفها لتجنب التكرار مع SalesDtos.cs
    // ==========================================

    // ==========================================
    // 3. المخازن والفروع (Warehouses & Branches) - تم حذفها لتجنب التكرار مع SalesDtos.cs
    // ==========================================

    // ==========================================
    // 4. الوصفات وكارت الصنف (Recipes & Stock Card) - تم حذفها لتجنب التكرار
    // ==========================================

    // ==========================================
    // 5. أسعار الموردين (Supplier Price Operation)
    // ==========================================
    public class SupplierPriceOperationResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public long Id { get; set; }
    }

    // ==========================================
    // 6. سطر أمر الشراء (Purchase Order Line) - (موجود أيضاً في PurchaseOrderDtos.cs، لكن سنتركه هنا مؤقتاً لو لم يكن موجوداً هناك)
    // ==========================================
    public class PurchaseOrderCreateLineDto
    {
        [Required] public long ItemId { get; set; }
        [Range(0.01, double.MaxValue)] public decimal Quantity { get; set; }
        [Range(0.01, double.MaxValue)] public decimal UnitPrice { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TaxAmount { get; set; }
        public string? Notes { get; set; }
    }
}