global using KayanERP.Shared.DTOs;

using KayanERP.Api.Middleware;
using KayanERP.Api.Models;
using KayanERP.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// ==============================================================
// 1. قاعدة البيانات (PostgreSQL - Neon)
// ==============================================================
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "Connection string 'DefaultConnection' is missing. " +
        "Set it via User Secrets (Development) or Environment Variables (Production).");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "public");
    })
    .UseSnakeCaseNamingConvention();
});

// ==============================================================
// 2. الـ SaaS و Tenant Context
// ==============================================================
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ITenantContext, TenantContext>();

// ==============================================================
// 3. تسجيل خدمات النظام
// ==============================================================
builder.Services.AddScoped<ISalesService, SalesService>();
builder.Services.AddScoped<IMaterialReceiptService, MaterialReceiptService>();
builder.Services.AddScoped<IProcurementService, ProcurementService>();
builder.Services.AddScoped<IPurchaseOrderService, PurchaseOrderService>();
builder.Services.AddScoped<IPurchasingService, PurchasingService>();
builder.Services.AddScoped<IMaterialRequisitionService, MaterialRequisitionService>();
builder.Services.AddScoped<IProductionOrderService, ProductionOrderService>();
builder.Services.AddScoped<IProductionOperationsService, ProductionOperationsService>();
builder.Services.AddScoped<IStockService, StockService>();
builder.Services.AddScoped<IStockTransferService, StockTransferService>();
builder.Services.AddScoped<IRecipeService, RecipeService>();
builder.Services.AddScoped<ISupplierPriceService, SupplierPriceService>();
builder.Services.AddScoped<IVendorQcService, VendorQcService>();
builder.Services.AddScoped<IFinishedGoodsTransferService, FinishedGoodsTransferService>();
builder.Services.AddScoped<ICrateService, CrateService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// ==============================================================
// 4. الـ JWT Authentication
// ==============================================================
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException(
        "JWT Key is missing. Set 'Jwt:Key' via User Secrets or Environment Variables.");

var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "KayanERP";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "KayanERP.Clients";
var keyBytes = Encoding.UTF8.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.FromMinutes(1)
    };
});

builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();
builder.Services.AddScoped<IRefreshTokenService, RefreshTokenService>();

// ==============================================================
// 5. Controllers + Authorize افتراضي
// ==============================================================
builder.Services.AddControllers(options =>
{
    var policy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
    options.Filters.Add(new AuthorizeFilter(policy));
})
.AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// ==============================================================
// 6. Swagger + JWT Support (متوافق مع Microsoft.OpenApi الحديث)
// ==============================================================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.CustomSchemaIds(type => type.FullName?.Replace("+", ".").Replace("`", ""));

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "أدخل التوكن هنا بالشكل: Bearer {token}"
    });

    c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = new List<string>()
    });
});

// ==============================================================
// 7. CORS
// ==============================================================
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? Array.Empty<string>();

if (allowedOrigins.Length == 0)
{
    throw new InvalidOperationException(
        "No CORS origins configured. Add 'Cors:AllowedOrigins' to settings.");
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("KayanPolicy", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// ==============================================================
// 8. بناء التطبيق
// ==============================================================
var app = builder.Build();

// ==============================================================
// 9. Pipeline (الترتيب مهم جدًا!)
// ==============================================================

app.UseExceptionHandling();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("KayanPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();