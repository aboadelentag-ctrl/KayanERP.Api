using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace KayanERP.Api.Services
{
    public interface IJwtService
    {
        string GenerateAccessToken(
            long userId,
            string username,
            long companyId,
            string role,
            IEnumerable<string> permissions,
            long? branchId = null);
    }

    public sealed class JwtService : IJwtService
    {
        private readonly IConfiguration _config;

        public JwtService(IConfiguration config)
        {
            _config = config;
        }

        public string GenerateAccessToken(
            long userId,
            string username,
            long companyId,
            string role,
            IEnumerable<string> permissions,
            long? branchId = null)
        {
            var key = _config["Jwt:Key"]
                ?? throw new InvalidOperationException("JWT Key is missing from configuration.");

            var issuer = _config["Jwt:Issuer"] ?? "KayanERP";
            var audience = _config["Jwt:Audience"] ?? "KayanERP.Clients";
            var minutes = int.TryParse(_config["Jwt:AccessTokenMinutes"], out var m) ? m : 60;

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, userId.ToString()),
                new(JwtRegisteredClaimNames.UniqueName, username),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new(JwtRegisteredClaimNames.Iat,
                    DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(),
                    ClaimTypes.Integer64),
                new("company_id", companyId.ToString()),
                new("role", role)
            };

            if (branchId.HasValue && branchId.Value > 0)
            {
                claims.Add(new Claim("branch_id", branchId.Value.ToString()));
            }

            foreach (var permission in permissions)
            {
                if (!string.IsNullOrWhiteSpace(permission))
                {
                    claims.Add(new Claim("permission", permission));
                }
            }

            var keyBytes = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(keyBytes, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: DateTime.UtcNow.AddMinutes(minutes),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}