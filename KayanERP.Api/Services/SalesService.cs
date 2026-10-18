using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using KayanERP.Api.Models;
using KayanERP.Shared.DTOs;

namespace KayanERP.Api.Services
{
    public interface ISalesService
    {
        Task<SalesLookupsDto> GetLookupsAsync();
        Task<List<SalesInvoiceViewDto>> GetAllInvoicesAsync();
        Task<SalesInvoiceViewDto?> GetInvoiceByIdAsync(long id);
        Task<SalesInvoiceResultDto> CreateInvoiceAsync(ExtendedSalesInvoiceCreateDto dto);
    }

    public class SalesService : ISalesService
    {
        private readonly AppDbContext _context;

        public SalesService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<SalesLookupsDto> GetLookupsAsync()
        {
            var customers = await _context.Customers
                .AsNoTracking()
                .Where(c => c.Active)
                .OrderBy(c => c.CustomerName)
                .Select(c => new CustomerLookupDto
                {
                    Id = c.Id,
                    Name = c.CustomerName
                })
                .ToListAsync();

            var items = await _context.Items
                .AsNoTracking()
                .Where(i => i.Active)
                .OrderBy(i => i.ItemName)
                .Select(i => new ItemLookupDto
                {
                    Id = i.Id,
                    Name = i.ItemName,
                    Price = i.BasePrice
                })
                .ToListAsync();

            var warehouses = await _context.Warehouses
                .AsNoTracking()
                .Where(w => w.Active)
                .OrderBy(w => w.WarehouseName)
                .Select(w => new WarehouseLookupDto
                {
                    Id = w.Id,
                    Name = w.WarehouseName
                })
                .ToListAsync();

            return new SalesLookupsDto
            {
                Customers = customers,
                Items = items,
                Warehouses = warehouses
            };
        }

        public async Task<List<SalesInvoiceViewDto>> GetAllInvoicesAsync()
        {
            var invoices = await _context.SalesInvoices
                .AsNoTracking()
                .Include(i => i.InvoiceLines)
                .OrderByDescending(i => i.Id)
                .ToListAsync();

            var customerIds = invoices.Select(i => i.CustomerId).Distinct().ToList();
            var customers = await _context.Customers
                .AsNoTracking()
                .Where(c => customerIds.Contains(c.Id))
                .ToDictionaryAsync(c => c.Id, c => c.CustomerName);

            var itemIds = invoices.SelectMany(i => i.InvoiceLines.Select(l => l.ItemId)).Distinct().ToList();
            var items = await _context.Items
                .AsNoTracking()
                .Where(it => itemIds.Contains(it.Id))
                .ToDictionaryAsync(it => it.Id, it => it.ItemName);

            return invoices.Select(inv => new SalesInvoiceViewDto
            {
                Id = inv.Id,
                InvoiceNumber = inv.InvoiceNumber,
                InvoiceDate = inv.InvoiceDate,
                CustomerName = customers.ContainsKey(inv.CustomerId) ? customers[inv.CustomerId] : "عميل غير محدد",
                TotalAmount = inv.TotalAmount,
                PaymentMethod = "CASH",
                Status = "Posted",
                Lines = inv.InvoiceLines.Select(l => new SalesInvoiceLineViewDto
                {
                    Id = l.Id,
                    ItemName = items.ContainsKey(l.ItemId) ? items[l.ItemId] : "صنف",
                    Quantity = l.Quantity,
                    UnitPrice = l.UnitPrice,
                    Total = l.LineTotal
                }).ToList()
            }).ToList();
        }

        public async Task<SalesInvoiceViewDto?> GetInvoiceByIdAsync(long id)
        {
            var inv = await _context.SalesInvoices
                .AsNoTracking()
                .Include(i => i.InvoiceLines)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (inv == null) return null;

            var customer = await _context.Customers.FindAsync(inv.CustomerId);

            var itemIds = inv.InvoiceLines.Select(l => l.ItemId).Distinct().ToList();
            var items = await _context.Items
                .AsNoTracking()
                .Where(it => itemIds.Contains(it.Id))
                .ToDictionaryAsync(it => it.Id, it => it.ItemName);

            return new SalesInvoiceViewDto
            {
                Id = inv.Id,
                InvoiceNumber = inv.InvoiceNumber,
                InvoiceDate = inv.InvoiceDate,
                CustomerName = customer != null ? customer.CustomerName : "عميل غير محدد",
                TotalAmount = inv.TotalAmount,
                PaymentMethod = "CASH",
                Status = "Posted",
                Lines = inv.InvoiceLines.Select(l => new SalesInvoiceLineViewDto
                {
                    Id = l.Id,
                    ItemName = items.ContainsKey(l.ItemId) ? items[l.ItemId] : "صنف",
                    Quantity = l.Quantity,
                    UnitPrice = l.UnitPrice,
                    Total = l.LineTotal
                }).ToList()
            };
        }

