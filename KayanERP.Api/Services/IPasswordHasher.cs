namespace KayanERP.Api.Services
{
    public interface IPasswordHasher
    {
        string Hash(string password);
        bool VerifyPassword(string password, string hashedPassword);
        bool Verify(string password, string hashedPassword);
        bool NeedsRehash(string hashedPassword);
    }
}