import { DataSource, Repository } from 'typeorm';
import PDFDocument from 'pdfkit';
import { PayStub } from '../../../database/entities/PayStub';
import { PayRunItem, Employee, Organization, PayRun } from '../../../database/entities';
import { NotFoundError } from '../../../common/errors/AppError';

export interface PayStubGenerationInput {
  payRunItemId: string;
  organizationId: string;
}

export class PayStubService {
  private payStubRepository: Repository<PayStub>;
  private payRunItemRepository: Repository<PayRunItem>;

  constructor(dataSource: DataSource) {
    this.payStubRepository = dataSource.getRepository(PayStub);
    this.payRunItemRepository = dataSource.getRepository(PayRunItem);
  }

  async generatePayStub(input: PayStubGenerationInput): Promise<PayStub> {
    // Fetch pay run item with relations
    const payRunItem = await this.payRunItemRepository.findOne({
      where: { id: input.payRunItemId },
      relations: ['employee', 'payRun', 'payRun.organization'],
    });

    if (!payRunItem) {
      throw new NotFoundError('PayRunItem', input.payRunItemId);
    }

    if (payRunItem.payRun.organizationId !== input.organizationId) {
      throw new Error('PayRunItem does not belong to this organization');
    }

    // Generate PDF
    const pdfBuffer = await this.generatePDF(payRunItem);

    // Create filename
    const employee = payRunItem.employee;
    const payDate = payRunItem.payRun.payDate;
    const fileName = `PayStub_${employee.lastName}_${employee.firstName}_${payDate.getFullYear()}_${String(payDate.getMonth() + 1).padStart(2, '0')}_${String(payDate.getDate()).padStart(2, '0')}.pdf`;

    // Save to database
    const payStub = this.payStubRepository.create({
      payRunItemId: input.payRunItemId,
      pdfBlob: pdfBuffer,
      fileName,
      fileSize: pdfBuffer.length,
    });

    return this.payStubRepository.save(payStub);
  }

