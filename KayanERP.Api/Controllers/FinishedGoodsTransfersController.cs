using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KayanERP.Api.Models;
using KayanERP.Shared.DTOs;
using KayanERP.Api.Services;

namespace KayanERP.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FinishedGoodsTransfersController : ControllerBase
    {
        private readonly IFinishedGoodsTransferService _service;

        public FinishedGoodsTransfersController(IFinishedGoodsTransferService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<FinishedGoodsTransferViewDto>>> GetAll()
        {
            var result = await _service.GetAllTransfersAsync();
            return Ok(result);
        }

        [HttpGet("lookups")]
        public async Task<ActionResult<TransferLookupsDto>> GetLookups()
        {
            var result = await _service.GetLookupsAsync();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTransfer([FromBody] CreateTransferRequestDto dto)
        {
            try
            {
                var result = await _service.CreateTransferAsync(dto);
                return Ok(new { success = result });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("audit-costing")]
        public async Task<IActionResult> AuditCosting([FromBody] CostingAuditDto dto)
        {
            var result = await _service.AuditCostingAsync(dto);
            return Ok(new { success = result });
        }

        [HttpPost("resolve-costing-dispute")]
        public async Task<ActionResult<ResolveCostingDisputeDto>> ResolveCostingDispute([FromBody] ResolveCostingDisputeDto dto)
        {
            var result = await _service.ResolveCostingDisputeAsync(dto);
            return Ok(result);
        }

        [HttpPost("inspect-qc")]
        public async Task<IActionResult> InspectQc([FromBody] QcInspectionDto dto)
        {
            try
            {
                var result = await _service.InspectQcAsync(dto);
                return Ok(new { success = result });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("re-submit-rework")]
        public async Task<IActionResult> ReSubmitRework([FromQuery] long transferId, [FromQuery] decimal adjustedQty, [FromQuery] int adjustedCount, [FromQuery] string notes)
        {
            var result = await _service.ReSubmitReworkAsync(transferId, adjustedQty, adjustedCount, notes);
            return Ok(new { success = result });
        }

        [HttpPost("receive-control")]
        public async Task<IActionResult> ReceiveAtControl([FromBody] ControlReceiptDto dto)
        {
            try
            {
                var result = await _service.ReceiveAtControlAsync(dto);
                return Ok(new { success = result });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("resolve-dispute")]
        public async Task<IActionResult> ResolveDispute([FromBody] ResolveDisputeDto dto)
        {
            var result = await _service.ResolveDisputeAsync(dto);
            return Ok(new { success = result });
        }
    }
}