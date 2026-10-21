using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using KayanERP.Api.Models;
using KayanERP.Shared.DTOs;

namespace KayanERP.Api.Services
{
    public interface IMaterialReceiptService
    {
        Task<MaterialReceiptLookupsDto> GetLookupsAsync();
        Task<List<PendingInvoiceDto>> GetPendingInvoicesAsync(long? supplierId = null);
        Task<MaterialReceiptResultDto> ProcessMaterialReceiptAsync(MaterialReceiptPostDto dto);
    }

    public class MaterialReceiptService : IMaterialReceiptService
    {
        private readonly AppDbContext _context;

        public MaterialReceiptService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<MaterialReceiptLookupsDto> GetLookupsAsync()
        {
            var suppliers = await _context.Suppliers
                .AsNoTracking()
                .Where(s => s.Active)
                .OrderBy(s => s.SupplierName)
                .Select(s => new SupplierDto
                {
                    Id = s.Id,
                    SupplierName = s.SupplierName,
                    SupplierCode = s.SupplierCode ?? string.Empty
                })
                .ToListAsync();

            var warehouses = await _context.Warehouses
                .Include(w => w.Branch)
                .AsNoTracking()
                .Where(w => w.Active &&
                           (w.WarehouseName.Contains("خامات") || w.WarehouseName.Contains("رئيسي") ||
                            w.WarehouseName.Contains("تعبئة") || w.WarehouseName.Contains("مستودع") ||
                            w.WarehouseName.Contains("مركزي"))
                         && !w.WarehouseName.Contains("صالة")
                         && !w.WarehouseName.Contains("قسم")
                         && !w.WarehouseName.Contains("إدارة"))
                .OrderBy(w => w.WarehouseName)
                .Select(w => new WarehouseLookupDto
                {
                    Id = w.Id,
                    BranchId = w.BranchId ?? 1L,
                    WarehouseCode = w.WarehouseCode,
                    WarehouseName = w.WarehouseName,
                    Name = w.Branch != null ? $"{w.WarehouseName} [{w.Branch.BranchName}]" : w.WarehouseName
                })
                .ToListAsync();

            if (!warehouses.Any())
            {
                warehouses = await _context.Warehouses
                    .Include(w => w.Branch)
                    .AsNoTracking()
                    .Where(w => w.Active && !w.WarehouseName.Contains("صالة") && !w.WarehouseName.Contains("قسم"))
                    .Select(w => new WarehouseLookupDto
                    {
                        Id = w.Id,
                        BranchId = w.BranchId ?? 1L,
                        WarehouseCode = w.WarehouseCode,
                        WarehouseName = w.WarehouseName,
                        Name = w.Branch != null ? $"{w.WarehouseName} [{w.Branch.BranchName}]" : w.WarehouseName
                    })
                    .ToListAsync();
            }

            return new MaterialReceiptLookupsDto
            {
                Suppliers = suppliers,
                Warehouses = warehouses
            };
        }

        public async Task<List<PendingInvoiceDto>> GetPendingInvoicesAsync(long? supplierId = null)
        {
            var query = _context.PurchaseOrders
                .AsNoTracking()
                .Include(p => p.Supplier)
                .Include(p => p.PurchaseOrderLines).ThenInclude(l => l.Item)
                .Where(p => p.Status == "Approved" || p.Status == "Partially_Received");

            if (supplierId.HasValue && supplierId.Value > 0)
                query = query.Where(p => p.SupplierId == supplierId.Value);

            query = query.Where(p => p.PurchaseOrderLines.Any(l => (l.Quantity - l.ReceivedQuantity) > 0));

            var orders = await query
                .OrderByDescending(p => p.Id)
                .ToListAsync();

            return orders.Select(p => new PendingInvoiceDto
            {
                InvoiceId = p.Id,
                InvoiceNumber = p.OrderNumber,
                InvoiceDate = p.OrderDate.ToDateTime(TimeOnly.MinValue),
                SupplierId = p.SupplierId,
                SupplierName = p.Supplier != null ? p.Supplier.SupplierName : "غير محدد",
                TotalAmount = p.TotalAmount,
                Lines = p.PurchaseOrderLines
                    .Where(l => (l.Quantity - l.ReceivedQuantity) > 0)
                    .Select(l => new PurchaseOrderLineCreateDto
                    {
                        LineId = l.Id,
                        ItemId = l.ItemId,
                        ItemCode = l.Item?.ItemCode ?? string.Empty,
                        ItemName = l.Item?.ItemName ?? string.Empty,
                        Quantity = l.Quantity,
                        ReceivedQuantity = l.ReceivedQuantity,
                        UnitPrice = l.UnitPrice
                    }).ToList()
            }).ToList();
        }

