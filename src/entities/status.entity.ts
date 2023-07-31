
import { Entity, Column, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { NeedEntity } from './need.entity';

@Entity()
export class StatusEntity extends BaseEntity {
    @Index({ unique: true })
    @Column({ nullable: true })
    flaskId?: number;

    @Column({ nullable: true })
    swId?: number;

    @Column({ nullable: true })
    flaskNeedId?: number;

    @Column({ nullable: true })
    newStatus?: number;

    @Column({ nullable: true })
    oldStatus?: number;

    @ManyToOne(() => NeedEntity, (need) => need.statusUpdates, { eager: false })
    need: NeedEntity;
}