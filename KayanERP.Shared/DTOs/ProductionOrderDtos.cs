using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace KayanERP.Shared.DTOs
{
    public class ProductionOrderListDto
    {
        public long Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public decimal PlannedQty { get; set; }
        public decimal? ProducedQty { get; set; }
        public DateTime OrderDate { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class CreateProductionOrderDto
    {
        [Required] public long DepartmentId { get; set; }
        [Required] public long ProductItemId { get; set; }
        [Required] public decimal PlannedQty { get; set; }
        public DateTime? PlannedStartDate { get; set; }
        public string? Notes { get; set; }
    }
}