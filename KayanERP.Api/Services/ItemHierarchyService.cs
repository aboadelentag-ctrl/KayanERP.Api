using Microsoft.EntityFrameworkCore;
using KayanERP.Api.Models;
using KayanERP.Shared.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace KayanERP.Api.Services
{
    public interface IItemHierarchyService
    {
        Task<List<UomConversionDto>> GetAllConversionsAsync();
        Task<bool> CreateConversionAsync(UomConversionCreateDto dto);
        Task<decimal> ConvertUnitAsync(decimal quantity, string fromUnit, string toUnit, long? itemId);

        Task<List<ParentItemLookupDto>> GetParentItemsLookupAsync();
        Task<List<ItemVariantDto>> GetVariantsByParentIdAsync(long parentId);
        Task<List<ItemVariantDto>> GetAllVariantsAsync();
        Task<bool> CreateItemVariantAsync(ItemVariantCreateDto dto);
    }

    public class ItemHierarchyService : IItemHierarchyService
    {
        private readonly AppDbContext _context;

        public ItemHierarchyService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<UomConversionDto>> GetAllConversionsAsync()
        {
            return await _context.ItemUomConversions
                .AsNoTracking()
                .OrderByDescending(c => c.Id)
                .Select(c => new UomConversionDto
                {
                    Id = c.Id,
                    ItemId = c.ItemId ?? 0,
                    ItemName = c.ItemId != null
                        ? (_context.Items.Where(i => i.Id == c.ItemId).Select(i => i.ItemName).FirstOrDefault() ?? "صنف")
                        : "تحويل قياسي عام للمصنع",
                    FromUnit = c.FromUnit,
                    ToUnit = c.ToUnit,
                    ConversionFactor = c.ConversionFactor,
                    Notes = c.Notes
                })
                .ToListAsync();
        }

        public async Task<bool> CreateConversionAsync(UomConversionCreateDto dto)
        {
            if (dto == null || dto.ConversionFactor <= 0 ||
                string.IsNullOrWhiteSpace(dto.FromUnit) || string.IsNullOrWhiteSpace(dto.ToUnit))
                return false;

            long? itemId = dto.ItemId > 0 ? dto.ItemId : null;
            string fromUnit = dto.FromUnit.Trim();
            string toUnit = dto.ToUnit.Trim();

            var existing = await _context.ItemUomConversions
                .FirstOrDefaultAsync(c => c.ItemId == itemId &&
                    ((c.FromUnit.ToLower() == fromUnit.ToLower() && c.ToUnit.ToLower() == toUnit.ToLower()) ||
                     (c.FromUnit.ToLower() == toUnit.ToLower() && c.ToUnit.ToLower() == fromUnit.ToLower())));

            if (existing != null)
            {
                existing.FromUnit = fromUnit;
                existing.ToUnit = toUnit;
                existing.ConversionFactor = dto.ConversionFactor;
                existing.Notes = dto.Notes;
            }
            else
            {
                var conversion = new ItemUomConversion
                {
                    CompanyId = 1,
                    ItemId = itemId,
                    FromUnit = fromUnit,
                    ToUnit = toUnit,
                    ConversionFactor = dto.ConversionFactor,
                    Notes = dto.Notes,
                    CreatedAt = DateTime.UtcNow
                };
                _context.ItemUomConversions.Add(conversion);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<decimal> ConvertUnitAsync(decimal quantity, string fromUnit, string toUnit, long? itemId)
        {
            if (string.Equals(fromUnit, toUnit, StringComparison.OrdinalIgnoreCase))
                return quantity;

            var rules = await _context.ItemUomConversions
                .AsNoTracking()
                .Where(c => (c.ItemId == itemId || c.ItemId == null) &&
                            ((c.FromUnit.ToLower() == fromUnit.ToLower() && c.ToUnit.ToLower() == toUnit.ToLower()) ||
                             (c.FromUnit.ToLower() == toUnit.ToLower() && c.ToUnit.ToLower() == fromUnit.ToLower())))
                .ToListAsync();

            if (!rules.Any()) return quantity;

            var rule = rules.OrderByDescending(c => c.ItemId.HasValue).First();

            if (rule.ConversionFactor <= 0) return quantity;

            if (string.Equals(rule.FromUnit, fromUnit, StringComparison.OrdinalIgnoreCase))
                return quantity * rule.ConversionFactor;
            else
                return quantity / rule.ConversionFactor;
        }

        public async Task<List<ParentItemLookupDto>> GetParentItemsLookupAsync()
        {
            return await _context.Items
                .AsNoTracking()
                .Where(i => i.Active && i.ParentItemId == null)
                .OrderBy(i => i.ItemName)
                .Select(i => new ParentItemLookupDto
                {
                    Id = i.Id,
                    ItemCode = i.ItemCode,
                    ItemName = i.ItemName,
                    Unit = i.Unit
                })
                .ToListAsync();
        }

        public async Task<List<ItemVariantDto>> GetVariantsByParentIdAsync(long parentId)
        {
            return await _context.Items
                .AsNoTracking()
                .Where(i => i.ParentItemId == parentId)
                .OrderBy(i => i.ItemCode)
                .Select(i => new ItemVariantDto
                {
                    Id = i.Id,
                    ItemCode = i.ItemCode,
                    ItemName = i.ItemName,
                    ItemType = i.ItemType,
                    Unit = i.Unit,
                    ParentItemId = i.ParentItemId ?? 0L,
                    ParentItemName = _context.Items.Where(p => p.Id == parentId).Select(p => p.ItemName).FirstOrDefault() ?? string.Empty,
                    Active = i.Active
                })
                .ToListAsync();
        }

        public async Task<List<ItemVariantDto>> GetAllVariantsAsync()
        {
            return await _context.Items
                .AsNoTracking()
                .Where(i => i.ParentItemId != null)
                .OrderByDescending(i => i.Id)
                .Select(i => new ItemVariantDto
                {
                    Id = i.Id,
                    ItemCode = i.ItemCode,
                    ItemName = i.ItemName,
                    ItemType = i.ItemType,
                    Unit = i.Unit,
                    ParentItemId = i.ParentItemId ?? 0L,
                    ParentItemName = _context.Items.Where(p => p.Id == i.ParentItemId).Select(p => p.ItemName).FirstOrDefault() ?? string.Empty,
                    Active = i.Active
                })
                .ToListAsync();
        }

        public async Task<bool> CreateItemVariantAsync(ItemVariantCreateDto dto)
        {
            if (dto == null || dto.ParentItemId <= 0 || string.IsNullOrWhiteSpace(dto.VariantName))
                return false;

            var parent = await _context.Items.FindAsync(dto.ParentItemId);
            if (parent == null) return false;

            string variantCode = dto.VariantCode?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(variantCode))
            {
                int count = await _context.Items.CountAsync(i => i.ParentItemId == parent.Id);
                variantCode = $"{parent.ItemCode}-{(count + 1):D2}";
            }

            bool codeExists = await _context.Items.AnyAsync(i => i.ItemCode.ToLower() == variantCode.ToLower());
            if (codeExists)
            {
                variantCode = $"{variantCode}-{Random.Shared.Next(10, 99)}";
            }

            var variantItem = new Item
            {
                CompanyId = parent.CompanyId,
                CategoryId = parent.CategoryId,
                DepartmentId = parent.DepartmentId,
                DepartmentName = parent.DepartmentName,
                ItemType = parent.ItemType,
                ParentItemId = parent.Id,
                ItemCode = variantCode,
                ItemName = dto.VariantName.Trim(),
                Unit = string.IsNullOrWhiteSpace(dto.Unit) ? parent.Unit : dto.Unit.Trim(),
                BasePrice = parent.BasePrice,
                IsVariant = true,
                Active = true,
                CreatedAt = DateTime.UtcNow
            };

            parent.IsVariant = true;

            _context.Items.Add(variantItem);
            await _context.SaveChangesAsync();

            if (dto.PackingFactor > 0 && !string.IsNullOrWhiteSpace(dto.PackingUnit))
            {
                var packingConversion = new ItemUomConversion
                {
                    CompanyId = parent.CompanyId,
                    ItemId = variantItem.Id,
                    FromUnit = dto.PackingUnit.Trim(),
                    ToUnit = variantItem.Unit,
                    ConversionFactor = dto.PackingFactor,
                    Notes = $"معامل التعبئة القياسي للصنف: {dto.VariantName.Trim()}",
                    CreatedAt = DateTime.UtcNow
                };
                _context.ItemUomConversions.Add(packingConversion);
                await _context.SaveChangesAsync();
            }

            return true;
        }
    }
}