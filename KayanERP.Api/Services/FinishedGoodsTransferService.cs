using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using KayanERP.Api.Models;
using KayanERP.Shared.DTOs;

namespace KayanERP.Api.Services
{
    public interface IFinishedGoodsTransferService
    {
        Task<List<FinishedGoodsTransferViewDto>> GetAllTransfersAsync();
        Task<TransferLookupsDto> GetLookupsAsync();
        Task<bool> CreateTransferAsync(CreateTransferRequestDto dto);
        Task<bool> AuditCostingAsync(CostingAuditDto dto);
        Task<ResolveCostingDisputeDto> ResolveCostingDisputeAsync(ResolveCostingDisputeDto dto);
        Task<bool> InspectQcAsync(QcInspectionDto dto);
        Task<bool> ReSubmitReworkAsync(long transferId, decimal adjustedQty, int adjustedCount, string notes);
        Task<bool> ReceiveAtControlAsync(ControlReceiptDto dto);
        Task<bool> ResolveDisputeAsync(ResolveDisputeDto dto);
    }

    public class FinishedGoodsTransferService : IFinishedGoodsTransferService
    {
        private readonly AppDbContext _context;

        public FinishedGoodsTransferService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<FinishedGoodsTransferViewDto>> GetAllTransfersAsync()
        {
            var transfers = await _context.FinishedGoodsTransfers
                .AsNoTracking()
                .Include(t => t.SourceWarehouse)
                .Include(t => t.DestinationWarehouse)
                .Include(t => t.Item)
                .OrderByDescending(t => t.Id)
                .ToListAsync();

            return transfers.Select(t => new FinishedGoodsTransferViewDto
            {
                Id = t.Id,
                TransferNumber = t.TransferNumber,
                TransferDate = t.TransferDate.ToDateTime(TimeOnly.MinValue),
                SourceWarehouseName = t.SourceWarehouse?.WarehouseName ?? "مخزن غير محدد",
                DestinationWarehouseName = t.DestinationWarehouse?.WarehouseName ?? "مخزن غير محدد",
                ItemName = t.Item?.ItemName ?? "صنف غير محدد",
                ItemCode = t.Item?.ItemCode ?? string.Empty,
                BatchNumber = t.BatchNumber,
                ExpiryDate = t.ExpiryDate != null ? t.ExpiryDate.Value.ToDateTime(TimeOnly.MinValue) : null,
                ProdDispatchedQty = t.ProdDispatchedQty,
                ProdDispatchedCount = t.ProdDispatchedCount,
                ProdNotes = t.ProdNotes,
                CostingActualQty = t.CostingActualQty ?? 0,
                CostingActualCount = t.CostingActualCount ?? 0
            }).ToList();
        }

        public async Task<TransferLookupsDto> GetLookupsAsync()
        {
            var warehouses = await _context.Warehouses
                .AsNoTracking()
                .Where(w => w.Active)
                .Select(w => new WarehouseLookupDto
                {
                    Id = w.Id,
                    BranchId = w.BranchId ?? 1L,
                    WarehouseName = w.WarehouseName,
                    WarehouseCode = w.WarehouseCode,
                    Name = w.WarehouseName
                }).ToListAsync();

            var items = await _context.Items
                .AsNoTracking()
                .Where(i => i.Active)
                .Select(i => new ItemLookupDto
                {
                    Id = i.Id,
                    ItemId = i.Id,
                    ItemCode = i.ItemCode,
                    ItemName = i.ItemName,
                    Name = i.ItemName,
                    BasePrice = i.BasePrice,
                    Price = i.BasePrice,
                    Unit = i.Unit ?? "قطعة"
                }).ToListAsync();

            return new TransferLookupsDto
            {
                Warehouses = warehouses,
                Items = items
            };
        }

