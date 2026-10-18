using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace KayanERP.Shared.DTOs
{
    public class StockTransferLookupsDto
    {
        public List<WarehouseLookupDto> Warehouses { get; set; } = new();
        public List<ItemLookupDto> Items { get; set; } = new();
    }

    public class StockTransferDetailDto
    {
        public long Id { get; set; }
        public string TransferNumber { get; set; } = string.Empty;
        public DateTime TransferDate { get; set; }
        public string FromWarehouseName { get; set; } = string.Empty;
        public string ToWarehouseName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public List<StockTransferLineDetailDto> Lines { get; set; } = new();
    }

    public class StockTransferLineDetailDto
    {
        public long Id { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public decimal DispatchedQty { get; set; }
        public decimal ReceivedQty { get; set; }
        public string LineStatus { get; set; } = string.Empty;
    }

    public class AvailableStockInfoDto
    {
        public long ItemId { get; set; }
        public long WarehouseId { get; set; }
        public decimal AvailableQuantity { get; set; }
        public List<StockBatchDto> Batches { get; set; } = new();
    }

    public class StockBatchDto
    {
        public string BatchNumber { get; set; } = string.Empty;
        public DateTime? ExpiryDate { get; set; }
        public decimal Quantity { get; set; }
    }

    public class CreateStockTransferDto
    {
        [Required] public long FromWarehouseId { get; set; }
        [Required] public long ToWarehouseId { get; set; }
        public string? Notes { get; set; }
        [Required][MinLength(1)] public List<CreateStockTransferLineDto> Lines { get; set; } = new();
    }

    public class CreateStockTransferLineDto
    {
        [Required] public long ItemId { get; set; }
        [Range(0.01, double.MaxValue)] public decimal Quantity { get; set; }
        public string? BatchNumber { get; set; }
        public DateTime? ExpiryDate { get; set; }
    }

    public class ConfirmTransferLineReceiveDto
    {
        [Required] public long LineId { get; set; }
        [Required] public decimal ReceivedQty { get; set; }
        public string? Notes { get; set; }
    }

    public class ResolveTransferDisputeDto
    {
        [Required] public long LineId { get; set; }
        [Required] public decimal FinalApprovedQty { get; set; }
        public string? ResolutionNotes { get; set; }
    }
}