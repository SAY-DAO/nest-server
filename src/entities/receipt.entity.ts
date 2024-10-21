import { Entity, Column, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { NeedEntity } from './need.entity';

@Entity()
export class ReceiptEntity extends BaseEntity {
    @Index({ unique: true })
    @Column({ nullable: true })
    flaskReceiptId: number;

    @Column()
    flaskNeedId: number;

    @Column()
    flaskSwId: number;

    @Column()
    attachment: string;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    code: string;

    @Column({ nullable: true })
    needStatus: number;

    @Column({ nullable: true })
    deleted: Date;

    @ManyToOne(() => NeedEntity, (need) => need.receipts, { eager: false })
    need: NeedEntity;
}
