using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using KayanERP.Api.Models;
using KayanERP.Shared.DTOs;

namespace KayanERP.Api.Services
{
    public class CostingService : ICostingService
    {
        private readonly AppDbContext _context;

        public CostingService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<object> CalculateBatchCostAsync(BatchCostRequestDto dto)
        {
            var order = await _context.ProductionOrders
                .FirstOrDefaultAsync(o => o.Id == dto.ProductionOrderId);

            if (order == null)
            {
                throw new Exception($"أمر الإنتاج برقم {dto.ProductionOrderId} غير موجود.");
            }

            var details = await _context.ProductionOrderDetails
                .Where(d => d.ProductionOrderId == order.Id)
                .ToListAsync();

            decimal totalProducedQuantity = details.Sum(d => Convert.ToDecimal(d.ProducedQuantity));
            if (totalProducedQuantity == 0)
            {
                totalProducedQuantity = await _context.ProductivityLogs
                    .Where(p => p.ProductionOrderId == order.Id)
                    .SumAsync(p => (decimal?)p.ProducedQuantity) ?? 0m;
            }

            decimal totalMaterialsCost = 0m;

            if (dto.MaterialsUsed > 0)
            {
                totalMaterialsCost = dto.MaterialsUsed;
            }
            else
            {
                var consumedMovements = await _context.StockMovements
                    .Where(m => m.ReferenceId == order.Id && m.MovementType == "PRODUCTION_OUT")
                    .ToListAsync();

                if (consumedMovements.Any())
                {
                    totalMaterialsCost = consumedMovements.Sum(m => Math.Abs(m.Quantity) * (m.UnitCost > 0 ? m.UnitCost : 25m));
                }
                else
                {
                    var recipeLines = await _context.ProductionOrderDetails
                        .Include(d => d.Recipe)
                            .ThenInclude(r => r!.RecipeLines)
                                .ThenInclude(rl => rl.ComponentItem)
                        .Where(d => d.ProductionOrderId == order.Id && d.Recipe != null)
                        .SelectMany(d => d.Recipe!.RecipeLines)
                        .ToListAsync();

                    if (recipeLines.Any())
                    {
                        totalMaterialsCost = recipeLines.Sum(l => l.Quantity * ((l.ComponentItem != null && l.ComponentItem.BasePrice > 0) ? l.ComponentItem.BasePrice : 25m));
                    }
                }
            }

            var actualHoursFromLogs = await _context.ProductivityLogs
                .Where(p => p.ProductionOrderId == order.Id)
                .SumAsync(p => (decimal?)p.HoursWorked) ?? 0m;

            decimal workingHours = actualHoursFromLogs > 0 ? actualHoursFromLogs : 8m;
            decimal laborRate = dto.LaborCostPerHour > 0 ? dto.LaborCostPerHour : 50m;
            decimal totalLaborCost = workingHours * laborRate;

            decimal totalBatchCost = totalMaterialsCost + totalLaborCost + dto.OverheadCostPerBatch;
            decimal unitCost = totalProducedQuantity > 0 ? (totalBatchCost / totalProducedQuantity) : 0m;

            return new
            {
                OrderId = order.Id,
                OrderNumber = order.OrderNumber,
                Notes = order.Notes,
                ProducedQuantity = totalProducedQuantity,
                ActualHoursWorked = workingHours,
                CostBreakdown = new
                {
                    TotalMaterialsCost = Math.Round(totalMaterialsCost, 2),
                    TotalLaborCost = Math.Round(totalLaborCost, 2),
                    OverheadCost = Math.Round(dto.OverheadCostPerBatch, 2)
                },
                TotalBatchCost = Math.Round(totalBatchCost, 2),
                UnitCost = Math.Round(unitCost, 2)
            };
        }
    }
}