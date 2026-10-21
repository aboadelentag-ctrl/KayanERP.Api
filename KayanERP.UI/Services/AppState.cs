using System;
using System.Collections.Generic;

namespace KayanERP.UI.Services
{
    public class AppState
    {
        public event Action? OnChange;

        public bool IsLoggedIn { get; private set; }
        public long UserId { get; private set; }
        public string Username { get; private set; } = string.Empty;
        public string FullName { get; private set; } = string.Empty;
        public string Role { get; private set; } = string.Empty;
        public string EmployeeCode { get; private set; } = string.Empty;
        public string DepartmentName { get; private set; } = string.Empty;
        public long? DepartmentId { get; private set; }
        public List<string> Permissions { get; private set; } = new();

        // خاصية اسم الشركة الجديدة لدعم Multi-Tenant
        public string CompanyName { get; private set; } = string.Empty;

        public void SetUserSession(long userId, string username, string fullName, string role, string empCode, string deptName, long? departmentIdOrExtra, List<string> permissions, string companyName = "مجموعة كيان")
        {
            UserId = userId;
            Username = username;
            FullName = fullName;
            Role = role;
            EmployeeCode = empCode;
            DepartmentName = deptName;
            DepartmentId = departmentIdOrExtra;
            Permissions = permissions ?? new List<string>();
            CompanyName = string.IsNullOrEmpty(companyName) ? "مجموعة كيان" : companyName;

            IsLoggedIn = true;
            NotifyStateChanged();
        }

        public void ClearSession()
        {
            UserId = 0;
            Username = string.Empty;
            FullName = string.Empty;
            Role = string.Empty;
            EmployeeCode = string.Empty;
            DepartmentName = string.Empty;
            DepartmentId = null;
            Permissions = new List<string>();
            CompanyName = string.Empty;

            IsLoggedIn = false;
            NotifyStateChanged();
        }

        private void NotifyStateChanged() => OnChange?.Invoke();
    }
}