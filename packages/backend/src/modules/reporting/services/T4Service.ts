import { DataSource, Repository } from 'typeorm';
import { Employee, PayRunItem } from '../../../database/entities';
import { NotFoundError } from '../../../common/errors/AppError';

export interface T4Record {
  employeeId: string;
  firstName: string;
  lastName: string;
  sin: string;
  taxYear: number;

  // T4 Boxes
  box14: number; // Employment income
  box16: number; // EI insurable earnings
  box18: number; // CPP pensionable earnings
  box20: number; // Income tax deducted
  box23: number; // EI premiums deducted
  box26: number; // CPP contributions deducted
  box52: string; // Employment location (province)
}

export class T4Service {
  private payRunItemRepository: Repository<PayRunItem>;
  private employeeRepository: Repository<Employee>;

  constructor(dataSource: DataSource) {
    this.payRunItemRepository = dataSource.getRepository(PayRunItem);
    this.employeeRepository = dataSource.getRepository(Employee);
  }

  /**
   * Generate T4 records for a specific tax year
   */
  async generateT4Records(organizationId: string, taxYear: number): Promise<T4Record[]> {
    // Get all employees for the organization
    const employees = await this.employeeRepository.find({
      where: { organizationId },
    });

    if (employees.length === 0) {
      throw new NotFoundError('Employees', 'No employees found');
    }

    const t4Records: T4Record[] = [];

    // For each employee, aggregate their pay run items for the tax year
    for (const employee of employees) {
      const payRunItems = await this.payRunItemRepository
        .createQueryBuilder('item')
        .leftJoinAndSelect('item.payRun', 'payRun')
        .where('item.employeeId = :employeeId', { employeeId: employee.id })
        .andWhere('EXTRACT(YEAR FROM payRun.payDate) = :taxYear', { taxYear })
        .getMany();

      if (payRunItems.length === 0) {
        continue; // Skip if no pay runs in this tax year
      }

      // Sum up the values
      const t4Record: T4Record = {
        employeeId: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        sin: employee.sin,
        taxYear,
        box14: payRunItems.reduce((sum, item) => sum + item.grossAmount, 0), // Employment income
        box16: payRunItems.reduce((sum, item) => sum + item.grossAmount, 0), // EI insurable (same as gross for simplicity)
        box18: payRunItems.reduce((sum, item) => sum + (item.grossAmount - 3500), 0), // CPP pensionable (gross - exemption)
        box20: payRunItems.reduce((sum, item) => sum + item.federalTaxWithheld, 0), // Federal tax
        box23: payRunItems.reduce((sum, item) => sum + item.eiContribution, 0), // EI premiums
        box26: payRunItems.reduce((sum, item) => sum + item.cppContribution, 0), // CPP contributions
        box52: employee.province || 'ON', // Province
      };

      t4Records.push(t4Record);
    }

    return t4Records;
  }

  /**
   * Generate T4 Summary (for CRA filing)
   */
  async generateT4Summary(
    organizationId: string,
    taxYear: number,
    businessNumber: string
  ) {
    const t4Records = await this.generateT4Records(organizationId, taxYear);

    // Group by province for T4 Summary
    const summaryByProvince: { [key: string]: any } = {};

    for (const record of t4Records) {
      const province = record.box52;
      if (!summaryByProvince[province]) {
        summaryByProvince[province] = {
          province,
          employeeCount: 0,
          totalBox14: 0,
          totalBox20: 0,
          totalBox23: 0,
          totalBox26: 0,
        };
      }

      summaryByProvince[province].employeeCount += 1;
      summaryByProvince[province].totalBox14 += record.box14;
      summaryByProvince[province].totalBox20 += record.box20;
      summaryByProvince[province].totalBox23 += record.box23;
      summaryByProvince[province].totalBox26 += record.box26;
    }

    return {
      taxYear,
      businessNumber,
      filingDate: new Date(),
      provinces: Object.values(summaryByProvince),
      totalRecords: t4Records.length,
    };
  }

  /**
   * Validate T4 records against CRA requirements
   */
  validateT4Records(records: T4Record[]): string[] {
    const errors: string[] = [];

    for (const record of records) {
      // Box 14 must equal Box 16 + Box 18 (simplified check)
      if (record.box14 <= 0) {
        errors.push(`Employee ${record.firstName} ${record.lastName}: Box 14 (employment income) must be > 0`);
      }

      // Box 20 (federal tax) must not exceed a reasonable percentage
      const taxPercentage = (record.box20 / record.box14) * 100;
      if (taxPercentage > 50) {
        errors.push(
          `Employee ${record.firstName} ${record.lastName}: Federal tax (${taxPercentage.toFixed(1)}%) seems too high`
        );
      }

      // SIN validation (simplified)
      if (!/^\d{3}-\d{3}-\d{3}$/.test(record.sin.replace(/[^\d]/g, '')) && !/^\d{9}$/.test(record.sin)) {
        errors.push(`Employee ${record.firstName} ${record.lastName}: Invalid SIN format`);
      }

      // Box 26 must not exceed max CPP
      if (record.box26 > 3867.5) {
        errors.push(
          `Employee ${record.firstName} ${record.lastName}: CPP contribution (${record.box26}) exceeds maximum (3867.50)`
        );
      }

      // Box 23 must not exceed max EI
      if (record.box23 > 1049.12) {
        errors.push(
          `Employee ${record.firstName} ${record.lastName}: EI premium (${record.box23}) exceeds maximum (1049.12)`
        );
      }
    }

    return errors;
  }

  /**
   * Export T4 records as CRA XML format (simplified)
   */
  generateCRAXML(records: T4Record[], businessNumber: string): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<T4Submission>\n';
    xml += `  <BusinessNumber>${businessNumber}</BusinessNumber>\n`;
    xml += `  <TaxYear>${records[0]?.taxYear || new Date().getFullYear()}</TaxYear>\n`;
    xml += '  <Records>\n';

    for (const record of records) {
      xml += '    <T4>\n';
      xml += `      <EmployeeName>${record.firstName} ${record.lastName}</EmployeeName>\n`;
      xml += `      <SIN>${record.sin}</SIN>\n`;
      xml += `      <Box14>${record.box14.toFixed(2)}</Box14>\n`;
      xml += `      <Box16>${record.box16.toFixed(2)}</Box16>\n`;
      xml += `      <Box18>${record.box18.toFixed(2)}</Box18>\n`;
      xml += `      <Box20>${record.box20.toFixed(2)}</Box20>\n`;
      xml += `      <Box23>${record.box23.toFixed(2)}</Box23>\n`;
      xml += `      <Box26>${record.box26.toFixed(2)}</Box26>\n`;
      xml += `      <Province>${record.box52}</Province>\n`;
      xml += '    </T4>\n';
    }

    xml += '  </Records>\n';
    xml += '</T4Submission>\n';

    return xml;
  }
}
