import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Organization } from './Organization';

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export interface CPPParameters {
  rate: number;
  maxContribution: number;
  basicExemption: number;
  maxEarnings: number;
  year: number;
}

export interface EIParameters {
  rate: number;
  maxContribution: number;
  maxEarnings: number;
  year: number;
}

@Entity('tax_tables')
@Index(['organizationId', 'taxYear', 'province'], { unique: true })
export class TaxTable {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuid();

  @Column({ type: 'uuid', nullable: true })
  organizationId: string;

  @Column({ type: 'integer' })
  taxYear: number;

  @Column({ type: 'varchar', length: 2 })
  province: string; // ON, BC, AB, etc. or 'FED' for federal

  @Column({ type: 'jsonb' })
  federalBrackets: TaxBracket[];

  @Column({ type: 'jsonb', nullable: true })
  provincialBrackets: TaxBracket[];

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  basicPersonalAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  provincialBasicPersonalAmount: number;

  @Column({ type: 'jsonb' })
  cppParameters: CPPParameters;

  @Column({ type: 'jsonb' })
  eiParameters: EIParameters;

  @Column({ type: 'varchar', length: 255, nullable: true })
  source: string; // CRA, Provincial Authority, etc.

  @Column({ type: 'varchar', length: 1, default: 'A' })
  version: string; // A, B, C, etc. for tracking updates

  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Organization, (org) => org.taxTables, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;
}
