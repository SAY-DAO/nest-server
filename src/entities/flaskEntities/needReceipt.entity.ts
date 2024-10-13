import { Entity, Column } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity({name: 'need_receipt'})
export class NeedReceipt extends BaseEntity {
    @Column()
    need_id: number;

    @Column()
    sw_id: number;

    @Column()
    receipt_id: number;

    @Column({ nullable: true })
    deleted: Date;
}