        public async Task<bool> CreateTransferAsync(CreateTransferRequestDto dto)
        {
            var now = DateTime.UtcNow;
            int count = await _context.FinishedGoodsTransfers
                .CountAsync(t => t.CreatedAt.Year == now.Year && t.CreatedAt.Month == now.Month);

            var transfer = new FinishedGoodsTransfer
            {
                TransferNumber = $"FGT-{now:yyyyMM}-{(count + 1):D4}",
                TransferDate = DateOnly.FromDateTime(now),
                SourceWarehouseId = dto.SourceWarehouseId,
                DestinationWarehouseId = dto.DestinationWarehouseId,
                ItemId = dto.ItemId,
                BatchNumber = dto.BatchNumber ?? string.Empty,
                ExpiryDate = dto.ExpiryDate != null ? DateOnly.FromDateTime(dto.ExpiryDate.Value) : null,
                ProdDispatchedQty = dto.DispatchedQty,
                ProdDispatchedCount = dto.DispatchedCount,
                ProdNotes = dto.Notes,
                ProdSubmittedBy = "مشرف الصالة",
                Status = "PENDING_COSTING",
                CreatedAt = now
            };

            _context.FinishedGoodsTransfers.Add(transfer);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AuditCostingAsync(CostingAuditDto dto)
        {
            var t = await _context.FinishedGoodsTransfers.FindAsync(dto.TransferId);
            if (t == null) return false;

            t.CostingActualQty = dto.ActualWeight;
            t.CostingActualCount = dto.ActualCount;
            t.CostingWeightDiff = dto.ActualWeight - t.ProdDispatchedQty;
            t.CostingCountDiff = dto.ActualCount - t.ProdDispatchedCount;
            t.CostingDiscrepancyFlag = dto.EscalateDispute;
            t.CostingAuditor = dto.AuditorName;
            t.CostingAuditedAt = DateTime.UtcNow;
            t.CostingNotes = dto.Notes;
            t.Status = dto.EscalateDispute ? "COSTING_DISPUTE" : "PENDING_QC";

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<ResolveCostingDisputeDto> ResolveCostingDisputeAsync(ResolveCostingDisputeDto dto)
        {
            var t = await _context.FinishedGoodsTransfers.FindAsync(dto.TransferId);
            if (t != null)
            {
                t.CostingDisputeStatus = "RESOLVED";
                t.CostingDisputeNotes = dto.ResolutionNotes;
                t.CostingDisputeResolvedBy = dto.ResolvedBy;
                t.CostingDisputeResolvedAt = DateTime.UtcNow;
                t.CostingDisputeChargeTo = dto.ChargeTo;
                t.Status = "PENDING_QC";
                await _context.SaveChangesAsync();
            }
            return dto;
        }

        public async Task<bool> InspectQcAsync(QcInspectionDto dto)
        {
            var t = await _context.FinishedGoodsTransfers.FindAsync(dto.TransferId);
            if (t == null) return false;

            t.QcApprovedQty = dto.Passed ? (t.ProdDispatchedQty - dto.ReworkQty - dto.ScrapQty) : 0;
            t.QcSampleQty = dto.SampleQty;
            t.QcReworkQty = dto.ReworkQty;
            t.QcScrapQty = dto.ScrapQty;
            t.QcInspector = dto.InspectorName;
            t.QcInspectedAt = DateTime.UtcNow;
            t.QcNotes = dto.Notes;
            t.Status = dto.ReworkQty > 0 ? "QC_REWORK" : (dto.Passed ? "PENDING_CONTROL" : "QC_REJECTED");

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ReSubmitReworkAsync(long transferId, decimal adjustedQty, int adjustedCount, string notes)
        {
            var t = await _context.FinishedGoodsTransfers.FindAsync(transferId);
            if (t == null) return false;

            t.ProdDispatchedQty = adjustedQty;
            t.ProdDispatchedCount = adjustedCount;
            t.ProdNotes = (t.ProdNotes ?? "") + " | إعادة تسليم: " + notes;
            t.Status = "PENDING_COSTING";

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ReceiveAtControlAsync(ControlReceiptDto dto)
        {
            var t = await _context.FinishedGoodsTransfers.FindAsync(dto.TransferId);
            if (t == null) return false;

            t.ReceivedActualQty = dto.ReceivedQty;
            t.ReceivedActualCount = dto.ReceivedCount;
            t.ControlReceiverName = dto.ReceiverName;
            t.ControlReceivedAt = DateTime.UtcNow;
            t.ControlNotes = dto.Notes;
            t.HasDispute = !dto.Approved;
            t.Status = !dto.Approved ? "CONTROL_DISPUTE" : "COMPLETED";

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ResolveDisputeAsync(ResolveDisputeDto dto)
        {
            var t = await _context.FinishedGoodsTransfers.FindAsync(dto.TransferId);
            if (t == null) return false;

            t.DisputeStatus = "RESOLVED";
            t.DisputeResolvedBy = dto.ResolvedBy;
            t.DisputeResolvedAt = DateTime.UtcNow;
            t.Status = "COMPLETED";

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
