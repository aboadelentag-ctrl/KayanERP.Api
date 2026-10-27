using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace KayanERP.Api.Migrations
{
    /// <inheritdoc />
    public partial class Baseline : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "kayan");

            migrationBuilder.EnsureSchema(
                name: "erp");

            migrationBuilder.CreateSequence(
                name: "production_order_number_seq",
                schema: "kayan");

            migrationBuilder.CreateTable(
                name: "circulating_containers",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    container_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    specification = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    total_factory_quantity = table.Column<int>(type: "integer", nullable: false),
                    in_production_floor_quantity = table.Column<int>(type: "integer", nullable: false),
                    in_packaging_warehouse_quantity = table.Column<int>(type: "integer", nullable: false),
                    with_drivers_and_branches_quantity = table.Column<int>(type: "integer", nullable: false),
                    disputed_quantity = table.Column<int>(type: "integer", nullable: false),
                    damaged_quantity = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("circulating_containers_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "companies",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    company_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    company_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    tenant_code = table.Column<string>(type: "text", nullable: true),
                    tenant_key = table.Column<string>(type: "text", nullable: true),
                    phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    address = table.Column<string>(type: "text", nullable: true),
                    active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("companies_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "crate_movements",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    movement_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    movement_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    container_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    dispatched_quantity = table.Column<int>(type: "integer", nullable: false),
                    source_location = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    dispatched_by_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    dispatched_by_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    destination_location = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    received_quantity = table.Column<int>(type: "integer", nullable: true),
                    shortage_quantity = table.Column<int>(type: "integer", nullable: false),
                    damaged_count = table.Column<int>(type: "integer", nullable: false),
                    received_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    received_by_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    received_by_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    receive_notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    arbitration_decision = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    arbitration_text = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    arbitrated_by_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    arbitrated_by_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    financial_penalty = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("crate_movements_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "crates",
                schema: "erp",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    crate_name = table.Column<string>(type: "text", nullable: false),
                    total_factory_balance = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_crates", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "dynamic_forms",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    form_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    form_code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    fields_schema = table.Column<string>(type: "text", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: true, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("dynamic_forms_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "emergency_tasks",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    task_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    title = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    sender_department = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    sender_employee_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    sender_employee_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    target_department = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    target_employee_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    assigned_technician_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    assigned_technician_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    assignment_notes = table.Column<string>(type: "text", nullable: true),
                    priority = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "NORMAL"),
                    media_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "TEXT"),
                    media_url = table.Column<string>(type: "text", nullable: true),
                    media_file_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    target_resolution_minutes = table.Column<int>(type: "integer", nullable: false, defaultValue: 30),
                    responded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "PENDING"),
                    closure_notes = table.Column<string>(type: "text", nullable: true),
                    closure_proof_media_url = table.Column<string>(type: "text", nullable: true),
                    closed_by = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    closed_by_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    asset_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    cost_impact = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    spare_parts_used = table.Column<string>(type: "text", nullable: true),
                    root_cause = table.Column<string>(type: "text", nullable: true),
                    downtime_minutes = table.Column<int>(type: "integer", nullable: false, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("emergency_tasks_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "fixed_assets",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    asset_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    department = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    brand_model = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    serial_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    custodian_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    custodian_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    installation_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    active_sos_task_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("fixed_assets_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "purchase_invoices",
                schema: "erp",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    invoice_number = table.Column<string>(type: "text", nullable: false),
                    invoice_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    supplier_id = table.Column<long>(type: "bigint", nullable: false),
                    total_amount = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_purchase_invoices", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "roles",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    role_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    role_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    permissions = table.Column<string>(type: "text", nullable: false),
                    company_id = table.Column<int>(type: "integer", nullable: true),
                    active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("roles_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "branches",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    branch_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    branch_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    address = table.Column<string>(type: "text", nullable: true),
                    phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("branches_pkey", x => x.id);
                    table.ForeignKey(
                        name: "branches_company_id_fkey",
                        column: x => x.company_id,
                        principalSchema: "kayan",
                        principalTable: "companies",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "crate_clients",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    crate_balance = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("crate_clients_pkey", x => x.id);
                    table.ForeignKey(
                        name: "crate_clients_company_id_fkey",
                        column: x => x.company_id,
                        principalSchema: "kayan",
                        principalTable: "companies",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "customers",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    customer_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    customer_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    customer_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValueSql: "'RETAIL'"),
                    phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    address = table.Column<string>(type: "text", nullable: true),
                    tax_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    payment_terms = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    credit_limit = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("customers_pkey", x => x.id);
                    table.ForeignKey(
                        name: "customers_company_id_fkey",
                        column: x => x.company_id,
                        principalSchema: "kayan",
                        principalTable: "companies",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "departments",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    parent_department_id = table.Column<long>(type: "bigint", nullable: true),
                    department_name = table.Column<string>(type: "text", nullable: false),
                    department_code = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("departments_pkey", x => x.id);
                    table.ForeignKey(
                        name: "departments_company_id_fkey",
                        column: x => x.company_id,
                        principalSchema: "kayan",
                        principalTable: "companies",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "departments_parent_id_fkey",
                        column: x => x.parent_department_id,
                        principalSchema: "kayan",
                        principalTable: "departments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "item_categories",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    category_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    category_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    item_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("item_categories_pkey", x => x.id);
                    table.ForeignKey(
                        name: "item_categories_company_id_fkey",
                        column: x => x.company_id,
                        principalSchema: "kayan",
                        principalTable: "companies",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "job_titles",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    title_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    job_grade = table.Column<int>(type: "integer", nullable: false),
                    hourly_rate = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    active = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("job_titles_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_job_titles_companies_company_id",
                        column: x => x.company_id,
                        principalSchema: "kayan",
                        principalTable: "companies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "role",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    role_name = table.Column<string>(type: "text", nullable: false),
                    role_code = table.Column<string>(type: "text", nullable: false),
                    active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_role", x => x.id);
                    table.ForeignKey(
                        name: "fk_role_companies_company_id",
                        column: x => x.company_id,
                        principalSchema: "kayan",
                        principalTable: "companies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "suppliers",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    supplier_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    supplier_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    address = table.Column<string>(type: "text", nullable: true),
                    tax_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    payment_terms = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    credit_limit = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    is_approved = table.Column<bool>(type: "boolean", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("suppliers_pkey", x => x.id);
                    table.ForeignKey(
                        name: "suppliers_company_id_fkey",
                        column: x => x.company_id,
                        principalSchema: "kayan",
                        principalTable: "companies",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "units",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    unit_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    unit_code = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("units_pkey", x => x.id);
                    table.ForeignKey(
                        name: "units_company_fk",
                        column: x => x.company_id,
                        principalSchema: "kayan",
                        principalTable: "companies",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "crate_transactions",
                schema: "erp",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    crate_id = table.Column<long>(type: "bigint", nullable: false),
                    transaction_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    transaction_type = table.Column<string>(type: "text", nullable: false),
                    party_type = table.Column<string>(type: "text", nullable: false),
                    party_id = table.Column<long>(type: "bigint", nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_crate_transactions", x => x.id);
                    table.ForeignKey(
                        name: "fk_crate_transactions_crates_crate_id",
                        column: x => x.crate_id,
                        principalSchema: "erp",
                        principalTable: "crates",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "form_submissions",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    form_id = table.Column<long>(type: "bigint", nullable: false),
                    user_id = table.Column<long>(type: "bigint", nullable: true),
                    submission_data = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true, defaultValueSql: "'Submitted'"),
                    submitted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("form_submissions_pkey", x => x.id);
                    table.ForeignKey(
                        name: "form_submissions_form_id_fkey",
                        column: x => x.form_id,
                        principalSchema: "kayan",
                        principalTable: "dynamic_forms",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "asset_history_logs",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    fixed_asset_id = table.Column<long>(type: "bigint", nullable: false),
                    date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    event_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    performed_by_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    performed_by_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    cost_impact = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("asset_history_logs_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_asset_history_logs_fixed_assets_fixed_asset_id",
                        column: x => x.fixed_asset_id,
                        principalSchema: "kayan",
                        principalTable: "fixed_assets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "purchase_invoice_lines",
                schema: "erp",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    purchase_invoice_id = table.Column<long>(type: "bigint", nullable: false),
                    item_id = table.Column<long>(type: "bigint", nullable: false),
                    quantity = table.Column<decimal>(type: "numeric", nullable: false),
                    unit_price = table.Column<decimal>(type: "numeric", nullable: false),
                    line_total = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_purchase_invoice_lines", x => x.id);
                    table.ForeignKey(
                        name: "fk_purchase_invoice_lines_purchase_invoices_purchase_invoice_id",
                        column: x => x.purchase_invoice_id,
                        principalSchema: "erp",
                        principalTable: "purchase_invoices",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "warehouses",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    branch_id = table.Column<long>(type: "bigint", nullable: true),
                    warehouse_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    warehouse_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    warehouse_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    parent_warehouse_id = table.Column<long>(type: "bigint", nullable: true),
                    active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("warehouses_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_warehouses_companies_company_id",
                        column: x => x.company_id,
                        principalSchema: "kayan",
                        principalTable: "companies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "warehouses_branch_id_fkey",
                        column: x => x.branch_id,
                        principalSchema: "kayan",
                        principalTable: "branches",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "warehouses_parent_warehouse_id_fkey",
                        column: x => x.parent_warehouse_id,
                        principalSchema: "kayan",
                        principalTable: "warehouses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "crate_client_transactions",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    crate_client_id = table.Column<long>(type: "bigint", nullable: false),
                    transaction_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    transaction_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("crate_client_transactions_pkey", x => x.id);
                    table.ForeignKey(
                        name: "crate_client_transactions_company_id_fkey",
                        column: x => x.company_id,
                        principalSchema: "kayan",
                        principalTable: "companies",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "crate_client_transactions_crate_client_id_fkey",
                        column: x => x.crate_client_id,
                        principalSchema: "kayan",
                        principalTable: "crate_clients",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "sales_invoices",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    branch_id = table.Column<long>(type: "bigint", nullable: true),
                    invoice_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    invoice_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    customer_id = table.Column<long>(type: "bigint", nullable: false),
                    total_amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("sales_invoices_pkey", x => x.id);
                    table.ForeignKey(
                        name: "sales_invoices_branch_id_fkey",
                        column: x => x.branch_id,
                        principalSchema: "kayan",
                        principalTable: "branches",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "sales_invoices_customer_id_fkey",
                        column: x => x.customer_id,
                        principalSchema: "kayan",
                        principalTable: "customers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "maintenance_assets",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    department_id = table.Column<long>(type: "bigint", nullable: true),
                    asset_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    asset_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    asset_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    location = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("maintenance_assets_pkey", x => x.id);
                    table.ForeignKey(
                        name: "maintenance_assets_company_fk",
                        column: x => x.company_id,
                        principalSchema: "kayan",
                        principalTable: "companies",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "maintenance_assets_department_fk",
                        column: x => x.department_id,
                        principalSchema: "kayan",
                        principalTable: "departments",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "items",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    item_code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    item_name = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    item_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    category_id = table.Column<long>(type: "bigint", nullable: false),
                    department_id = table.Column<long>(type: "bigint", nullable: true),
                    unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    parent_item_id = table.Column<long>(type: "bigint", nullable: true),
                    has_expiry_date = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    shelf_life_days = table.Column<int>(type: "integer", nullable: true),
                    reorder_level = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    safety_stock = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    max_stock = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    department_name = table.Column<string>(type: "text", nullable: true),
                    base_price = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    barcode = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    is_variant = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    is_merged = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    is_container = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    multi_uom = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    hide_detail_print = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("items_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_items_companies_company_id",
                        column: x => x.company_id,
                        principalSchema: "kayan",
                        principalTable: "companies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "items_category_id_fkey",
                        column: x => x.category_id,
                        principalSchema: "kayan",
                        principalTable: "item_categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "items_department_id_fkey",
                        column: x => x.department_id,
                        principalSchema: "kayan",
                        principalTable: "departments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "items_parent_item_id_fkey",
                        column: x => x.parent_item_id,
                        principalSchema: "kayan",
                        principalTable: "items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "employees",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    branch_id = table.Column<long>(type: "bigint", nullable: true),
                    department_id = table.Column<long>(type: "bigint", nullable: true),
                    job_title_id = table.Column<long>(type: "bigint", nullable: true),
                    manager_id = table.Column<long>(type: "bigint", nullable: true),
                    employee_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    employee_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("employees_pkey", x => x.id);
                    table.ForeignKey(
                        name: "employees_department_id_fkey",
                        column: x => x.department_id,
                        principalSchema: "kayan",
                        principalTable: "departments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "employees_manager_id_fkey",
                        column: x => x.manager_id,
                        principalSchema: "kayan",
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_employees_branches_branch_id",
                        column: x => x.branch_id,
                        principalSchema: "kayan",
                        principalTable: "branches",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_employees_companies_company_id",
                        column: x => x.company_id,
                        principalSchema: "kayan",
                        principalTable: "companies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_employees_job_titles_job_title_id",
                        column: x => x.job_title_id,
                        principalSchema: "kayan",
                        principalTable: "job_titles",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "users",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: true),
                    role_id = table.Column<long>(type: "bigint", nullable: true),
                    employee_id = table.Column<long>(type: "bigint", nullable: true),
                    employee_code = table.Column<string>(type: "text", nullable: true),
                    username = table.Column<string>(type: "text", nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: false),
                    role = table.Column<string>(type: "text", nullable: false),
                    full_name = table.Column<string>(type: "text", nullable: true),
                    department_id = table.Column<long>(type: "bigint", nullable: true),
                    department_name = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    custom_permissions = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_users", x => x.id);
                    table.ForeignKey(
                        name: "fk_users_companies_company_id",
                        column: x => x.company_id,
                        principalSchema: "kayan",
                        principalTable: "companies",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_users_role_role_id",
                        column: x => x.role_id,
                        principalSchema: "kayan",
                        principalTable: "role",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "unit_conversions",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    from_unit_id = table.Column<long>(type: "bigint", nullable: false),
                    to_unit_id = table.Column<long>(type: "bigint", nullable: false),
                    conversion_factor = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("unit_conversions_pkey", x => x.id);
                    table.ForeignKey(
                        name: "unit_conversions_company_fk",
                        column: x => x.company_id,
                        principalSchema: "kayan",
                        principalTable: "companies",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "unit_conversions_from_unit_fk",
                        column: x => x.from_unit_id,
                        principalSchema: "kayan",
                        principalTable: "units",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "unit_conversions_to_unit_fk",
                        column: x => x.to_unit_id,
                        principalSchema: "kayan",
                        principalTable: "units",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "material_requisitions",
                schema: "erp",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    requisition_number = table.Column<string>(type: "text", nullable: false),
                    department_id = table.Column<long>(type: "bigint", nullable: false),
                    from_warehouse_id = table.Column<long>(type: "bigint", nullable: false),
                    to_warehouse_id = table.Column<long>(type: "bigint", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    requested_by = table.Column<string>(type: "text", nullable: true),
                    dispatched_by = table.Column<string>(type: "text", nullable: true),
                    received_by = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    dispatched_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_material_requisitions", x => x.id);
                    table.ForeignKey(
                        name: "fk_material_requisitions_departments_department_id",
                        column: x => x.department_id,
                        principalSchema: "kayan",
                        principalTable: "departments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_material_requisitions_warehouses_from_warehouse_id",
                        column: x => x.from_warehouse_id,
                        principalSchema: "kayan",
                        principalTable: "warehouses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_material_requisitions_warehouses_to_warehouse_id",
                        column: x => x.to_warehouse_id,
                        principalSchema: "kayan",
                        principalTable: "warehouses",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "sales_orders",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    branch_id = table.Column<long>(type: "bigint", nullable: true),
                    customer_id = table.Column<long>(type: "bigint", nullable: true),
                    warehouse_id = table.Column<long>(type: "bigint", nullable: false),
                    order_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    order_date = table.Column<DateOnly>(type: "date", nullable: false, defaultValueSql: "CURRENT_DATE"),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValueSql: "'DRAFT'"),
                    subtotal = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    discount_amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    tax_amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    total_amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("sales_orders_pkey", x => x.id);
                    table.ForeignKey(
                        name: "sales_orders_branch_fk",
                        column: x => x.branch_id,
                        principalSchema: "kayan",
                        principalTable: "branches",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "sales_orders_company_fk",
                        column: x => x.company_id,
                        principalSchema: "kayan",
                        principalTable: "companies",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "sales_orders_customer_fk",
                        column: x => x.customer_id,
                        principalSchema: "kayan",
                        principalTable: "customers",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "sales_orders_warehouse_fk",
                        column: x => x.warehouse_id,
                        principalSchema: "kayan",
                        principalTable: "warehouses",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "stock_transfers",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: true),
                    transfer_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    transfer_date = table.Column<DateOnly>(type: "date", nullable: true, defaultValueSql: "CURRENT_DATE"),
                    from_warehouse_id = table.Column<long>(type: "bigint", nullable: false),
                    to_warehouse_id = table.Column<long>(type: "bigint", nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValueSql: "'IN_TRANSIT'"),
                    driver_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    vehicle_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    received_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true, defaultValueSql: "CURRENT_TIMESTAMP"),
                    dispatched_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("stock_transfers_pkey", x => x.id);
                    table.ForeignKey(
                        name: "stock_transfers_company_fk",
                        column: x => x.company_id,
                        principalSchema: "kayan",
                        principalTable: "companies",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "stock_transfers_from_warehouse_fk",
                        column: x => x.from_warehouse_id,
                        principalSchema: "kayan",
                        principalTable: "warehouses",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "stock_transfers_to_warehouse_fk",
                        column: x => x.to_warehouse_id,
                        principalSchema: "kayan",
                        principalTable: "warehouses",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "maintenance_orders",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    asset_id = table.Column<long>(type: "bigint", nullable: false),
                    order_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    maintenance_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValueSql: "'CORRECTIVE'"),
                    priority = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValueSql: "'NORMAL'"),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValueSql: "'OPEN'"),
                    scheduled_date = table.Column<DateOnly>(type: "date", nullable: true),
                    completed_date = table.Column<DateOnly>(type: "date", nullable: true),
                    description = table.Column<string>(type: "text", nullable: false),
                    technician = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    cost = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("maintenance_orders_pkey", x => x.id);
                    table.ForeignKey(
                        name: "maintenance_orders_asset_fk",
                        column: x => x.asset_id,
                        principalSchema: "kayan",
                        principalTable: "maintenance_assets",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "maintenance_orders_company_fk",
                        column: x => x.company_id,
                        principalSchema: "kayan",
                        principalTable: "companies",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "asset_balances",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    item_id = table.Column<long>(type: "bigint", nullable: false),
                    party_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    party_id = table.Column<long>(type: "bigint", nullable: false),
                    quantity = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    last_updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("asset_balances_pkey", x => x.id);
                    table.ForeignKey(
                        name: "asset_balances_company_fk",
                        column: x => x.company_id,
                        principalSchema: "kayan",
                        principalTable: "companies",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "asset_balances_item_fk",
                        column: x => x.item_id,
                        principalSchema: "kayan",
                        principalTable: "items",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "asset_movements",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    movement_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_DATE"),
                    item_id = table.Column<long>(type: "bigint", nullable: false),
                    from_party_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    from_party_id = table.Column<long>(type: "bigint", nullable: false),
                    to_party_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    to_party_id = table.Column<long>(type: "bigint", nullable: false),
                    quantity = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    movement_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("asset_movements_pkey", x => x.id);
                    table.ForeignKey(
                        name: "asset_movements_company_fk",
                        column: x => x.company_id,
                        principalSchema: "kayan",
                        principalTable: "companies",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "asset_movements_item_fk",
                        column: x => x.item_id,
                        principalSchema: "kayan",
                        principalTable: "items",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "branch_transfers",
                schema: "erp",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    transfer_number = table.Column<string>(type: "text", nullable: false),
                    transfer_date = table.Column<DateOnly>(type: "date", nullable: false),
                    source_warehouse_id = table.Column<long>(type: "bigint", nullable: false),
                    destination_warehouse_id = table.Column<long>(type: "bigint", nullable: false),
                    destination_branch_id = table.Column<long>(type: "bigint", nullable: false),
                    item_id = table.Column<long>(type: "bigint", nullable: false),
                    batch_number = table.Column<string>(type: "text", nullable: true),
                    dispatched_qty = table.Column<decimal>(type: "numeric", nullable: false),
                    container_type = table.Column<string>(type: "text", nullable: true),
                    inner_count = table.Column<int>(type: "integer", nullable: false),
                    crate_count = table.Column<int>(type: "integer", nullable: false),
                    dispatched_count = table.Column<int>(type: "integer", nullable: false),
                    driver_name = table.Column<string>(type: "text", nullable: true),
                    vehicle_number = table.Column<string>(type: "text", nullable: true),
                    dispatcher_name = table.Column<string>(type: "text", nullable: true),
                    received_qty = table.Column<decimal>(type: "numeric", nullable: true),
                    received_count = table.Column<int>(type: "integer", nullable: true),
                    received_inner_count = table.Column<int>(type: "integer", nullable: true),
                    received_crate_count = table.Column<int>(type: "integer", nullable: true),
                    receiver_name = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    dispute_reason = table.Column<string>(type: "text", nullable: true),
                    dispute_charge_to = table.Column<string>(type: "text", nullable: true),
                    dispute_notes = table.Column<string>(type: "text", nullable: true),
                    resolved_by = table.Column<string>(type: "text", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_branch_transfers", x => x.id);
                    table.ForeignKey(
                        name: "fk_branch_transfers_branches_destination_branch_id",
                        column: x => x.destination_branch_id,
                        principalSchema: "kayan",
                        principalTable: "branches",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_branch_transfers_companies_company_id",
                        column: x => x.company_id,
                        principalSchema: "kayan",
                        principalTable: "companies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_branch_transfers_items_item_id",
                        column: x => x.item_id,
                        principalSchema: "kayan",
                        principalTable: "items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_branch_transfers_warehouses_destination_warehouse_id",
                        column: x => x.destination_warehouse_id,
                        principalSchema: "kayan",
                        principalTable: "warehouses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_branch_transfers_warehouses_source_warehouse_id",
                        column: x => x.source_warehouse_id,
                        principalSchema: "kayan",
                        principalTable: "warehouses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "finished_goods_transfers",
                schema: "erp",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    transfer_number = table.Column<string>(type: "text", nullable: false),
                    transfer_date = table.Column<DateOnly>(type: "date", nullable: false),
                    production_order_id = table.Column<long>(type: "bigint", nullable: true),
                    source_warehouse_id = table.Column<long>(type: "bigint", nullable: false),
                    destination_warehouse_id = table.Column<long>(type: "bigint", nullable: false),
                    item_id = table.Column<long>(type: "bigint", nullable: false),
                    batch_number = table.Column<string>(type: "text", nullable: false),
                    expiry_date = table.Column<DateOnly>(type: "date", nullable: true),
                    prod_dispatched_qty = table.Column<decimal>(type: "numeric", nullable: false),
                    prod_dispatched_count = table.Column<int>(type: "integer", nullable: false),
                    prod_notes = table.Column<string>(type: "text", nullable: true),
                    prod_submitted_by = table.Column<string>(type: "text", nullable: true),
                    costing_actual_qty = table.Column<decimal>(type: "numeric", nullable: true),
                    costing_actual_count = table.Column<int>(type: "integer", nullable: true),
                    costing_weight_diff = table.Column<decimal>(type: "numeric", nullable: false),
                    costing_count_diff = table.Column<int>(type: "integer", nullable: false),
                    costing_discrepancy_flag = table.Column<bool>(type: "boolean", nullable: false),
                    costing_auditor = table.Column<string>(type: "text", nullable: true),
                    costing_audited_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    costing_notes = table.Column<string>(type: "text", nullable: true),
                    costing_dispute_status = table.Column<string>(type: "text", nullable: false),
                    costing_dispute_reason = table.Column<string>(type: "text", nullable: true),
                    costing_dispute_notes = table.Column<string>(type: "text", nullable: true),
                    costing_dispute_resolved_by = table.Column<string>(type: "text", nullable: true),
                    costing_dispute_resolved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    costing_dispute_charge_to = table.Column<string>(type: "text", nullable: true),
                    qc_approved_qty = table.Column<decimal>(type: "numeric", nullable: false),
                    qc_sample_qty = table.Column<decimal>(type: "numeric", nullable: false),
                    qc_rework_qty = table.Column<decimal>(type: "numeric", nullable: false),
                    qc_scrap_qty = table.Column<decimal>(type: "numeric", nullable: false),
                    qc_inspector = table.Column<string>(type: "text", nullable: true),
                    qc_inspected_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    qc_notes = table.Column<string>(type: "text", nullable: true),
                    received_actual_qty = table.Column<decimal>(type: "numeric", nullable: true),
                    received_actual_count = table.Column<int>(type: "integer", nullable: true),
                    control_receiver_name = table.Column<string>(type: "text", nullable: true),
                    control_received_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    control_notes = table.Column<string>(type: "text", nullable: true),
                    has_dispute = table.Column<bool>(type: "boolean", nullable: false),
                    dispute_reason = table.Column<string>(type: "text", nullable: true),
                    dispute_status = table.Column<string>(type: "text", nullable: false),
                    dispute_opened_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    dispute_resolved_by = table.Column<string>(type: "text", nullable: true),
                    dispute_resolution_notes = table.Column<string>(type: "text", nullable: true),
                    dispute_resolved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    control_dispute_charge_to = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_finished_goods_transfers", x => x.id);
                    table.ForeignKey(
                        name: "fk_finished_goods_transfers_items_item_id",
                        column: x => x.item_id,
                        principalSchema: "kayan",
                        principalTable: "items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_finished_goods_transfers_warehouses_destination_warehouse_id",
                        column: x => x.destination_warehouse_id,
                        principalSchema: "kayan",
                        principalTable: "warehouses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_finished_goods_transfers_warehouses_source_warehouse_id",
                        column: x => x.source_warehouse_id,
                        principalSchema: "kayan",
                        principalTable: "warehouses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "item_uom_conversions",
                schema: "erp",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    item_id = table.Column<long>(type: "bigint", nullable: true),
                    from_unit = table.Column<string>(type: "text", nullable: false),
                    to_unit = table.Column<string>(type: "text", nullable: false),
                    conversion_factor = table.Column<decimal>(type: "numeric", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_item_uom_conversions", x => x.id);
                    table.ForeignKey(
                        name: "fk_item_uom_conversions_items_item_id",
                        column: x => x.item_id,
                        principalSchema: "kayan",
                        principalTable: "items",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "recipes",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    product_item_id = table.Column<long>(type: "bigint", nullable: false),
                    recipe_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    recipe_name = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    batch_quantity = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    batch_unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    yield_quantity = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    yield_unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    pieces_per_batch = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: true),
                    waste_percentage = table.Column<decimal>(type: "numeric(8,3)", precision: 8, scale: 3, nullable: false),
                    preparation_time_minutes = table.Column<int>(type: "integer", nullable: true),
                    active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    effective_from = table.Column<DateOnly>(type: "date", nullable: false, defaultValueSql: "CURRENT_DATE"),
                    effective_to = table.Column<DateOnly>(type: "date", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("recipes_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_recipes_items_product_item_id",
                        column: x => x.product_item_id,
                        principalSchema: "kayan",
                        principalTable: "items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "recipes_company_id_fkey",
                        column: x => x.company_id,
                        principalSchema: "kayan",
                        principalTable: "companies",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "sales_invoice_lines",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    invoice_id = table.Column<long>(type: "bigint", nullable: false),
                    item_id = table.Column<long>(type: "bigint", nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    unit_price = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    line_total = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("sales_invoice_lines_pkey", x => x.id);
                    table.ForeignKey(
                        name: "sales_invoice_lines_invoice_id_fkey",
                        column: x => x.invoice_id,
                        principalSchema: "kayan",
                        principalTable: "sales_invoices",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "sales_invoice_lines_item_id_fkey",
                        column: x => x.item_id,
                        principalSchema: "kayan",
                        principalTable: "items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "stock_balances",
                schema: "erp",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    warehouse_id = table.Column<long>(type: "bigint", nullable: false),
                    item_id = table.Column<long>(type: "bigint", nullable: false),
                    quantity = table.Column<decimal>(type: "numeric", nullable: false),
                    reserved_quantity = table.Column<decimal>(type: "numeric", nullable: false),
                    available_quantity = table.Column<decimal>(type: "numeric", nullable: true),
                    last_updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_stock_balances", x => x.id);
                    table.ForeignKey(
                        name: "fk_stock_balances_companies_company_id",
                        column: x => x.company_id,
                        principalSchema: "kayan",
                        principalTable: "companies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_stock_balances_items_item_id",
                        column: x => x.item_id,
                        principalSchema: "kayan",
                        principalTable: "items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_stock_balances_warehouses_warehouse_id",
                        column: x => x.warehouse_id,
                        principalSchema: "kayan",
                        principalTable: "warehouses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "supplier_item_prices",
                schema: "erp",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    supplier_id = table.Column<long>(type: "bigint", nullable: false),
                    item_id = table.Column<long>(type: "bigint", nullable: false),
                    price = table.Column<decimal>(type: "numeric", nullable: false),
                    currency = table.Column<string>(type: "text", nullable: false),
                    lead_time_days = table.Column<int>(type: "integer", nullable: false),
                    effective_date = table.Column<DateOnly>(type: "date", nullable: false),
                    is_preferred = table.Column<bool>(type: "boolean", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_supplier_item_prices", x => x.id);
                    table.ForeignKey(
                        name: "fk_supplier_item_prices_items_item_id",
                        column: x => x.item_id,
                        principalSchema: "kayan",
                        principalTable: "items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_supplier_item_prices_suppliers_supplier_id",
                        column: x => x.supplier_id,
                        principalSchema: "kayan",
                        principalTable: "suppliers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "purchase_orders",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    supplier_id = table.Column<long>(type: "bigint", nullable: false),
                    warehouse_id = table.Column<long>(type: "bigint", nullable: false),
                    order_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    order_date = table.Column<DateOnly>(type: "date", nullable: false, defaultValueSql: "CURRENT_DATE"),
                    expected_date = table.Column<DateOnly>(type: "date", nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValueSql: "'DRAFT'"),
                    subtotal = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    discount_amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    tax_amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    total_amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<long>(type: "bigint", nullable: true),
                    created_by_navigation_id = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("purchase_orders_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_purchase_orders_users_created_by_navigation_id",
                        column: x => x.created_by_navigation_id,
                        principalSchema: "kayan",
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "purchase_orders_company_id_fkey",
                        column: x => x.company_id,
                        principalSchema: "kayan",
                        principalTable: "companies",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "purchase_orders_supplier_id_fkey",
                        column: x => x.supplier_id,
                        principalSchema: "kayan",
                        principalTable: "suppliers",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "purchase_orders_warehouse_id_fkey",
                        column: x => x.warehouse_id,
                        principalSchema: "kayan",
                        principalTable: "warehouses",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "refresh_tokens",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    token = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    revoked_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    replaced_by_token = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    revoked_reason = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    created_by_ip = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("refresh_tokens_pkey", x => x.id);
                    table.ForeignKey(
                        name: "refresh_tokens_user_id_fkey",
                        column: x => x.user_id,
                        principalSchema: "kayan",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "stock_movements",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    warehouse_id = table.Column<long>(type: "bigint", nullable: false),
                    item_id = table.Column<long>(type: "bigint", nullable: false),
                    movement_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    quantity = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    unit_cost = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    reference_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    reference_id = table.Column<long>(type: "bigint", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    movement_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("stock_movements_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_stock_movements_users_created_by",
                        column: x => x.created_by,
                        principalSchema: "kayan",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "stock_movements_company_id_fkey",
                        column: x => x.company_id,
                        principalSchema: "kayan",
                        principalTable: "companies",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "stock_movements_item_id_fkey",
                        column: x => x.item_id,
                        principalSchema: "kayan",
                        principalTable: "items",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "stock_movements_warehouse_id_fkey",
                        column: x => x.warehouse_id,
                        principalSchema: "kayan",
                        principalTable: "warehouses",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "user_branches",
                schema: "kayan",
                columns: table => new
                {
                    user_id = table.Column<string>(type: "text", nullable: false),
                    branch_id = table.Column<long>(type: "bigint", nullable: false),
                    user_id1 = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_branches", x => new { x.user_id, x.branch_id });
                    table.ForeignKey(
                        name: "fk_user_branches_branches_branch_id",
                        column: x => x.branch_id,
                        principalSchema: "kayan",
                        principalTable: "branches",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_user_branches_users_user_id1",
                        column: x => x.user_id1,
                        principalSchema: "kayan",
                        principalTable: "users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "material_requisition_lines",
                schema: "erp",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    requisition_id = table.Column<long>(type: "bigint", nullable: false),
                    item_id = table.Column<long>(type: "bigint", nullable: false),
                    from_warehouse_id = table.Column<long>(type: "bigint", nullable: true),
                    requested_qty = table.Column<decimal>(type: "numeric", nullable: false),
                    dispatched_qty = table.Column<decimal>(type: "numeric", nullable: false),
                    received_qty = table.Column<decimal>(type: "numeric", nullable: false),
                    batch_number = table.Column<string>(type: "text", nullable: true),
                    expiry_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    unit_cost = table.Column<decimal>(type: "numeric", nullable: false),
                    line_status = table.Column<string>(type: "text", nullable: false),
                    discrepancy_reason = table.Column<string>(type: "text", nullable: true),
                    warehouse_notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_material_requisition_lines", x => x.id);
                    table.ForeignKey(
                        name: "fk_material_requisition_lines_items_item_id",
                        column: x => x.item_id,
                        principalSchema: "kayan",
                        principalTable: "items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_material_requisition_lines_material_requisitions_requisitio",
                        column: x => x.requisition_id,
                        principalSchema: "erp",
                        principalTable: "material_requisitions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_material_requisition_lines_warehouses_from_warehouse_id",
                        column: x => x.from_warehouse_id,
                        principalSchema: "kayan",
                        principalTable: "warehouses",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "sales_order_lines",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    sales_order_id = table.Column<long>(type: "bigint", nullable: false),
                    item_id = table.Column<long>(type: "bigint", nullable: false),
                    quantity = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    unit_price = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    discount_amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    tax_amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    line_total = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    delivred_quantity = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("sales_order_lines_pkey", x => x.id);
                    table.ForeignKey(
                        name: "sales_lines_item_fk",
                        column: x => x.item_id,
                        principalSchema: "kayan",
                        principalTable: "items",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "sales_lines_order_fk",
                        column: x => x.sales_order_id,
                        principalSchema: "kayan",
                        principalTable: "sales_orders",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "stock_transfer_lines",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    transfer_id = table.Column<long>(type: "bigint", nullable: false),
                    item_id = table.Column<long>(type: "bigint", nullable: false),
                    quantity = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    received_quantity = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    batch_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    expiry_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    unit_cost = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    line_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValueSql: "'PENDING'"),
                    discrepancy_reason = table.Column<string>(type: "text", nullable: true),
                    resolution_notes = table.Column<string>(type: "text", nullable: true),
                    loss_qty = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("stock_transfer_lines_pkey", x => x.id);
                    table.ForeignKey(
                        name: "stock_transfer_lines_item_fk",
                        column: x => x.item_id,
                        principalSchema: "kayan",
                        principalTable: "items",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "stock_transfer_lines_transfer_fk",
                        column: x => x.transfer_id,
                        principalSchema: "kayan",
                        principalTable: "stock_transfers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "production_orders",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    warehouse_id = table.Column<long>(type: "bigint", nullable: false),
                    order_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    order_date = table.Column<DateOnly>(type: "date", nullable: false, defaultValueSql: "CURRENT_DATE"),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValueSql: "'DRAFT'"),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<long>(type: "bigint", nullable: true),
                    recipe_id = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("production_orders_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_production_orders_recipes_recipe_id",
                        column: x => x.recipe_id,
                        principalSchema: "kayan",
                        principalTable: "recipes",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "production_orders_company_fk",
                        column: x => x.company_id,
                        principalSchema: "kayan",
                        principalTable: "companies",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "production_orders_warehouse_fk",
                        column: x => x.warehouse_id,
                        principalSchema: "kayan",
                        principalTable: "warehouses",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "recipe_stages",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    recipe_id = table.Column<long>(type: "bigint", nullable: false),
                    stage_number = table.Column<int>(type: "integer", nullable: false),
                    stage_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    stage_recipe_id = table.Column<long>(type: "bigint", nullable: true),
                    output_item_id = table.Column<long>(type: "bigint", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("recipe_stages_pkey", x => x.id);
                    table.ForeignKey(
                        name: "recipe_stages_output_item_id_fkey",
                        column: x => x.output_item_id,
                        principalSchema: "kayan",
                        principalTable: "items",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "recipe_stages_recipe_id_fkey",
                        column: x => x.recipe_id,
                        principalSchema: "kayan",
                        principalTable: "recipes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "recipe_stages_stage_recipe_id_fkey",
                        column: x => x.stage_recipe_id,
                        principalSchema: "kayan",
                        principalTable: "recipes",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "purchase_order_lines",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    purchase_order_id = table.Column<long>(type: "bigint", nullable: false),
                    item_id = table.Column<long>(type: "bigint", nullable: false),
                    quantity = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    unit_price = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    received_quantity = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    discount_amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    tax_amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    line_total = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false, computedColumnSql: "(((quantity * unit_price) - discount_amount) + tax_amount)", stored: true),
                    notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("purchase_order_lines_pkey", x => x.id);
                    table.ForeignKey(
                        name: "purchase_order_lines_item_id_fkey",
                        column: x => x.item_id,
                        principalSchema: "kayan",
                        principalTable: "items",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "purchase_order_lines_purchase_order_id_fkey",
                        column: x => x.purchase_order_id,
                        principalSchema: "kayan",
                        principalTable: "purchase_orders",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "production_order_details",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    production_order_id = table.Column<long>(type: "bigint", nullable: false),
                    item_id = table.Column<long>(type: "bigint", nullable: false),
                    recipe_id = table.Column<long>(type: "bigint", nullable: true),
                    planned_quantity = table.Column<decimal>(type: "numeric(14,3)", precision: 14, scale: 3, nullable: false),
                    produced_quantity = table.Column<decimal>(type: "numeric(14,3)", precision: 14, scale: 3, nullable: false),
                    unit = table.Column<string>(type: "text", nullable: false),
                    batch_number = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValueSql: "'PENDING'"),
                    notes = table.Column<string>(type: "text", nullable: true),
                    Employee_id = table.Column<long>(type: "bigint", nullable: true),
                    working_hours = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    waste_quantity = table.Column<decimal>(type: "numeric(14,3)", precision: 14, scale: 3, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("production_order_details_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_production_order_details_employees_employee_id",
                        column: x => x.Employee_id,
                        principalSchema: "kayan",
                        principalTable: "employees",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "production_order_details_item_fk",
                        column: x => x.item_id,
                        principalSchema: "kayan",
                        principalTable: "items",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "production_order_details_order_fk",
                        column: x => x.production_order_id,
                        principalSchema: "kayan",
                        principalTable: "production_orders",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "production_order_details_recipe_fk",
                        column: x => x.recipe_id,
                        principalSchema: "kayan",
                        principalTable: "recipes",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "productivity_logs",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    production_order_id = table.Column<long>(type: "bigint", nullable: false),
                    employee_id = table.Column<long>(type: "bigint", nullable: false),
                    work_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    attendance_status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    check_in = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    check_out = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    hours_worked = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    hourly_rate = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    labor_cost = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    produced_quantity = table.Column<decimal>(type: "numeric(18,3)", nullable: false),
                    waste_quantity = table.Column<decimal>(type: "numeric(18,3)", nullable: false),
                    waste_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_productivity_logs", x => x.id);
                    table.ForeignKey(
                        name: "fk_productivity_logs_employees_employee_id",
                        column: x => x.employee_id,
                        principalSchema: "kayan",
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_productivity_logs_production_orders_production_order_id",
                        column: x => x.production_order_id,
                        principalSchema: "kayan",
                        principalTable: "production_orders",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "recipe_lines",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    recipe_id = table.Column<long>(type: "bigint", nullable: false),
                    component_item_id = table.Column<long>(type: "bigint", nullable: false),
                    line_number = table.Column<int>(type: "integer", nullable: false),
                    quantity = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    waste_percentage = table.Column<decimal>(type: "numeric(8,3)", precision: 8, scale: 3, nullable: false),
                    is_optional = table.Column<bool>(type: "boolean", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    stage_id = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("recipe_lines_pkey", x => x.id);
                    table.ForeignKey(
                        name: "recipe_lines_component_item_id_fkey",
                        column: x => x.component_item_id,
                        principalSchema: "kayan",
                        principalTable: "items",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "recipe_lines_recipe_id_fkey",
                        column: x => x.recipe_id,
                        principalSchema: "kayan",
                        principalTable: "recipes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "recipe_lines_stage_fk",
                        column: x => x.stage_id,
                        principalSchema: "kayan",
                        principalTable: "recipe_stages",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "production_order_stages",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    production_order_detail_id = table.Column<long>(type: "bigint", nullable: false),
                    stage_number = table.Column<int>(type: "integer", nullable: false),
                    item_id = table.Column<long>(type: "bigint", nullable: false),
                    recipe_stage_id = table.Column<long>(type: "bigint", nullable: true),
                    planned_quantity = table.Column<decimal>(type: "numeric(14,3)", precision: 14, scale: 3, nullable: false),
                    produced_quantity = table.Column<decimal>(type: "numeric(14,3)", precision: 14, scale: 3, nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValueSql: "'PENDING'"),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    recipe_id = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("production_order_stages_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_production_order_stages_recipes_recipe_id",
                        column: x => x.recipe_id,
                        principalSchema: "kayan",
                        principalTable: "recipes",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "production_stages_detail_fk",
                        column: x => x.production_order_detail_id,
                        principalSchema: "kayan",
                        principalTable: "production_order_details",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "production_stages_item_fk",
                        column: x => x.item_id,
                        principalSchema: "kayan",
                        principalTable: "items",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "production_stages_recipe_stage_fk",
                        column: x => x.recipe_stage_id,
                        principalSchema: "kayan",
                        principalTable: "recipe_stages",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "production_stage_materials",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    production_stage_id = table.Column<long>(type: "bigint", nullable: false),
                    item_id = table.Column<long>(type: "bigint", nullable: false),
                    required_quantity = table.Column<decimal>(type: "numeric(14,3)", precision: 14, scale: 3, nullable: false),
                    consumed_quantity = table.Column<decimal>(type: "numeric(14,3)", precision: 14, scale: 3, nullable: false),
                    unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    waste_percentage = table.Column<decimal>(type: "numeric(8,3)", precision: 8, scale: 3, nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    recipe_line_id = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("production_stage_materials_pkey", x => x.id);
                    table.ForeignKey(
                        name: "production_material_recipe_line_fk",
                        column: x => x.recipe_line_id,
                        principalSchema: "kayan",
                        principalTable: "recipe_lines",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "production_materials_item_fk",
                        column: x => x.item_id,
                        principalSchema: "kayan",
                        principalTable: "items",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "production_materials_stage_fk",
                        column: x => x.production_stage_id,
                        principalSchema: "kayan",
                        principalTable: "production_order_stages",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "quality_inspections",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    item_id = table.Column<long>(type: "bigint", nullable: false),
                    warehouse_id = table.Column<long>(type: "bigint", nullable: true),
                    production_order_id = table.Column<long>(type: "bigint", nullable: true),
                    production_stage_id = table.Column<long>(type: "bigint", nullable: true),
                    inspection_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    inspection_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    quantity = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValueSql: "'PENDING'"),
                    result = table.Column<string>(type: "text", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    is_gmp_passed = table.Column<bool>(type: "boolean", nullable: false),
                    is_haccp_passed = table.Column<bool>(type: "boolean", nullable: false),
                    is_weights_passed = table.Column<bool>(type: "boolean", nullable: false),
                    quality_score = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    inspector_name = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("quality_inspections_pkey", x => x.id);
                    table.ForeignKey(
                        name: "quality_company_fk",
                        column: x => x.company_id,
                        principalSchema: "kayan",
                        principalTable: "companies",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "quality_inspections_item_id_fkey",
                        column: x => x.item_id,
                        principalSchema: "kayan",
                        principalTable: "items",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "quality_inspections_production_order_id_fkey",
                        column: x => x.production_order_id,
                        principalSchema: "kayan",
                        principalTable: "production_orders",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "quality_inspections_production_stage_id_fkey",
                        column: x => x.production_stage_id,
                        principalSchema: "kayan",
                        principalTable: "production_order_stages",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "quality_inspections_warehouse_id_fkey",
                        column: x => x.warehouse_id,
                        principalSchema: "kayan",
                        principalTable: "warehouses",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "waste_records",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    item_id = table.Column<long>(type: "bigint", nullable: false),
                    warehouse_id = table.Column<long>(type: "bigint", nullable: true),
                    production_order_id = table.Column<long>(type: "bigint", nullable: true),
                    production_stage_id = table.Column<long>(type: "bigint", nullable: true),
                    quantity = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    waste_reason = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    waste_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<long>(type: "bigint", nullable: true),
                    created_by_navigation_id = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("waste_records_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_waste_records_users_created_by_navigation_id",
                        column: x => x.created_by_navigation_id,
                        principalSchema: "kayan",
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "waste_company_fk",
                        column: x => x.company_id,
                        principalSchema: "kayan",
                        principalTable: "companies",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "waste_item_fk",
                        column: x => x.item_id,
                        principalSchema: "kayan",
                        principalTable: "items",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "waste_production_order_fk",
                        column: x => x.production_order_id,
                        principalSchema: "kayan",
                        principalTable: "production_orders",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "waste_production_stage_fk",
                        column: x => x.production_stage_id,
                        principalSchema: "kayan",
                        principalTable: "production_order_stages",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "waste_records_warehouse_id_fkey",
                        column: x => x.warehouse_id,
                        principalSchema: "kayan",
                        principalTable: "warehouses",
                        principalColumn: "id");
                });

            migrationBuilder.CreateIndex(
                name: "ix_asset_balances_company_id_item_id_party_type_party_id",
                schema: "kayan",
                table: "asset_balances",
                columns: new[] { "company_id", "item_id", "party_type", "party_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_asset_balances_item_id",
                schema: "kayan",
                table: "asset_balances",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "ix_asset_history_logs_fixed_asset_id",
                schema: "kayan",
                table: "asset_history_logs",
                column: "fixed_asset_id");

            migrationBuilder.CreateIndex(
                name: "ix_asset_movements_company_id",
                schema: "kayan",
                table: "asset_movements",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "ix_asset_movements_from_party_type_from_party_id",
                schema: "kayan",
                table: "asset_movements",
                columns: new[] { "from_party_type", "from_party_id" });

            migrationBuilder.CreateIndex(
                name: "ix_asset_movements_item_id",
                schema: "kayan",
                table: "asset_movements",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "ix_asset_movements_to_party_type_to_party_id",
                schema: "kayan",
                table: "asset_movements",
                columns: new[] { "to_party_type", "to_party_id" });

            migrationBuilder.CreateIndex(
                name: "ix_branch_transfers_company_id",
                schema: "erp",
                table: "branch_transfers",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "ix_branch_transfers_destination_branch_id",
                schema: "erp",
                table: "branch_transfers",
                column: "destination_branch_id");

            migrationBuilder.CreateIndex(
                name: "ix_branch_transfers_destination_warehouse_id",
                schema: "erp",
                table: "branch_transfers",
                column: "destination_warehouse_id");

            migrationBuilder.CreateIndex(
                name: "ix_branch_transfers_item_id",
                schema: "erp",
                table: "branch_transfers",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "ix_branch_transfers_source_warehouse_id",
                schema: "erp",
                table: "branch_transfers",
                column: "source_warehouse_id");

            migrationBuilder.CreateIndex(
                name: "ix_branches_company_id",
                schema: "kayan",
                table: "branches",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "ix_branches_company_id_branch_code",
                schema: "kayan",
                table: "branches",
                columns: new[] { "company_id", "branch_code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_circulating_containers_container_name",
                schema: "kayan",
                table: "circulating_containers",
                column: "container_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_companies_company_code",
                schema: "kayan",
                table: "companies",
                column: "company_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_crate_client_transactions_company_id",
                schema: "kayan",
                table: "crate_client_transactions",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "ix_crate_client_transactions_crate_client_id",
                schema: "kayan",
                table: "crate_client_transactions",
                column: "crate_client_id");

            migrationBuilder.CreateIndex(
                name: "ix_crate_client_transactions_transaction_date",
                schema: "kayan",
                table: "crate_client_transactions",
                column: "transaction_date");

            migrationBuilder.CreateIndex(
                name: "ix_crate_clients_company_id",
                schema: "kayan",
                table: "crate_clients",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "ix_crate_clients_company_id_name",
                schema: "kayan",
                table: "crate_clients",
                columns: new[] { "company_id", "name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_crate_movements_movement_number",
                schema: "kayan",
                table: "crate_movements",
                column: "movement_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_crate_transactions_crate_id",
                schema: "erp",
                table: "crate_transactions",
                column: "crate_id");

            migrationBuilder.CreateIndex(
                name: "ix_customers_company_id",
                schema: "kayan",
                table: "customers",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "ix_customers_company_id_customer_code",
                schema: "kayan",
                table: "customers",
                columns: new[] { "company_id", "customer_code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_departments_company_id_department_code",
                schema: "kayan",
                table: "departments",
                columns: new[] { "company_id", "department_code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_departments_parent_department_id",
                schema: "kayan",
                table: "departments",
                column: "parent_department_id");

            migrationBuilder.CreateIndex(
                name: "ix_dynamic_forms_form_code",
                schema: "kayan",
                table: "dynamic_forms",
                column: "form_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_emergency_tasks_status",
                schema: "kayan",
                table: "emergency_tasks",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_emergency_tasks_task_number",
                schema: "kayan",
                table: "emergency_tasks",
                column: "task_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_employees_branch_id",
                schema: "kayan",
                table: "employees",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "ix_employees_company_id",
                schema: "kayan",
                table: "employees",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "ix_employees_department_id",
                schema: "kayan",
                table: "employees",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "ix_employees_job_title_id",
                schema: "kayan",
                table: "employees",
                column: "job_title_id");

            migrationBuilder.CreateIndex(
                name: "ix_employees_manager_id",
                schema: "kayan",
                table: "employees",
                column: "manager_id");

            migrationBuilder.CreateIndex(
                name: "ix_finished_goods_transfers_destination_warehouse_id",
                schema: "erp",
                table: "finished_goods_transfers",
                column: "destination_warehouse_id");

            migrationBuilder.CreateIndex(
                name: "ix_finished_goods_transfers_item_id",
                schema: "erp",
                table: "finished_goods_transfers",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "ix_finished_goods_transfers_source_warehouse_id",
                schema: "erp",
                table: "finished_goods_transfers",
                column: "source_warehouse_id");

            migrationBuilder.CreateIndex(
                name: "ix_fixed_assets_asset_code",
                schema: "kayan",
                table: "fixed_assets",
                column: "asset_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_form_submissions_form_id",
                schema: "kayan",
                table: "form_submissions",
                column: "form_id");

            migrationBuilder.CreateIndex(
                name: "ix_item_categories_company_id",
                schema: "kayan",
                table: "item_categories",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "ix_item_categories_company_id_category_code",
                schema: "kayan",
                table: "item_categories",
                columns: new[] { "company_id", "category_code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_item_uom_conversions_item_id",
                schema: "erp",
                table: "item_uom_conversions",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "ix_items_category_id",
                schema: "kayan",
                table: "items",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "ix_items_company_id_item_code",
                schema: "kayan",
                table: "items",
                columns: new[] { "company_id", "item_code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_items_department_id",
                schema: "kayan",
                table: "items",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "ix_items_parent_item_id",
                schema: "kayan",
                table: "items",
                column: "parent_item_id");

            migrationBuilder.CreateIndex(
                name: "ix_job_titles_company_id_title_name",
                schema: "kayan",
                table: "job_titles",
                columns: new[] { "company_id", "title_name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_maintenance_assets_company_id_asset_code",
                schema: "kayan",
                table: "maintenance_assets",
                columns: new[] { "company_id", "asset_code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_maintenance_assets_department_id",
                schema: "kayan",
                table: "maintenance_assets",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "ix_maintenance_orders_asset_id",
                schema: "kayan",
                table: "maintenance_orders",
                column: "asset_id");

            migrationBuilder.CreateIndex(
                name: "ix_maintenance_orders_company_id_order_number",
                schema: "kayan",
                table: "maintenance_orders",
                columns: new[] { "company_id", "order_number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_material_requisition_lines_from_warehouse_id",
                schema: "erp",
                table: "material_requisition_lines",
                column: "from_warehouse_id");

            migrationBuilder.CreateIndex(
                name: "ix_material_requisition_lines_item_id",
                schema: "erp",
                table: "material_requisition_lines",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "ix_material_requisition_lines_requisition_id",
                schema: "erp",
                table: "material_requisition_lines",
                column: "requisition_id");

            migrationBuilder.CreateIndex(
                name: "ix_material_requisitions_department_id",
                schema: "erp",
                table: "material_requisitions",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "ix_material_requisitions_from_warehouse_id",
                schema: "erp",
                table: "material_requisitions",
                column: "from_warehouse_id");

            migrationBuilder.CreateIndex(
                name: "ix_material_requisitions_to_warehouse_id",
                schema: "erp",
                table: "material_requisitions",
                column: "to_warehouse_id");

            migrationBuilder.CreateIndex(
                name: "ix_production_order_details_employee_id",
                schema: "kayan",
                table: "production_order_details",
                column: "Employee_id");

            migrationBuilder.CreateIndex(
                name: "ix_production_order_details_item_id",
                schema: "kayan",
                table: "production_order_details",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "ix_production_order_details_production_order_id",
                schema: "kayan",
                table: "production_order_details",
                column: "production_order_id");

            migrationBuilder.CreateIndex(
                name: "ix_production_order_details_recipe_id",
                schema: "kayan",
                table: "production_order_details",
                column: "recipe_id");

            migrationBuilder.CreateIndex(
                name: "ix_production_order_stages_item_id",
                schema: "kayan",
                table: "production_order_stages",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "ix_production_order_stages_production_order_detail_id",
                schema: "kayan",
                table: "production_order_stages",
                column: "production_order_detail_id");

            migrationBuilder.CreateIndex(
                name: "ix_production_order_stages_production_order_detail_id_stage_nu",
                schema: "kayan",
                table: "production_order_stages",
                columns: new[] { "production_order_detail_id", "stage_number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_production_order_stages_recipe_id",
                schema: "kayan",
                table: "production_order_stages",
                column: "recipe_id");

            migrationBuilder.CreateIndex(
                name: "ix_production_order_stages_recipe_stage_id",
                schema: "kayan",
                table: "production_order_stages",
                column: "recipe_stage_id");

            migrationBuilder.CreateIndex(
                name: "ix_production_orders_company_id_order_number",
                schema: "kayan",
                table: "production_orders",
                columns: new[] { "company_id", "order_number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_production_orders_recipe_id",
                schema: "kayan",
                table: "production_orders",
                column: "recipe_id");

            migrationBuilder.CreateIndex(
                name: "ix_production_orders_status",
                schema: "kayan",
                table: "production_orders",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_production_orders_warehouse_id",
                schema: "kayan",
                table: "production_orders",
                column: "warehouse_id");

            migrationBuilder.CreateIndex(
                name: "ix_production_stage_materials_item_id",
                schema: "kayan",
                table: "production_stage_materials",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "ix_production_stage_materials_production_stage_id",
                schema: "kayan",
                table: "production_stage_materials",
                column: "production_stage_id");

            migrationBuilder.CreateIndex(
                name: "ix_production_stage_materials_recipe_line_id",
                schema: "kayan",
                table: "production_stage_materials",
                column: "recipe_line_id");

            migrationBuilder.CreateIndex(
                name: "ix_productivity_logs_employee_id",
                schema: "kayan",
                table: "productivity_logs",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "ix_productivity_logs_production_order_id",
                schema: "kayan",
                table: "productivity_logs",
                column: "production_order_id");

            migrationBuilder.CreateIndex(
                name: "ix_purchase_invoice_lines_purchase_invoice_id",
                schema: "erp",
                table: "purchase_invoice_lines",
                column: "purchase_invoice_id");

            migrationBuilder.CreateIndex(
                name: "ix_purchase_order_lines_item_id",
                schema: "kayan",
                table: "purchase_order_lines",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "ix_purchase_order_lines_purchase_order_id",
                schema: "kayan",
                table: "purchase_order_lines",
                column: "purchase_order_id");

            migrationBuilder.CreateIndex(
                name: "ix_purchase_orders_company_id_order_number",
                schema: "kayan",
                table: "purchase_orders",
                columns: new[] { "company_id", "order_number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_purchase_orders_created_by_navigation_id",
                schema: "kayan",
                table: "purchase_orders",
                column: "created_by_navigation_id");

            migrationBuilder.CreateIndex(
                name: "ix_purchase_orders_supplier_id",
                schema: "kayan",
                table: "purchase_orders",
                column: "supplier_id");

            migrationBuilder.CreateIndex(
                name: "ix_purchase_orders_warehouse_id",
                schema: "kayan",
                table: "purchase_orders",
                column: "warehouse_id");

            migrationBuilder.CreateIndex(
                name: "ix_quality_inspections_company_id",
                schema: "kayan",
                table: "quality_inspections",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "ix_quality_inspections_item_id",
                schema: "kayan",
                table: "quality_inspections",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "ix_quality_inspections_production_order_id",
                schema: "kayan",
                table: "quality_inspections",
                column: "production_order_id");

            migrationBuilder.CreateIndex(
                name: "ix_quality_inspections_production_stage_id",
                schema: "kayan",
                table: "quality_inspections",
                column: "production_stage_id");

            migrationBuilder.CreateIndex(
                name: "ix_quality_inspections_warehouse_id",
                schema: "kayan",
                table: "quality_inspections",
                column: "warehouse_id");

            migrationBuilder.CreateIndex(
                name: "ix_recipe_lines_component_item_id",
                schema: "kayan",
                table: "recipe_lines",
                column: "component_item_id");

            migrationBuilder.CreateIndex(
                name: "ix_recipe_lines_recipe_id_line_number",
                schema: "kayan",
                table: "recipe_lines",
                columns: new[] { "recipe_id", "line_number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_recipe_lines_stage_id",
                schema: "kayan",
                table: "recipe_lines",
                column: "stage_id");

            migrationBuilder.CreateIndex(
                name: "ix_recipe_stages_output_item_id",
                schema: "kayan",
                table: "recipe_stages",
                column: "output_item_id");

            migrationBuilder.CreateIndex(
                name: "ix_recipe_stages_recipe_id",
                schema: "kayan",
                table: "recipe_stages",
                column: "recipe_id");

            migrationBuilder.CreateIndex(
                name: "ix_recipe_stages_recipe_id_stage_number",
                schema: "kayan",
                table: "recipe_stages",
                columns: new[] { "recipe_id", "stage_number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_recipe_stages_stage_recipe_id",
                schema: "kayan",
                table: "recipe_stages",
                column: "stage_recipe_id");

            migrationBuilder.CreateIndex(
                name: "ix_recipes_company_id_recipe_code",
                schema: "kayan",
                table: "recipes",
                columns: new[] { "company_id", "recipe_code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_recipes_product_item_id",
                schema: "kayan",
                table: "recipes",
                column: "product_item_id");

            migrationBuilder.CreateIndex(
                name: "ix_refresh_tokens_expires_at",
                schema: "kayan",
                table: "refresh_tokens",
                column: "expires_at");

            migrationBuilder.CreateIndex(
                name: "ix_refresh_tokens_token",
                schema: "kayan",
                table: "refresh_tokens",
                column: "token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_refresh_tokens_user_id",
                schema: "kayan",
                table: "refresh_tokens",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_role_company_id",
                schema: "kayan",
                table: "role",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "ix_roles_company_id",
                schema: "kayan",
                table: "roles",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "ix_roles_company_id_role_code",
                schema: "kayan",
                table: "roles",
                columns: new[] { "company_id", "role_code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_sales_invoice_lines_invoice_id",
                schema: "kayan",
                table: "sales_invoice_lines",
                column: "invoice_id");

            migrationBuilder.CreateIndex(
                name: "ix_sales_invoice_lines_item_id",
                schema: "kayan",
                table: "sales_invoice_lines",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "ix_sales_invoices_branch_id",
                schema: "kayan",
                table: "sales_invoices",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "ix_sales_invoices_customer_id",
                schema: "kayan",
                table: "sales_invoices",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "ix_sales_invoices_invoice_date",
                schema: "kayan",
                table: "sales_invoices",
                column: "invoice_date");

            migrationBuilder.CreateIndex(
                name: "ix_sales_invoices_invoice_number",
                schema: "kayan",
                table: "sales_invoices",
                column: "invoice_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_sales_order_lines_item_id",
                schema: "kayan",
                table: "sales_order_lines",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "ix_sales_order_lines_sales_order_id",
                schema: "kayan",
                table: "sales_order_lines",
                column: "sales_order_id");

            migrationBuilder.CreateIndex(
                name: "ix_sales_orders_branch_id",
                schema: "kayan",
                table: "sales_orders",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "ix_sales_orders_company_id",
                schema: "kayan",
                table: "sales_orders",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "ix_sales_orders_company_id_order_number",
                schema: "kayan",
                table: "sales_orders",
                columns: new[] { "company_id", "order_number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_sales_orders_customer_id",
                schema: "kayan",
                table: "sales_orders",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "ix_sales_orders_warehouse_id",
                schema: "kayan",
                table: "sales_orders",
                column: "warehouse_id");

            migrationBuilder.CreateIndex(
                name: "ix_stock_balances_company_id",
                schema: "erp",
                table: "stock_balances",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "ix_stock_balances_item_id",
                schema: "erp",
                table: "stock_balances",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "ix_stock_balances_warehouse_id",
                schema: "erp",
                table: "stock_balances",
                column: "warehouse_id");

            migrationBuilder.CreateIndex(
                name: "ix_stock_movements_company_id",
                schema: "kayan",
                table: "stock_movements",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "ix_stock_movements_created_by",
                schema: "kayan",
                table: "stock_movements",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "ix_stock_movements_item_id",
                schema: "kayan",
                table: "stock_movements",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "ix_stock_movements_movement_at",
                schema: "kayan",
                table: "stock_movements",
                column: "movement_at");

            migrationBuilder.CreateIndex(
                name: "ix_stock_movements_reference_type_reference_id",
                schema: "kayan",
                table: "stock_movements",
                columns: new[] { "reference_type", "reference_id" });

            migrationBuilder.CreateIndex(
                name: "ix_stock_movements_warehouse_id",
                schema: "kayan",
                table: "stock_movements",
                column: "warehouse_id");

            migrationBuilder.CreateIndex(
                name: "ix_stock_transfer_lines_item_id",
                schema: "kayan",
                table: "stock_transfer_lines",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "ix_stock_transfer_lines_transfer_id",
                schema: "kayan",
                table: "stock_transfer_lines",
                column: "transfer_id");

            migrationBuilder.CreateIndex(
                name: "ix_stock_transfers_company_id_transfer_number",
                schema: "kayan",
                table: "stock_transfers",
                columns: new[] { "company_id", "transfer_number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_stock_transfers_from_warehouse_id",
                schema: "kayan",
                table: "stock_transfers",
                column: "from_warehouse_id");

            migrationBuilder.CreateIndex(
                name: "ix_stock_transfers_to_warehouse_id",
                schema: "kayan",
                table: "stock_transfers",
                column: "to_warehouse_id");

            migrationBuilder.CreateIndex(
                name: "ix_supplier_item_prices_item_id",
                schema: "erp",
                table: "supplier_item_prices",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "ix_supplier_item_prices_supplier_id",
                schema: "erp",
                table: "supplier_item_prices",
                column: "supplier_id");

            migrationBuilder.CreateIndex(
                name: "ix_suppliers_company_id",
                schema: "kayan",
                table: "suppliers",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "ix_suppliers_company_id_supplier_code",
                schema: "kayan",
                table: "suppliers",
                columns: new[] { "company_id", "supplier_code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_unit_conversions_company_id_from_unit_id_to_unit_id",
                schema: "kayan",
                table: "unit_conversions",
                columns: new[] { "company_id", "from_unit_id", "to_unit_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_unit_conversions_from_unit_id",
                schema: "kayan",
                table: "unit_conversions",
                column: "from_unit_id");

            migrationBuilder.CreateIndex(
                name: "ix_unit_conversions_to_unit_id",
                schema: "kayan",
                table: "unit_conversions",
                column: "to_unit_id");

            migrationBuilder.CreateIndex(
                name: "ix_units_company_id",
                schema: "kayan",
                table: "units",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "ix_units_company_id_unit_code",
                schema: "kayan",
                table: "units",
                columns: new[] { "company_id", "unit_code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_user_branches_branch_id",
                schema: "kayan",
                table: "user_branches",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_branches_user_id1",
                schema: "kayan",
                table: "user_branches",
                column: "user_id1");

            migrationBuilder.CreateIndex(
                name: "ix_users_company_id",
                schema: "kayan",
                table: "users",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "ix_users_role_id",
                schema: "kayan",
                table: "users",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "ix_warehouses_branch_id",
                schema: "kayan",
                table: "warehouses",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "ix_warehouses_company_id_warehouse_code",
                schema: "kayan",
                table: "warehouses",
                columns: new[] { "company_id", "warehouse_code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_warehouses_parent_warehouse_id",
                schema: "kayan",
                table: "warehouses",
                column: "parent_warehouse_id");

            migrationBuilder.CreateIndex(
                name: "ix_waste_records_company_id",
                schema: "kayan",
                table: "waste_records",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "ix_waste_records_created_by_navigation_id",
                schema: "kayan",
                table: "waste_records",
                column: "created_by_navigation_id");

            migrationBuilder.CreateIndex(
                name: "ix_waste_records_item_id",
                schema: "kayan",
                table: "waste_records",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "ix_waste_records_production_order_id",
                schema: "kayan",
                table: "waste_records",
                column: "production_order_id");

            migrationBuilder.CreateIndex(
                name: "ix_waste_records_production_stage_id",
                schema: "kayan",
                table: "waste_records",
                column: "production_stage_id");

            migrationBuilder.CreateIndex(
                name: "ix_waste_records_warehouse_id",
                schema: "kayan",
                table: "waste_records",
                column: "warehouse_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "asset_balances",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "asset_history_logs",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "asset_movements",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "branch_transfers",
                schema: "erp");

            migrationBuilder.DropTable(
                name: "circulating_containers",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "crate_client_transactions",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "crate_movements",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "crate_transactions",
                schema: "erp");

            migrationBuilder.DropTable(
                name: "emergency_tasks",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "finished_goods_transfers",
                schema: "erp");

            migrationBuilder.DropTable(
                name: "form_submissions",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "item_uom_conversions",
                schema: "erp");

            migrationBuilder.DropTable(
                name: "maintenance_orders",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "material_requisition_lines",
                schema: "erp");

            migrationBuilder.DropTable(
                name: "production_stage_materials",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "productivity_logs",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "purchase_invoice_lines",
                schema: "erp");

            migrationBuilder.DropTable(
                name: "purchase_order_lines",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "quality_inspections",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "refresh_tokens",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "roles",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "sales_invoice_lines",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "sales_order_lines",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "stock_balances",
                schema: "erp");

            migrationBuilder.DropTable(
                name: "stock_movements",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "stock_transfer_lines",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "supplier_item_prices",
                schema: "erp");

            migrationBuilder.DropTable(
                name: "unit_conversions",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "user_branches",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "waste_records",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "fixed_assets",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "crate_clients",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "crates",
                schema: "erp");

            migrationBuilder.DropTable(
                name: "dynamic_forms",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "maintenance_assets",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "material_requisitions",
                schema: "erp");

            migrationBuilder.DropTable(
                name: "recipe_lines",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "purchase_invoices",
                schema: "erp");

            migrationBuilder.DropTable(
                name: "purchase_orders",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "sales_invoices",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "sales_orders",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "stock_transfers",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "units",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "production_order_stages",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "users",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "suppliers",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "customers",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "production_order_details",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "recipe_stages",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "role",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "employees",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "production_orders",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "job_titles",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "recipes",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "warehouses",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "items",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "branches",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "item_categories",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "departments",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "companies",
                schema: "kayan");

            migrationBuilder.DropSequence(
                name: "production_order_number_seq",
                schema: "kayan");
        }
    }
}
