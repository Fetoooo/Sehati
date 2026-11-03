using Sehati.Application.DTOs.Auth;

namespace Sehati.Application.Common.Interfaces;

public interface IAuthService
{
    Task<TokenResponseDto> RegisterAsync(RegisterDto dto, CancellationToken cancellationToken = default);
    Task<TokenResponseDto> LoginAsync(LoginDto dto, CancellationToken cancellationToken = default);
    Task<TokenResponseDto> RefreshTokenAsync(RefreshTokenDto dto, CancellationToken cancellationToken = default);
    Task LogoutAsync(int userId, CancellationToken cancellationToken = default);
    Task<UserDto> GetCurrentUserAsync(int userId, CancellationToken cancellationToken = default);
}
