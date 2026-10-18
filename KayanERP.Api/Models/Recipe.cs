using System;
using System.Collections.Generic;

namespace KayanERP.UI.Models
{
    public class RecipeModel
    {
        public long Id { get; set; }
        public string RecipeName { get; set; } = string.Empty;
        public long ProductItemId { get; set; }
        public string ProductItemName { get; set; } = string.Empty;
        public decimal BatchQuantity { get; set; }
        public bool Active { get; set; }
        public List<RecipeLineModel> RecipeLines { get; set; } = new();
    }

    public class RecipeLineModel
    {
        public long Id { get; set; }
        public long ComponentItemId { get; set; }
        public string ComponentItemName { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal WastePercentage { get; set; }
    }
}