        public async Task<SalesInvoiceResultDto> CreateInvoiceAsync(ExtendedSalesInvoiceCreateDto dto)
        {
            if (dto == null || dto.InvoiceLines == null || !dto.InvoiceLines.Any())
                throw new InvalidOperationException("يجب إضافة صنف واحد على الأقل لإنشاء الفاتورة.");

            var customer = await _context.Customers.FindAsync(dto.CustomerId);
            if (customer == null)
                throw new InvalidOperationException($"العميل رقم {dto.CustomerId} غير موجود في النظام.");

            long warehouseId = await _context.Warehouses.Where(w => w.Active).Select(w => w.Id).FirstOrDefaultAsync();
            if (warehouseId <= 0)
                throw new InvalidOperationException("تعذر تحديد مستودع صرف المبيعات.");

            var now = DateTime.UtcNow;
            decimal finalTotalAmount = dto.InvoiceLines.Sum(l => l.Quantity * l.UnitPrice);

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                int monthlyCount = await _context.SalesInvoices
                    .CountAsync(i => i.InvoiceDate.Year == now.Year && i.InvoiceDate.Month == now.Month);
                string invoiceNumber = $"INV-{now:yyyyMM}-{(monthlyCount + 1):D4}";

                var invoice = new SalesInvoice
                {
                    CompanyId = customer.CompanyId > 0 ? customer.CompanyId : 1,
                    InvoiceNumber = invoiceNumber,
                    InvoiceDate = now,
                    BranchId = dto.BranchId,
                    CustomerId = dto.CustomerId,
                    TotalAmount = finalTotalAmount,
                    CreatedAt = now
                };

                foreach (var line in dto.InvoiceLines)
                {
                    invoice.InvoiceLines.Add(new SalesInvoiceLine
                    {
                        ItemId = line.ItemId,
                        Quantity = line.Quantity,
                        UnitPrice = line.UnitPrice,
                        LineTotal = line.Quantity * line.UnitPrice
                    });
                }

                _context.SalesInvoices.Add(invoice);
                await _context.SaveChangesAsync();

                foreach (var line in dto.InvoiceLines)
                {
                    var stockBal = await _context.StockBalances
                        .FirstOrDefaultAsync(b => b.ItemId == line.ItemId && b.WarehouseId == warehouseId);

                    if (stockBal != null)
                    {
                        stockBal.Quantity -= line.Quantity;
                        stockBal.LastUpdatedAt = now;
                    }
                    else
                    {
                        _context.StockBalances.Add(new StockBalance
                        {
                            CompanyId = customer.CompanyId > 0 ? customer.CompanyId : 1,
                            WarehouseId = warehouseId,
                            ItemId = line.ItemId,
                            Quantity = -line.Quantity,
                            ReservedQuantity = 0,
                            LastUpdatedAt = now
                        });
                    }

                    _context.StockMovements.Add(new StockMovement
                    {
                        CompanyId = customer.CompanyId > 0 ? customer.CompanyId : 1,
                        WarehouseId = warehouseId,
                        ItemId = line.ItemId,
                        MovementType = "SALES_ISSUE",
                        Quantity = -line.Quantity,
                        ReferenceType = "SALES_INVOICE",
                        ReferenceId = invoice.Id,
                        MovementAt = now,
                        CreatedAt = now,
                        Notes = $"فاتورة مبيعات رقم [{invoice.InvoiceNumber}]"
                    });
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return new SalesInvoiceResultDto
                {
                    Success = true,
                    InvoiceId = invoice.Id,
                    InvoiceNumber = invoice.InvoiceNumber,
                    Message = "تم إصدار الفاتورة بنجاح."
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