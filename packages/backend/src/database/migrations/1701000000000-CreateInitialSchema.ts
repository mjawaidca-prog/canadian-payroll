import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateInitialSchema1701000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create organizations table
    await queryRunner.createTable(
      new Table({
        name: 'organizations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'province',
            type: 'varchar',
            length: '2',
          },
          {
            name: 'businessNumber',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'city',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'postalCode',
            type: 'varchar',
            length: '2',
            isNullable: true,
          },
          {
            name: 'contactEmail',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'contactPhone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Create employees table
    await queryRunner.createTable(
      new Table({
        name: 'employees',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'organizationId',
            type: 'uuid',
          },
          {
            name: 'firstName',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'lastName',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'sin',
            type: 'varchar',
            length: '11',
          },
          {
            name: 'dateOfBirth',
            type: 'date',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'province',
            type: 'varchar',
            length: '2',
            isNullable: true,
          },
          {
            name: 'employmentType',
            type: 'enum',
            enum: ['full_time', 'part_time', 'contract', 'seasonal'],
            default: "'full_time'",
          },
          {
            name: 'salaryAnnual',
            type: 'numeric',
            precision: 12,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'hourlyRate',
            type: 'numeric',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'hireDate',
            type: 'date',
          },
          {
            name: 'terminationDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'federalTaxExemptions',
            type: 'integer',
            default: 1,
          },
          {
            name: 'provincialTaxExemptions',
            type: 'integer',
            default: 0,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Add foreign key for employees
    await queryRunner.createForeignKey(
      'employees',
      new TableForeignKey({
        columnNames: ['organizationId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'organizations',
        onDelete: 'CASCADE',
      })
    );

    // Create pay_runs table
    await queryRunner.createTable(
      new Table({
        name: 'pay_runs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'organizationId',
            type: 'uuid',
          },
          {
            name: 'payPeriodStart',
            type: 'date',
          },
          {
            name: 'payPeriodEnd',
            type: 'date',
          },
          {
            name: 'payDate',
            type: 'date',
          },
          {
            name: 'frequency',
            type: 'enum',
            enum: ['weekly', 'biweekly', 'semi_monthly', 'monthly'],
            default: "'biweekly'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'calculated', 'finalized', 'processed', 'cancelled'],
            default: "'draft'",
          },
          {
            name: 'runNumber',
            type: 'integer',
          },
          {
            name: 'totalGross',
            type: 'numeric',
            precision: 14,
            scale: 2,
            default: 0,
          },
          {
            name: 'totalCPP',
            type: 'numeric',
            precision: 14,
            scale: 2,
            default: 0,
          },
          {
            name: 'totalEI',
            type: 'numeric',
            precision: 14,
            scale: 2,
            default: 0,
          },
          {
            name: 'totalFederalTax',
            type: 'numeric',
            precision: 14,
            scale: 2,
            default: 0,
          },
          {
            name: 'totalProvincialTax',
            type: 'numeric',
            precision: 14,
            scale: 2,
            default: 0,
          },
          {
            name: 'totalDeductions',
            type: 'numeric',
            precision: 14,
            scale: 2,
            default: 0,
          },
          {
            name: 'totalNetPay',
            type: 'numeric',
            precision: 14,
            scale: 2,
            default: 0,
          },
          {
            name: 'employeeCount',
            type: 'integer',
            default: 0,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'processedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'processedBy',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
        ],
      }),
      true
    );

    // Add foreign key for pay_runs
    await queryRunner.createForeignKey(
      'pay_runs',
      new TableForeignKey({
        columnNames: ['organizationId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'organizations',
        onDelete: 'CASCADE',
      })
    );

    // Create pay_run_items table
    await queryRunner.createTable(
      new Table({
        name: 'pay_run_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'payRunId',
            type: 'uuid',
          },
          {
            name: 'employeeId',
            type: 'uuid',
          },
          {
            name: 'grossAmount',
            type: 'numeric',
            precision: 12,
            scale: 2,
          },
          {
            name: 'cppContribution',
            type: 'numeric',
            precision: 12,
            scale: 2,
            default: 0,
          },
          {
            name: 'eiContribution',
            type: 'numeric',
            precision: 12,
            scale: 2,
            default: 0,
          },
          {
            name: 'federalTaxWithheld',
            type: 'numeric',
            precision: 12,
            scale: 2,
            default: 0,
          },
          {
            name: 'provincialTaxWithheld',
            type: 'numeric',
            precision: 12,
            scale: 2,
            default: 0,
          },
          {
            name: 'otherDeductions',
            type: 'numeric',
            precision: 12,
            scale: 2,
            default: 0,
          },
          {
            name: 'netAmount',
            type: 'numeric',
            precision: 12,
            scale: 2,
          },
          {
            name: 'ytdGross',
            type: 'numeric',
            precision: 14,
            scale: 2,
            default: 0,
          },
          {
            name: 'ytdCPP',
            type: 'numeric',
            precision: 14,
            scale: 2,
            default: 0,
          },
          {
            name: 'ytdEI',
            type: 'numeric',
            precision: 14,
            scale: 2,
            default: 0,
          },
          {
            name: 'ytdFederalTax',
            type: 'numeric',
            precision: 14,
            scale: 2,
            default: 0,
          },
          {
            name: 'ytdProvincialTax',
            type: 'numeric',
            precision: 14,
            scale: 2,
            default: 0,
          },
          {
            name: 'calculationNotes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'payStubGeneratedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true
    );

    // Add foreign keys for pay_run_items
    await queryRunner.createForeignKey(
      'pay_run_items',
      new TableForeignKey({
        columnNames: ['payRunId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'pay_runs',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'pay_run_items',
      new TableForeignKey({
        columnNames: ['employeeId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'employees',
        onDelete: 'CASCADE',
      })
    );

    // Create tax_tables table
    await queryRunner.createTable(
      new Table({
        name: 'tax_tables',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'organizationId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'taxYear',
            type: 'integer',
          },
          {
            name: 'province',
            type: 'varchar',
            length: '2',
          },
          {
            name: 'federalBrackets',
            type: 'jsonb',
          },
          {
            name: 'provincialBrackets',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'basicPersonalAmount',
            type: 'numeric',
            precision: 12,
            scale: 2,
          },
          {
            name: 'provincialBasicPersonalAmount',
            type: 'numeric',
            precision: 12,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'cppParameters',
            type: 'jsonb',
          },
          {
            name: 'eiParameters',
            type: 'jsonb',
          },
          {
            name: 'source',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'version',
            type: 'varchar',
            length: '1',
            default: "'A'",
          },
          {
            name: 'effectiveDate',
            type: 'date',
          },
          {
            name: 'expiryDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Add unique index for tax tables
    await queryRunner.createIndex(
      'tax_tables',
      new TableIndex({
        name: 'IDX_tax_tables_org_year_province',
        columnNames: ['organizationId', 'taxYear', 'province'],
        isUnique: true,
        where: 'organizationId IS NOT NULL',
      })
    );

    // Add foreign key for tax_tables
    await queryRunner.createForeignKey(
      'tax_tables',
      new TableForeignKey({
        columnNames: ['organizationId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'organizations',
        onDelete: 'CASCADE',
      })
    );

    // Create indexes for performance
    await queryRunner.createIndex(
      'employees',
      new TableIndex({
        name: 'IDX_employees_org_id',
        columnNames: ['organizationId'],
      })
    );

    await queryRunner.createIndex(
      'employees',
      new TableIndex({
        name: 'IDX_employees_org_active',
        columnNames: ['organizationId', 'isActive'],
      })
    );

    await queryRunner.createIndex(
      'pay_runs',
      new TableIndex({
        name: 'IDX_pay_runs_org_id',
        columnNames: ['organizationId'],
      })
    );

    await queryRunner.createIndex(
      'pay_runs',
      new TableIndex({
        name: 'IDX_pay_runs_org_date',
        columnNames: ['organizationId', 'payDate'],
      })
    );

    await queryRunner.createIndex(
      'pay_run_items',
      new TableIndex({
        name: 'IDX_pay_run_items_run_id',
        columnNames: ['payRunId'],
      })
    );

    await queryRunner.createIndex(
      'pay_run_items',
      new TableIndex({
        name: 'IDX_pay_run_items_employee_id',
        columnNames: ['employeeId'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order (respecting foreign keys)
    await queryRunner.dropTable('tax_tables');
    await queryRunner.dropTable('pay_run_items');
    await queryRunner.dropTable('pay_runs');
    await queryRunner.dropTable('employees');
    await queryRunner.dropTable('organizations');
  }
}
