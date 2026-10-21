using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using KayanERP.Api.Models;
using KayanERP.Shared.DTOs;

namespace KayanERP.Api.Services
{
    public interface IPurchaseOrderService
    {
        Task<PurchaseOrderLookupsDto> GetLookupsAsync();
        Task<List<PurchaseOrderDto>> GetAllOrdersAsync();
        Task<PurchaseOrderDto?> GetOrderByIdAsync(long id);
        Task<PurchaseOrderResultDto> CreateOrderAsync(PurchaseOrderCreateDto dto);
        Task<bool> ApproveInvoiceAsync(PoApproveDto dto);
    }

    public class PurchaseOrderService : IPurchaseOrderService
    {
        private readonly AppDbContext _context;

        public PurchaseOrderService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PurchaseOrderLookupsDto> GetLookupsAsync()
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
                .AsNoTracking()
                .Where(w => w.Active)
                .OrderBy(w => w.WarehouseName)
                .Select(w => new WarehouseLookupDto
                {
                    Id = w.Id,
                    BranchId = w.BranchId ?? 1L,
                    WarehouseName = w.WarehouseName,
                    WarehouseCode = w.WarehouseCode,
                    Name = w.WarehouseName
                })
                .ToListAsync();

            var items = await _context.Items
                .AsNoTracking()
                .Where(i => i.Active)
                .OrderBy(i => i.ItemName)
                .Select(i => new ItemLookupDto
                {
                    Id = i.Id,
                    ItemId = i.Id,
                    ItemCode = i.ItemCode,
                    ItemName = i.ItemName,
                    Name = i.ItemName,
                    Price = i.BasePrice,
                    BasePrice = i.BasePrice,
                    Unit = i.Unit ?? "قطعة"
                })
                .ToListAsync();

            return new PurchaseOrderLookupsDto
            {
                Suppliers = suppliers,
                Warehouses = warehouses,
                Items = items
            };
        }

        public async Task<List<PurchaseOrderDto>> GetAllOrdersAsync()
        {
            var orders = await _context.PurchaseOrders
                .AsNoTracking()
                .Include(p => p.Supplier)
                .Include(p => p.PurchaseOrderLines).ThenInclude(l => l.Item)
                .OrderByDescending(p => p.Id)
                .ToListAsync();

            return orders.Select(p => new PurchaseOrderDto
            {
                Id = p.Id,
                OrderNumber = p.OrderNumber,
                OrderDate = p.OrderDate.ToDateTime(TimeOnly.MinValue),
                SupplierName = p.Supplier != null ? p.Supplier.SupplierName : "غير محدد",
                Status = p.Status,
                TotalAmount = p.TotalAmount,
                Lines = p.PurchaseOrderLines.Select(l => new PurchaseOrderLineCreateDto
                {
                    Id = l.Id,
                    ItemId = l.ItemId,
                    ItemCode = l.Item?.ItemCode ?? string.Empty,
                    ItemName = l.Item?.ItemName ?? string.Empty,
                    Unit = l.Item?.Unit ?? string.Empty,
                    Quantity = l.Quantity,
                    ReceivedQuantity = l.ReceivedQuantity,
                    UnitPrice = l.UnitPrice
                }).ToList()
            }).ToList();
        }

        public async Task<PurchaseOrderDto?> GetOrderByIdAsync(long id)
        {
            var p = await _context.PurchaseOrders
                .AsNoTracking()
                .Include(o => o.Supplier)
                .Include(o => o.PurchaseOrderLines).ThenInclude(l => l.Item)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (p == null) return null;

            return new PurchaseOrderDto
            {
                Id = p.Id,
                OrderNumber = p.OrderNumber,
                OrderDate = p.OrderDate.ToDateTime(TimeOnly.MinValue),
                SupplierName = p.Supplier != null ? p.Supplier.SupplierName : "غير محدد",
                Status = p.Status,
                TotalAmount = p.TotalAmount,
                Lines = p.PurchaseOrderLines.Select(l => new PurchaseOrderLineCreateDto
                {
                    Id = l.Id,
                    ItemId = l.ItemId,
                    ItemCode = l.Item?.ItemCode ?? string.Empty,
                    ItemName = l.Item?.ItemName ?? string.Empty,
                    Unit = l.Item?.Unit ?? string.Empty,
                    Quantity = l.Quantity,
                    ReceivedQuantity = l.ReceivedQuantity,
                    UnitPrice = l.UnitPrice
                }).ToList()
            };
        }

        public async Task<PurchaseOrderResultDto> CreateOrderAsync(PurchaseOrderCreateDto dto)
        {
            if (dto == null || dto.Lines == null || !dto.Lines.Any())
                throw new InvalidOperationException("يجب إضافة بنود لأمر الشراء.");

            var now = DateTime.UtcNow;
            int count = await _context.PurchaseOrders.CountAsync(o => o.CreatedAt.Year == now.Year && o.CreatedAt.Month == now.Month);
            string orderNumber = $"PO-{now:yyyyMM}-{(count + 1):D4}";

            var order = new PurchaseOrder
            {
                CompanyId = 1,
                OrderNumber = orderNumber,
                OrderDate = DateOnly.FromDateTime(now),
                SupplierId = dto.SupplierId,
                WarehouseId = dto.WarehouseId > 0 ? dto.WarehouseId : 1L,
                Status = "Draft",
                TotalAmount = dto.Lines.Sum(l => l.Quantity * l.UnitPrice),
                CreatedAt = now,
                UpdatedAt = now
            };

            foreach (var line in dto.Lines)
            {
                order.PurchaseOrderLines.Add(new PurchaseOrderLine
                {
                    ItemId = line.ItemId,
                    Quantity = line.Quantity,
                    UnitPrice = line.UnitPrice,
                    ReceivedQuantity = 0
                });
            }

            _context.PurchaseOrders.Add(order);
            await _context.SaveChangesAsync();

            return new PurchaseOrderResultDto
            {
                Success = true,
                OrderId = order.Id,
                OrderNumber = order.OrderNumber,
                Message = "تم إنشاء أمر الشراء بنجاح."
            };
        }

        public async Task<bool> ApproveInvoiceAsync(PoApproveDto dto)
        {
            var order = await _context.PurchaseOrders.FindAsync(dto.OrderId);
            if (order == null) return false;

            order.Status = "Approved";
            order.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
