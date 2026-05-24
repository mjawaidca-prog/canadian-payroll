import { DataSource, Repository } from 'typeorm';
import { Employee, PayRunItem } from '../../../database/entities';
import { NotFoundError } from '../../../common/errors/AppError';

export enum ROEReasonCode {
  QUIT = 'A', // Employee quit
  DISMISSED = 'B', // Dismissed
  LAID_OFF = 'C', // Laid off - no recall
  TEMPORARY = 'D', // Laid off - with recall
  HOURS_REDUCED = 'E', // Hours of work reduced to zero
  ILLNESS = 'F', // Illness or injury
  MATERNITY = 'G', // Maternity/parental leave
  RETIREMENT = 'H', // Retirement
  SUCCESSION = 'I', // Succession planning
  BANKRUPTCY = 'J', // Business closure or bankruptcy
}

export interface ROERecord {
  employeeId: string;
  firstName: string;
  lastName: string;
  sin: string;
  address: string;
  phone: string;
  email: string;

  // Employment Details
  hireDate: Date;
  terminationDate: Date;
  reasonCode: ROEReasonCode;
  insurable: boolean;

  // Last Pay Period
  lastPayDate: Date;
  lastPayAmount: number;

  // Accumulated Values
  ytdInsurableEarnings: number;
  ytdVacationPaid: number;
  ytdEIPremiums: number;
  ytdCPPContributions: number;
  ytdIncomeTax: number;

  // ROE Meta
  issuedDate: Date;
  claimCode: string;
}

export class ROEService {
  private employeeRepository: Repository<Employee>;
  private payRunItemRepository: Repository<PayRunItem>;

  constructor(dataSource: DataSource) {
    this.employeeRepository = dataSource.getRepository(Employee);
    this.payRunItemRepository = dataSource.getRepository(PayRunItem);
  }

  /**
   * Generate ROE for terminated employee
   */
  async generateROE(employeeId: string): Promise<ROERecord> {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundError('Employee', employeeId);
    }

    if (!employee.terminationDate) {
      throw new Error('Employee has not been terminated');
    }

    // Get all pay run items for the tax year
    const taxYear = employee.terminationDate.getFullYear();
    const payRunItems = await this.payRunItemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.payRun', 'payRun')
      .where('item.employeeId = :employeeId', { employeeId })
      .andWhere('EXTRACT(YEAR FROM payRun.payDate) = :taxYear', { taxYear })
      .orderBy('payRun.payDate', 'DESC')
      .getMany();

    if (payRunItems.length === 0) {
      throw new Error('No pay run items found for this employee in termination year');
    }

    // Get last pay period info
    const lastPayRun = payRunItems[0];

    // Calculate accumulated values
    const ytdInsurableEarnings = payRunItems.reduce((sum, item) => sum + item.grossAmount, 0);
    const ytdEIPremiums = payRunItems.reduce((sum, item) => sum + item.eiContribution, 0);
    const ytdCPPContributions = payRunItems.reduce((sum, item) => sum + item.cppContribution, 0);
    const ytdIncomeTax =
      payRunItems.reduce((sum, item) => sum + item.federalTaxWithheld, 0) +
      payRunItems.reduce((sum, item) => sum + item.provincialTaxWithheld, 0);

    return {
      employeeId: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      sin: employee.sin,
      address: employee.address || '',
      phone: employee.phone || '',
      email: employee.email || '',

      hireDate: employee.hireDate,
      terminationDate: employee.terminationDate,
      reasonCode: ROEReasonCode.DISMISSED, // Default - should be set by user
      insurable: true,

      lastPayDate: lastPayRun.payRun.payDate,
      lastPayAmount: lastPayRun.grossAmount,

      ytdInsurableEarnings,
      ytdVacationPaid: 0, // Should be accumulated
      ytdEIPremiums,
      ytdCPPContributions,
      ytdIncomeTax,

      issuedDate: new Date(),
      claimCode: this.generateClaimCode(),
    };
  }

  /**
   * Generate CRA-compliant ROE XML
   */
  generateCRAXML(roe: ROERecord): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<RecordOfEmployment>\n';
    xml += '  <Employee>\n';
    xml += `    <FirstName>${roe.firstName}</FirstName>\n`;
    xml += `    <LastName>${roe.lastName}</LastName>\n`;
    xml += `    <SIN>${roe.sin}</SIN>\n`;
    xml += `    <Address>${roe.address}</Address>\n`;
    xml += `    <Phone>${roe.phone}</Phone>\n`;
    xml += `    <Email>${roe.email}</Email>\n`;
    xml += '  </Employee>\n';
    xml += '  <Employment>\n';
    xml += `    <HireDate>${roe.hireDate.toISOString().split('T')[0]}</HireDate>\n`;
    xml += `    <TerminationDate>${roe.terminationDate.toISOString().split('T')[0]}</TerminationDate>\n`;
    xml += `    <ReasonCode>${roe.reasonCode}</ReasonCode>\n`;
    xml += `    <Insurable>${roe.insurable ? 'Y' : 'N'}</Insurable>\n`;
    xml += '  </Employment>\n';
    xml += '  <LastPayPeriod>\n';
    xml += `    <PayDate>${roe.lastPayDate.toISOString().split('T')[0]}</PayDate>\n`;
    xml += `    <Amount>${roe.lastPayAmount.toFixed(2)}</Amount>\n`;
    xml += '  </LastPayPeriod>\n';
    xml += '  <YearToDate>\n';
    xml += `    <InsurableEarnings>${roe.ytdInsurableEarnings.toFixed(2)}</InsurableEarnings>\n`;
    xml += `    <VacationPaid>${roe.ytdVacationPaid.toFixed(2)}</VacationPaid>\n`;
    xml += `    <EIPremiums>${roe.ytdEIPremiums.toFixed(2)}</EIPremiums>\n`;
    xml += `    <CPPContributions>${roe.ytdCPPContributions.toFixed(2)}</CPPContributions>\n`;
    xml += `    <IncomeTax>${roe.ytdIncomeTax.toFixed(2)}</IncomeTax>\n`;
    xml += '  </YearToDate>\n';
    xml += '  <ClaimCode>\n';
    xml += `    <Code>${roe.claimCode}</Code>\n`;
    xml += `    <IssuedDate>${roe.issuedDate.toISOString().split('T')[0]}</IssuedDate>\n`;
    xml += '  </ClaimCode>\n';
    xml += '</RecordOfEmployment>\n';

    return xml;
  }

  /**
   * Generate unique claim code for tracking
   */
  private generateClaimCode(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ROE-${timestamp}-${random}`;
  }
}
