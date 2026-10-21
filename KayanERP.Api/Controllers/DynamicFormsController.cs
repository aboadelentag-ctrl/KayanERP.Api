using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KayanERP.Api.Models;

namespace KayanERP.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DynamicFormsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DynamicFormsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DynamicForm>>> GetDynamicForms()
        {
            return await _context.DynamicForms.AsNoTracking().ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DynamicForm>> GetDynamicForm(long id)
        {
            var dynamicForm = await _context.DynamicForms.FindAsync(id);

            if (dynamicForm == null)
            {
                return NotFound();
            }

            return dynamicForm;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutDynamicForm(long id, DynamicForm dynamicForm)
        {
            if (id != dynamicForm.Id) return BadRequest(new { Message = "معرف النموذج غير متطابق." });

            if (dynamicForm.CreatedAt != default(DateTime))
            {
                dynamicForm.CreatedAt = dynamicForm.CreatedAt.HasValue ? DateTime.SpecifyKind(dynamicForm.CreatedAt.Value, DateTimeKind.Utc) : DateTime.UtcNow;
            }

            _context.Entry(dynamicForm).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DynamicFormExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpPost]
        public async Task<ActionResult<DynamicForm>> PostDynamicForm(DynamicForm dynamicForm)
        {
            dynamicForm.CreatedAt = DateTime.UtcNow;
            _context.DynamicForms.Add(dynamicForm);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetDynamicForm", new { id = dynamicForm.Id }, dynamicForm);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDynamicForm(long id)
        {
            var dynamicForm = await _context.DynamicForms.FindAsync(id);
            if (dynamicForm == null)
            {
                return NotFound();
            }

            _context.DynamicForms.Remove(dynamicForm);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool DynamicFormExists(long id)
        {
            return _context.DynamicForms.Any(e => e.Id == id);
        }
    }
}
