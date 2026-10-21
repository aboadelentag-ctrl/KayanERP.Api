using System;
using System.Collections.Generic;

namespace KayanERP.Api
{
    public static class CommonExtensions
    {
        public static bool TryGet<TKey, TValue>(this IDictionary<TKey, TValue> dict, TKey key, out TValue? value) where TKey : notnull
        {
            return dict.TryGetValue(key, out value);
        }

        public static TValue? TryGet<TKey, TValue>(this IDictionary<TKey, TValue> dict, TKey key) where TKey : notnull
        {
            return dict.TryGetValue(key, out var val) ? val : default;
        }

        public static DateOnly ToDateOnly(this DateTime dt) => DateOnly.FromDateTime(dt);
        public static DateTime ToDateTime(this DateOnly d) => d.ToDateTime(TimeOnly.MinValue);
    }
}

namespace KayanERP.Api.Services
{
    public class BCryptPasswordHasher : IPasswordHasher
    {
        public string Hash(string password) => password;
        public string HashPassword(string password) => password;
        public bool Verify(string password, string hash) => password == hash;
        public bool VerifyPassword(string password, string hash) => password == hash;
        public bool NeedsRehash(string hash) => false;
    }
}

namespace System.Security.Claims
{
    public static class ClaimTypeExtensions
    {
        public const string Integer64 = "http://schemas.microsoft.com/ws/2008/06/identity/claims/integer64";
    }
}

namespace System
{
    public static class DateTimeCompatExtensions
    {
        public static DateTime Max(DateTime a, DateTime b) => a > b ? a : b;
        public static TimeOnly Min(TimeOnly a, TimeOnly b) => a < b ? a : b;
    }
}