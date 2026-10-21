using KayanERP.Shared.DTOs;

namespace KayanERP.Api.Services;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
    Task<bool> LogoutAsync(long userId);
}