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
        Task<List<PurchaseOrderDto>> GetAllOrdersAsync();
        Task<PurchaseOrderDto?> GetOrderByIdAsync(long id);
        Task<PurchaseOrderResultDto> CreateOrderAsync(PurchaseOrderCreateDto dto);
        Task<bool> ApproveInvoiceAsync(PoApproveDto dto);
        Task<PurchaseOrderLookupsDto> GetLookupsAsync();
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
                .Select(s => new SupplierLookupDto
                {
                    Id = s.Id,
                    SupplierName = s.SupplierName
                })
                .ToListAsync();

            var warehouses = await _context.Warehouses
                .Include(w => w.Branch)
                .AsNoTracking()
                .Where(w => w.Active)
                .OrderBy(w => w.WarehouseName)
                .Select(w => new WarehouseLookupDto
                {
                    Id = w.Id,
                    Name = w.Branch != null ? $"{w.WarehouseName} - [{w.Branch.BranchName}]" : w.WarehouseName
                })
                .ToListAsync();

            var items = await _context.Items
                .AsNoTracking()
                .Where(i => i.Active)
                .OrderBy(i => i.ItemName)
                .Select(i => new ItemLookupDto
                {
                    Id = i.Id,
                    Name = i.ItemName
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
            return await _context.PurchaseOrders
                .AsNoTracking()
                .Include(po => po.Supplier)
                .Include(po => po.PurchaseOrderLines)
                    .ThenInclude(l => l.Item)
                .OrderByDescending(po => po.Id)
                .Select(po => new PurchaseOrderDto
                {
                    Id = po.Id,
                    OrderNumber = po.OrderNumber,
                    OrderDate = po.OrderDate.ToDateTime(TimeOnly.Min),
                    SupplierName = po.Supplier != null ? po.Supplier.SupplierName : "قيد التحديد",
                    Status = po.Status,
                    TotalAmount = po.TotalAmount,
                    Lines = po.PurchaseOrderLines.Select(l => new PurchaseOrderLineDto
                    {
                        LineId = l.Id,
                        ItemName = l.Item != null ? l.Item.ItemName : string.Empty,
                        Quantity = l.Quantity,
                        UnitPrice = l.UnitPrice,
                        Total = l.LineTotal
                    }).ToList()
                })
                .ToListAsync();
        }

        public async Task<PurchaseOrderDto?> GetOrderByIdAsync(long id)
        {
            var po = await _context.PurchaseOrders
                .AsNoTracking()
                .Include(p => p.Supplier)
                .Include(p => p.PurchaseOrderLines)
                    .ThenInclude(l => l.Item)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (po == null) return null;

            return new PurchaseOrderDto
            {
                Id = po.Id,
                OrderNumber = po.OrderNumber,
                OrderDate = po.OrderDate.ToDateTime(TimeOnly.Min),
                SupplierName = po.Supplier?.SupplierName ?? "قيد التحديد",
                Status = po.Status,
                TotalAmount = po.TotalAmount,
                Lines = po.PurchaseOrderLines.Select(l => new PurchaseOrderLineDto
                {
                    LineId = l.Id,
                    ItemName = l.Item != null ? l.Item.ItemName : string.Empty,
                    Quantity = l.Quantity,
                    UnitPrice = l.UnitPrice,
                    Total = l.LineTotal
                }).ToList()
            };
        }

        public async Task<PurchaseOrderResultDto> CreateOrderAsync(PurchaseOrderCreateDto dto)
        {
            if (dto == null || dto.Lines == null || !dto.Lines.Any())
                throw new ArgumentException("يجب إضافة بنود للطلب أولاً.");

            decimal subtotal = dto.Lines.Sum(l => l.Quantity * l.UnitPrice);

            string generatedOrderNumber = $"PO-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(100, 999)}";

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var po = new PurchaseOrder
                {
                    CompanyId = 1,
                    SupplierId = dto.SupplierId,
                    WarehouseId = dto.WarehouseId,
                    OrderNumber = generatedOrderNumber,
                    OrderDate = DateOnly.FromDateTime(DateTime.UtcNow),
                    Status = "Pending_Procurement",
                    Subtotal = subtotal,
                    DiscountAmount = 0,
                    TaxAmount = 0,
                    TotalAmount = subtotal,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.PurchaseOrders.Add(po);
                await _context.SaveChangesAsync();

                foreach (var line in dto.Lines)
                {
                    var poLine = new PurchaseOrderLine
                    {
                        PurchaseOrderId = po.Id,
                        ItemId = line.ItemId,
                        Quantity = line.Quantity,
                        UnitPrice = line.UnitPrice,
                        DiscountAmount = 0,
                        TaxAmount = 0,
                        ReceivedQuantity = 0,
                        LineTotal = line.Quantity * line.UnitPrice
                    };
                    _context.PurchaseOrderLines.Add(poLine);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return new PurchaseOrderResultDto
                {
                    Success = true,
                    OrderId = po.Id,
                    OrderNumber = po.OrderNumber,
                    Message = "تم إنشاء أمر الشراء بنجاح."
                };
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> ApproveInvoiceAsync(PoApproveDto dto)
        {
            if (dto == null || dto.OrderId <= 0) return false;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var order = await _context.PurchaseOrders.FindAsync(dto.OrderId);
                if (order == null) return false;

                order.Status = "Approved";
                order.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}