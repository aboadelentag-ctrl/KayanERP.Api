using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KayanERP.Shared.DTOs;
using KayanERP.Api.Models;
using KayanERP.Api.Services;

namespace KayanERP.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class JobTitlesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ITenantContext _tenantContext;

        public JobTitlesController(AppDbContext context, ITenantContext tenantContext)
        {
            _context = context;
            _tenantContext = tenantContext;
        }

        // ==============================================================
        // 1. جلب المسميات الوظيفية
        // ==============================================================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<JobTitleLookupDto>>> GetJobTitles()
        {
            var list = await _context.JobTitles
                .AsNoTracking()
                .Where(j => j.Active)
                .OrderBy(j => j.JobGrade)
                .ThenBy(j => j.TitleName)
                .Select(j => new JobTitleLookupDto
                {
                    Id = j.Id,
                    TitleName = j.TitleName,
                    HourlyRate = j.HourlyRate,
                    JobGrade = j.JobGrade.ToString(),
                    Active = j.Active
                })
                .ToListAsync();

            return Ok(list);
        }

        // ==============================================================
        // 2. إضافة مسمى وظيفي جديد
        // ==============================================================
        [HttpPost]
        public async Task<ActionResult<JobTitleLookupDto>> CreateJobTitle([FromBody] CreateJobTitleDto dto)
        {
            if (!ModelState.IsValid || string.IsNullOrWhiteSpace(dto.TitleName))
                return BadRequest(new { message = "يرجى إدخال اسم المسمى الوظيفي." });

            var trimmedName = dto.TitleName.Trim();
            var companyId = _tenantContext.CompanyId;

            var existing = await _context.JobTitles
                .FirstOrDefaultAsync(j => j.CompanyId == companyId &&
                                          j.TitleName.ToLower() == trimmedName.ToLower());

            if (existing != null)
                return Conflict(new { message = $"المسمى الوظيفي ({trimmedName}) مسجل بالفعل." });

            int parsedGrade = 1;
            if (!string.IsNullOrWhiteSpace(dto.JobGrade) && int.TryParse(dto.JobGrade, out int g) && g > 0)
            {
                parsedGrade = g;
            }

            var jobTitle = new JobTitle
            {
                CompanyId = companyId,
                TitleName = trimmedName,
                HourlyRate = dto.HourlyRate > 0 ? dto.HourlyRate : 25m,
                JobGrade = parsedGrade,
                Active = true
            };

            _context.JobTitles.Add(jobTitle);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetJobTitles), new JobTitleLookupDto
            {
                Id = jobTitle.Id,
                TitleName = jobTitle.TitleName,
                HourlyRate = jobTitle.HourlyRate,
                JobGrade = jobTitle.JobGrade.ToString(),
                Active = jobTitle.Active
            });
        }
    }
}