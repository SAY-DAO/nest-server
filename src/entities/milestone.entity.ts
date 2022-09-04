import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Column,
    OneToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ChildrenEntity } from './children.entity';
import { EpicEntity } from './epic.entity';

@Entity()
export class MileStoneEntity {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @Column()
    signature: string;

    @OneToOne(() => ChildrenEntity)
    @JoinColumn()
    child: ChildrenEntity

    @OneToMany(() => EpicEntity, (epic) => epic.id)
    epics: EpicEntity[]

}
