namespace KayanERP.Api.Models;

public class UserBranch
{
    public string UserId { get; set; } = string.Empty;
    public AppUser? User { get; set; }
    public long BranchId { get; set; }
    public Branch? Branch { get; set; }
}