import { Entity, Column, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { NeedEntity } from './need.entity';
import { SocialWorkerEntity } from './user.entity';

@Entity()
export class ReceiptEntity extends BaseEntity {
    @Index({ unique: true })
    @Column()
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
    isPublic: boolean;

    @Column({ nullable: true })
    deleted: boolean;

    @ManyToOne(() => NeedEntity, (need) => need.receipts, { eager: false })
    need: NeedEntity;

    // @ManyToOne(() => SocialWorkerEntity, (s) => s.receipts, { eager: true })
    // socialWorker: SocialWorkerEntity;
}
