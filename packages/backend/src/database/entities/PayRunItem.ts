import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { PayRun } from './PayRun';
import { Employee } from './Employee';

@Entity('pay_run_items')
export class PayRunItem {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuid();

  @Column({ type: 'uuid' })
  payRunId: string;

  @Column({ type: 'uuid' })
  employeeId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  grossAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  cppContribution: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  eiContribution: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  federalTaxWithheld: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  provincialTaxWithheld: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  otherDeductions: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  netAmount: number;

  // Year-to-date accumulators (for tax calculations)
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  ytdGross: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  ytdCPP: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  ytdEI: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  ytdFederalTax: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  ytdProvincialTax: number;

  @Column({ type: 'text', nullable: true })
  calculationNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  payStubGeneratedAt: Date;

  @ManyToOne(() => PayRun, (payRun) => payRun.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payRunId' })
  payRun: PayRun;

  @ManyToOne(() => Employee, (employee) => employee.payRunItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;
}
