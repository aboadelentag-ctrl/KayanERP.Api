using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace KayanERP.Api.Services;

public sealed class TenantContext : ITenantContext
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    // كاش داخلي عشان نتجنب قراءة الـ Claims من الـ HttpContext كل مرة
    private long? _cachedCompanyId;
    private long? _cachedBranchId;
    private long? _cachedUserId;
    private bool _isResolved;

    public TenantContext(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
    }

    public long CompanyId
    {
        get
        {
            ResolveClaims();

            if (_cachedCompanyId is null or <= 0)
            {
                throw new UnauthorizedAccessException(
                    "Company ID is missing or invalid in the authentication token.");
            }

            return _cachedCompanyId.Value;
        }
    }

    public long? BranchId
    {
        get
        {
            ResolveClaims();
            return _cachedBranchId;
        }
    }

    public long? UserId
    {
        get
        {
            ResolveClaims();
            return _cachedUserId;
        }
    }

    /// <summary>
    /// يستخرج الـ Claims مرة واحدة فقط لكل Request ويخزنها في الكاش الداخلي.
    /// </summary>
    private void ResolveClaims()
    {
        if (_isResolved) return;

        var user = _httpContextAccessor.HttpContext?.User;

        // لو مفيش مستخدم مسجل دخول، نسيب القيم null ونخلي الشركة ترمي Exception
        if (user?.Identity?.IsAuthenticated != true)
        {
            _isResolved = true;
            return;
        }

        // --- Company ID ---
        var companyClaim = user.FindFirst("company_id")?.Value;
        if (long.TryParse(companyClaim, out var companyId) && companyId > 0)
        {
            _cachedCompanyId = companyId;
        }

        // --- Branch ID (اختياري) ---
        var branchClaim = user.FindFirst("branch_id")?.Value;
        if (long.TryParse(branchClaim, out var branchId) && branchId > 0)
        {
            _cachedBranchId = branchId;
        }

        // --- User ID ---
        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                       ?? user.FindFirst("sub")?.Value;

        if (long.TryParse(userIdClaim, out var userId) && userId > 0)
        {
            _cachedUserId = userId;
        }

        _isResolved = true;
    }
}