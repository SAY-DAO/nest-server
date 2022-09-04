import {
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Column,
    OneToOne,
    JoinColumn,
    ManyToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ChildrenEntity } from './children.entity';
import { NeedEntity } from './need.entity';
import { MileStoneEntity } from './milestone.entity';


export class EpicEntity {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @Column({ type: 'timestamptz' })
    dueDate: Date;

    @Column()
    title: string;

    @Column()
    description: string;

    @OneToOne(() => ChildrenEntity)
    @JoinColumn()
    need: NeedEntity

    @ManyToOne(() => MileStoneEntity, (ms) => ms.id)
    mileStone: MileStoneEntity
}