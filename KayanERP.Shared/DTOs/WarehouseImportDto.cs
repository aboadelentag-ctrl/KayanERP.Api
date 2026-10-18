using System;
using System.ComponentModel.DataAnnotations;

namespace KayanERP.Shared.DTOs
{
    public class WarehouseImportDto
    {
        public long? BranchId { get; set; }
        public string? BranchCodeOrName { get; set; }
        public string WarehouseCode { get; set; } = string.Empty;
        public string WarehouseName { get; set; } = string.Empty;
        public string WarehouseType { get; set; } = "خامات";
        public string? ParentWarehouseCodeOrName { get; set; }
        public string? Description { get; set; }
        public bool Active { get; set; } = true;
    }
}