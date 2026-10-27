using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace KayanERP.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddFinancialAndHR : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "accounts",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    account_code = table.Column<string>(type: "text", nullable: false),
                    account_name = table.Column<string>(type: "text", nullable: false),
                    account_type = table.Column<string>(type: "text", nullable: false),
                    parent_account_id = table.Column<long>(type: "bigint", nullable: true),
                    active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_accounts", x => x.id);
                    table.ForeignKey(
                        name: "fk_accounts_accounts_parent_account_id",
                        column: x => x.parent_account_id,
                        principalSchema: "kayan",
                        principalTable: "accounts",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "audit_logs",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    table_name = table.Column<string>(type: "text", nullable: false),
                    primary_key = table.Column<string>(type: "text", nullable: false),
                    action = table.Column<string>(type: "text", nullable: false),
                    old_values = table.Column<string>(type: "jsonb", nullable: true),
                    new_values = table.Column<string>(type: "jsonb", nullable: true),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_audit_logs", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "journal_entries",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    entry_number = table.Column<string>(type: "text", nullable: false),
                    reference_type = table.Column<string>(type: "text", nullable: false),
                    reference_number = table.Column<string>(type: "text", nullable: false),
                    entry_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_journal_entries", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "price_lists",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_price_lists", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "shifts",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    company_id = table.Column<long>(type: "bigint", nullable: false),
                    shift_name = table.Column<string>(type: "text", nullable: false),
                    start_time = table.Column<TimeSpan>(type: "interval", nullable: false),
                    end_time = table.Column<TimeSpan>(type: "interval", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_shifts", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "journal_entry_lines",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    journal_entry_id = table.Column<long>(type: "bigint", nullable: false),
                    account_id = table.Column<long>(type: "bigint", nullable: false),
                    debit = table.Column<decimal>(type: "numeric", nullable: false),
                    credit = table.Column<decimal>(type: "numeric", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_journal_entry_lines", x => x.id);
                    table.ForeignKey(
                        name: "fk_journal_entry_lines_accounts_account_id",
                        column: x => x.account_id,
                        principalSchema: "kayan",
                        principalTable: "accounts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_journal_entry_lines_journal_entries_journal_entry_id",
                        column: x => x.journal_entry_id,
                        principalSchema: "kayan",
                        principalTable: "journal_entries",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "price_list_items",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    price_list_id = table.Column<long>(type: "bigint", nullable: false),
                    item_id = table.Column<long>(type: "bigint", nullable: false),
                    selling_price = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_price_list_items", x => x.id);
                    table.ForeignKey(
                        name: "fk_price_list_items_items_item_id",
                        column: x => x.item_id,
                        principalSchema: "kayan",
                        principalTable: "items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_price_list_items_price_lists_price_list_id",
                        column: x => x.price_list_id,
                        principalSchema: "kayan",
                        principalTable: "price_lists",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "employee_shifts",
                schema: "kayan",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    employee_id = table.Column<long>(type: "bigint", nullable: false),
                    shift_id = table.Column<long>(type: "bigint", nullable: false),
                    work_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_employee_shifts", x => x.id);
                    table.ForeignKey(
                        name: "fk_employee_shifts_employees_employee_id",
                        column: x => x.employee_id,
                        principalSchema: "kayan",
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_employee_shifts_shifts_shift_id",
                        column: x => x.shift_id,
                        principalSchema: "kayan",
                        principalTable: "shifts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_accounts_parent_account_id",
                schema: "kayan",
                table: "accounts",
                column: "parent_account_id");

            migrationBuilder.CreateIndex(
                name: "ix_employee_shifts_employee_id",
                schema: "kayan",
                table: "employee_shifts",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "ix_employee_shifts_shift_id",
                schema: "kayan",
                table: "employee_shifts",
                column: "shift_id");

            migrationBuilder.CreateIndex(
                name: "ix_journal_entry_lines_account_id",
                schema: "kayan",
                table: "journal_entry_lines",
                column: "account_id");

            migrationBuilder.CreateIndex(
                name: "ix_journal_entry_lines_journal_entry_id",
                schema: "kayan",
                table: "journal_entry_lines",
                column: "journal_entry_id");

            migrationBuilder.CreateIndex(
                name: "ix_price_list_items_item_id",
                schema: "kayan",
                table: "price_list_items",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "ix_price_list_items_price_list_id",
                schema: "kayan",
                table: "price_list_items",
                column: "price_list_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "audit_logs",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "employee_shifts",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "journal_entry_lines",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "price_list_items",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "shifts",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "accounts",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "journal_entries",
                schema: "kayan");

            migrationBuilder.DropTable(
                name: "price_lists",
                schema: "kayan");
        }
    }
}
