import {
    Entity,
    Column,
    OneToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { NeedEntity } from './need.entity';
import { BaseEntity } from './BaseEntity';
import { SignatureEntity } from './signature.entity';


@Entity()
export class IpfsEntity extends BaseEntity {
    @Column()
    flaskNeedId: number;

    @Column({ nullable: false })
    needDetailsHash: string;

    @Column({ nullable: true })
    receiptsHash: string;

    @Column({ nullable: true })
    paymentsHash: string;

    @OneToMany(() => SignatureEntity, (signature) => signature.ipfs, { eager: true })
    signatures?: SignatureEntity[];

    @OneToOne(() => NeedEntity, (need) => need.ipfs, { eager: false })
    @JoinColumn()
    need: NeedEntity;
}
