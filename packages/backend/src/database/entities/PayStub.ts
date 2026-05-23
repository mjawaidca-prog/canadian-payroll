import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { PayRunItem } from './PayRunItem';

@Entity('pay_stubs')
export class PayStub {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuid();

  @Column({ type: 'uuid' })
  payRunItemId: string;

  @Column({ type: 'bytea' })
  pdfBlob: Buffer; // PDF file as binary

  @Column({ type: 'varchar', length: 255 })
  fileName: string; // e.g., "PayStub_JohnDoe_2024_01_15.pdf"

  @Column({ type: 'integer' })
  fileSize: number; // Size in bytes

  @Column({ type: 'boolean', default: false })
  sentToEmployee: boolean;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sentToEmail: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  archivedAt: Date;

  @ManyToOne(() => PayRunItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payRunItemId' })
  payRunItem: PayRunItem;
}
