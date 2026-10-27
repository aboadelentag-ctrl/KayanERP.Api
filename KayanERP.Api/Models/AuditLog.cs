using System.ComponentModel.DataAnnotations.Schema;

namespace KayanERP.Api.Models;

public class AuditLog : Interfaces.ITenantEntity
{
    public long Id { get; set; }
    public long CompanyId { get; set; }
    public string TableName { get; set; } = string.Empty;
    public string PrimaryKey { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;

    [Column(TypeName = "jsonb")]
    public string? OldValues { get; set; }

    [Column(TypeName = "jsonb")]
    public string? NewValues { get; set; }

    public string UserId { get; set; } = string.Empty;
    public System.DateTime CreatedAt { get; set; } = System.DateTime.UtcNow;
}