  private async generatePDF(payRunItem: PayRunItem): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: {
          top: 40,
          bottom: 40,
          left: 50,
          right: 50,
        },
      });

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      this.renderPayStubContent(doc, payRunItem);

      doc.end();
    });
  }

  private renderPayStubContent(doc: PDFDocument, payRunItem: PayRunItem): void {
    const employee = payRunItem.employee;
    const payRun = payRunItem.payRun;
    const organization = payRun.organization;

    // Header with company info
    doc.fontSize(16).font('Helvetica-Bold').text('PAY STUB', { align: 'center' });
    doc.moveDown(0.3);

    // Company section
    doc.fontSize(11).font('Helvetica-Bold').text(organization.name || 'Organization');
    doc.fontSize(9).font('Helvetica').text(organization.businessNumber || '');
    doc.text(organization.address || '');
    doc.text(`${organization.city || ''}, ${organization.province || ''}`);

    doc.moveDown(0.5);

    // Pay period info
    doc.fontSize(10).font('Helvetica-Bold').text('PAY PERIOD INFORMATION', { underline: true });
    doc.fontSize(9).font('Helvetica');
    doc.text(`Pay Period Start: ${payRun.payPeriodStart.toDateString()}`);
    doc.text(`Pay Period End: ${payRun.payPeriodEnd.toDateString()}`);
    doc.text(`Pay Date: ${payRun.payDate.toDateString()}`);
    doc.text(`Pay Run #: ${payRun.runNumber}`);

    doc.moveDown(0.5);

    // Employee section
    doc.fontSize(10).font('Helvetica-Bold').text('EMPLOYEE INFORMATION', { underline: true });
    doc.fontSize(9).font('Helvetica');
    doc.text(`Name: ${employee.fullName}`);
    doc.text(`SIN: ${this.maskSIN(employee.sin)}`);
    doc.text(`Address: ${employee.address || 'N/A'}`);
    doc.text(`Province: ${employee.province || 'N/A'}`);
    doc.text(`Employment Type: ${employee.employmentType}`);

    doc.moveDown(0.5);

    // Earnings and Deductions table
    doc.fontSize(10).font('Helvetica-Bold').text('EARNINGS & DEDUCTIONS', { underline: true });
    doc.fontSize(9).font('Helvetica');

    const startX = 50;
    const descriptionWidth = 200;
    const amountWidth = 100;
    const ytdWidth = 100;

    // Table header
    doc.font('Helvetica-Bold');
    doc.text('Description', startX, doc.y, { width: descriptionWidth });
    doc.text('Amount', startX + descriptionWidth, doc.y - 13, { width: amountWidth, align: 'right' });
    doc.text('YTD', startX + descriptionWidth + amountWidth, doc.y - 13, { width: ytdWidth, align: 'right' });

    doc.moveTo(startX, doc.y + 5).lineTo(startX + descriptionWidth + amountWidth + ytdWidth, doc.y + 5).stroke();
    doc.moveDown(0.3);

    // Table rows
    doc.font('Helvetica');

    const rows = [
      { label: 'Gross Salary', amount: payRunItem.grossAmount, ytd: payRunItem.ytdGross },
      { label: '', amount: null, ytd: null }, // Empty row
      { label: 'CPP Contribution', amount: payRunItem.cppContribution, ytd: payRunItem.ytdCPP },
      { label: 'EI Premium', amount: payRunItem.eiContribution, ytd: payRunItem.ytdEI },
      { label: 'Federal Tax', amount: payRunItem.federalTaxWithheld, ytd: payRunItem.ytdFederalTax },
      { label: 'Provincial Tax', amount: payRunItem.provincialTaxWithheld, ytd: payRunItem.ytdProvincialTax },
      { label: 'Other Deductions', amount: payRunItem.otherDeductions, ytd: 0 },
      { label: '', amount: null, ytd: null }, // Empty row
    ];

    for (const row of rows) {
      if (row.amount === null) {
        doc.moveDown(0.2);
        continue;
      }

      doc.text(row.label, startX, doc.y, { width: descriptionWidth });

      if (row.amount !== null) {
        doc.text(`$${row.amount.toFixed(2)}`, startX + descriptionWidth, doc.y - 13, {
          width: amountWidth,
          align: 'right',
        });
      }

      if (row.ytd !== null) {
        doc.text(`$${row.ytd.toFixed(2)}`, startX + descriptionWidth + amountWidth, doc.y - 13, {
          width: ytdWidth,
          align: 'right',
        });
      }

      doc.moveDown(0.3);
    }

    // Totals section
    doc.moveTo(startX, doc.y).lineTo(startX + descriptionWidth + amountWidth + ytdWidth, doc.y).stroke();
    doc.moveDown(0.2);

    doc.font('Helvetica-Bold');
    doc.text('TOTAL DEDUCTIONS', startX, doc.y, { width: descriptionWidth });
    doc.text(
      `$${(payRunItem.cppContribution + payRunItem.eiContribution + payRunItem.federalTaxWithheld + payRunItem.provincialTaxWithheld + payRunItem.otherDeductions).toFixed(2)}`,
      startX + descriptionWidth,
      doc.y,
      { width: amountWidth, align: 'right' }
    );
    doc.moveDown(0.3);

    doc.fontSize(12);
    doc.text('NET PAY', startX, doc.y, { width: descriptionWidth });
    doc.text(`$${payRunItem.netAmount.toFixed(2)}`, startX + descriptionWidth, doc.y, {
      width: amountWidth,
      align: 'right',
    });

    doc.moveDown(0.5);

    // Footer
    doc.fontSize(7).font('Helvetica');
    doc.text('This pay stub is provided in accordance with applicable employment standards legislation.', {
      align: 'center',
    });
    doc.text('Keep this pay stub for your records.', { align: 'center' });
    doc.text(`Generated: ${new Date().toISOString()}`, { align: 'center' });
  }

  private maskSIN(sin: string): string {
    return `***-***-${sin.slice(-4)}`;
  }

  async getPayStub(id: string): Promise<PayStub> {
    const payStub = await this.payStubRepository.findOne({ where: { id } });
    if (!payStub) {
      throw new NotFoundError('PayStub', id);
    }
    return payStub;
  }

  async getPayStubsByPayRun(payRunId: string): Promise<PayStub[]> {
    return this.payStubRepository.find({
      where: {
        payRunItem: {
          payRunId,
        },
      },
      relations: ['payRunItem'],
    });
  }

  async markAsSent(id: string, email: string): Promise<PayStub> {
    const payStub = await this.getPayStub(id);
    payStub.sentToEmployee = true;
    payStub.sentAt = new Date();
    payStub.sentToEmail = email;
    return this.payStubRepository.save(payStub);
  }
}
