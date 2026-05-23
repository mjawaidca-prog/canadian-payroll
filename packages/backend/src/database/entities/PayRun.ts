import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Organization } from './Organization';
import { PayRunItem } from './PayRunItem';

export enum PayRunStatus {
  DRAFT = 'draft',
  CALCULATED = 'calculated',
  FINALIZED = 'finalized',
  PROCESSED = 'processed',
  CANCELLED = 'cancelled',
}

export enum PayFrequency {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  SEMI_MONTHLY = 'semi_monthly',
  MONTHLY = 'monthly',
}

@Entity('pay_runs')
export class PayRun {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuid();

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'date' })
  payPeriodStart: Date;

  @Column({ type: 'date' })
  payPeriodEnd: Date;

  @Column({ type: 'date' })
  payDate: Date;

  @Column({ type: 'enum', enum: PayFrequency, default: PayFrequency.BIWEEKLY })
  frequency: PayFrequency;

  @Column({ type: 'enum', enum: PayRunStatus, default: PayRunStatus.DRAFT })
  status: PayRunStatus;

  @Column({ type: 'integer' })
  runNumber: number; // Sequential payroll check number

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalGross: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalCPP: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalEI: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalFederalTax: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalProvincialTax: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalDeductions: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalNetPay: number;

  @Column({ type: 'integer', default: 0 })
  employeeCount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  processedBy: string;

  @ManyToOne(() => Organization, (org) => org.payRuns, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @OneToMany(() => PayRunItem, (item) => item.payRun, { cascade: true })
  items: PayRunItem[];
}
