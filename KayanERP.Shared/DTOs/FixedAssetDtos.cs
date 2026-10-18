using System;
using System.ComponentModel.DataAnnotations;

namespace KayanERP.Shared.DTOs
{
    public class CreateFixedAssetDto
    {
        [Required(ErrorMessage = "كود الأصل مطلوب.")]
        public string AssetCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "اسم الأصل مطلوب.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "القسم مطلوب.")]
        public string Department { get; set; } = string.Empty;

        public string? Category { get; set; }
        public string? BrandModel { get; set; }
        public string? SerialNumber { get; set; }
        public string? CustodianCode { get; set; }
        public string? CustodianName { get; set; }
        public DateTime InstallationDate { get; set; }
    }

    public class UpdateFixedAssetDto
    {
        public string? Name { get; set; }
        public string? Department { get; set; }
        public string? Category { get; set; }
        public string? BrandModel { get; set; }
        public string? SerialNumber { get; set; }
        public string? CustodianCode { get; set; }
        public string? CustodianName { get; set; }
        public string? Status { get; set; }
    }
}