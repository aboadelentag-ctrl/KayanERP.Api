using KayanERP.Api.Models;
using KayanERP.Shared.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace KayanERP.Api.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IJwtService _jwtService;
    private readonly IPasswordHasher _passwordHasher;

    public AuthService(
        AppDbContext context,
        IJwtService jwtService,
        IPasswordHasher passwordHasher)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _jwtService = jwtService ?? throw new ArgumentNullException(nameof(jwtService));
        _passwordHasher = passwordHasher ?? throw new ArgumentNullException(nameof(passwordHasher));
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Username))
            throw new ArgumentException("Username is required.");

        // 1. البحث عن المستخدم
        var user = await _context.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Username == request.Username && u.IsActive);

        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid username or password.");
        }

        // 2. التأكد من كلمة المرور
        if (!_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid username or password.");
        }

        // 3. استخراج الصلاحيات
        var permissions = new List<string>();
        if (!string.IsNullOrWhiteSpace(user.CustomPermissions))
        {
            permissions = user.CustomPermissions.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(p => p.Trim()).ToList();
        }

        // 4. توليد الـ Token
        var token = _jwtService.GenerateAccessToken(
            userId: user.Id,
            username: user.Username,
            companyId: user.CompanyId ?? 1,
            role: user.Role,
            permissions: permissions,
            branchId: null
        );

        var minutes = 60;

        // 5. الرد
        return new AuthResponseDto
        {
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(minutes),
            Username = user.Username,
            CompanyId = user.CompanyId ?? 1,
            Role = user.Role
        };
    }

    public async Task<bool> LogoutAsync(long userId)
    {
        return await Task.FromResult(true);
    }
}