using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KayanERP.Shared.DTOs;
using KayanERP.Api.Services;

namespace KayanERP.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PurchaseOrdersController : ControllerBase
    {
        private readonly IPurchaseOrderService _orderService;

        public PurchaseOrdersController(IPurchaseOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpGet("lookups")]
        public async Task<ActionResult<PurchaseOrderLookupsDto>> GetLookups()
        {
            var result = await _orderService.GetLookupsAsync();
            return Ok(result);
        }

        [HttpGet]
        public async Task<ActionResult<List<PurchaseOrderDto>>> GetOrders()
        {
            var orders = await _orderService.GetAllOrdersAsync();
            return Ok(orders);
        }

        [HttpGet("{id:long}")]
        public async Task<ActionResult<PurchaseOrderDto>> GetOrder(long id)
        {
            var order = await _orderService.GetOrderByIdAsync(id);

            if (order == null)
                return NotFound(new { message = $"أمر الشراء رقم {id} غير موجود." });

            return Ok(order);
        }

        [HttpPost]
        public async Task<ActionResult<PurchaseOrderResultDto>> CreateOrder([FromBody] PurchaseOrderCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _orderService.CreateOrderAsync(dto);
            return Ok(result);
        }

        [HttpPost("approve-invoice")]
        public async Task<IActionResult> ApproveInvoice([FromBody] PoApproveDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var success = await _orderService.ApproveInvoiceAsync(dto);

            if (!success)
                return NotFound(new { message = "أمر الشراء المطلوب اعتماده غير موجود." });

            return Ok(new { success = true, message = "تم اعتماد أمر الشراء والفاتورة بنجاح!" });
        }
    }
}