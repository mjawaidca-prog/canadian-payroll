import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Employee } from './Employee';
import { PayRun } from './PayRun';
import { TaxTable } from './TaxTable';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuid();

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 2 })
  province: string; // ON, BC, AB, etc.

  @Column({ type: 'varchar', length: 20, nullable: true })
  businessNumber: string; // CRA Business Number

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 2, nullable: true })
  postalCode: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactEmail: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  contactPhone: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Employee, (employee) => employee.organization)
  employees: Employee[];

  @OneToMany(() => PayRun, (payRun) => payRun.organization)
  payRuns: PayRun[];

  @OneToMany(() => TaxTable, (taxTable) => taxTable.organization)
  taxTables: TaxTable[];
}