        public async Task<MaterialReceiptResultDto> ProcessMaterialReceiptAsync(MaterialReceiptPostDto dto)
        {
            if (dto == null || dto.Lines == null || !dto.Lines.Any())
                throw new ArgumentException("لا توجد بنود للاستلام أو الفحص.");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var order = await _context.PurchaseOrders
                    .Include(p => p.PurchaseOrderLines)
                    .FirstOrDefaultAsync(p => p.Id == dto.InvoiceId);

                if (order == null)
                    throw new InvalidOperationException("أمر الشراء / الفاتورة غير موجود.");

                if (order.Status == "Closed" || order.Status == "Received" || order.Status == "Rejected")
                    throw new InvalidOperationException("هذه الفاتورة مغلقة أو مرفوضة مسبقاً.");

                var now = DateTime.UtcNow;

                foreach (var item in dto.Lines)
                {
                    var poLine = order.PurchaseOrderLines.FirstOrDefault(l => l.Id == item.LineId);
                    if (poLine != null)
                    {
                        poLine.ReceivedQuantity += item.ReceivedQty;
                    }

                    if (item.ReceivedQty > 0)
                    {
                        long itemId = poLine?.ItemId ?? item.ItemId;

                        var balance = await _context.StockBalances
                            .FirstOrDefaultAsync(b => b.WarehouseId == dto.WarehouseId && b.ItemId == itemId);

                        if (balance != null)
                        {
                            balance.Quantity += item.ReceivedQty;
                            balance.AvailableQuantity = balance.Quantity - balance.ReservedQuantity;
                            balance.LastUpdatedAt = now;
                        }
                        else
                        {
                            _context.StockBalances.Add(new StockBalance
                            {
                                CompanyId = order.CompanyId,
                                WarehouseId = dto.WarehouseId,
                                ItemId = itemId,
                                Quantity = item.ReceivedQty,
                                AvailableQuantity = item.ReceivedQty,
                                ReservedQuantity = 0,
                                LastUpdatedAt = now
                            });
                        }

                        var qcNote = $"LOT: {item.BatchNumber} | صلاحية: {item.ExpiryDate:yyyy-MM-dd} | مقبول";
                        if (!item.IsQcPassed) qcNote = $"LOT: {item.BatchNumber} | مرفوض فني";

                        _context.StockMovements.Add(new StockMovement
                        {
                            CompanyId = order.CompanyId,
                            WarehouseId = dto.WarehouseId,
                            ItemId = itemId,
                            MovementType = item.IsQcPassed ? "PURCHASE_RECEIPT" : "QC_REJECTED",
                            Quantity = item.ReceivedQty,
                            UnitCost = poLine?.UnitPrice ?? item.UnitPrice,
                            ReferenceType = "PURCHASE_ORDER",
                            ReferenceId = order.Id,
                            Notes = qcNote,
                            MovementAt = now,
                            CreatedAt = now
                        });
                    }
                }

                string finalMessage;

                if (order.PurchaseOrderLines.All(l => l.ReceivedQuantity >= l.Quantity))
                {
                    order.Status = "Closed";
                    finalMessage = $"تم اعتماد إذن الفحص وترحيل الرصيد وإغلاق الفاتورة رقم [{order.OrderNumber}] بنجاح!";
                }
                else
                {
                    order.Status = "Partially_Received";
                    finalMessage = $"تم إثبات الاستلام الجزئي للفاتورة رقم [{order.OrderNumber}].";
                }

                order.UpdatedAt = now;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return new MaterialReceiptResultDto
                {
                    Success = true,
                    Message = finalMessage,
                    ReceiptNumber = order.OrderNumber
                };
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}