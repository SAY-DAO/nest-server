import {
    Entity,
    Column,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import { NeedEntity } from './need.entity';
import { BaseEntity } from './BaseEntity';

@Entity()
export class IpfsNeedEntity extends BaseEntity {
    @Column('text', { array: true })
    receiptHashes: string[];

    @Column()
    iconHash: string;
}

@Entity()
export class IpfsChildEntity extends BaseEntity {
    @Column()
    awakeAvatarHash: string;

    @Column()
    sleptAvatarHash: string;

    @Column()
    adultAvatarHash: string;
}

@Entity()
export class IpfsEntity extends BaseEntity {
    @OneToOne(() => IpfsChildEntity, { eager: true })
    @JoinColumn()
    childImages: IpfsChildEntity;

    @OneToOne(() => IpfsNeedEntity, { eager: true })
    @JoinColumn()
    needImages: IpfsNeedEntity;

    @OneToOne(() => NeedEntity, (need) => need.ipfs)
    @JoinColumn()
    need: NeedEntity;
}
