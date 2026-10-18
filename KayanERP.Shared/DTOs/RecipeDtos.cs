using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace KayanERP.Shared.DTOs
{
    public class RecipeDto
    {
        public long Id { get; set; }
        public long ProductItemId { get; set; }
        public string ProductItemName { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public List<RecipeLineDto> Lines { get; set; } = new();
    }

    public class RecipeLineDto
    {
        public long Id { get; set; }
        public long RawMaterialItemId { get; set; }
        public string RawMaterialItemName { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public string Unit { get; set; } = string.Empty;
    }

    public class SaveRecipeDto
    {
        public long Id { get; set; }
        [Required] public long ProductItemId { get; set; }
        public string? Notes { get; set; }
        [Required][MinLength(1)] public List<SaveRecipeLineDto> Lines { get; set; } = new();
    }

    public class SaveRecipeLineDto
    {
        [Required] public long RawMaterialItemId { get; set; }
        [Range(0.01, double.MaxValue)] public decimal Quantity { get; set; }
    }
}