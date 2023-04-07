import { Entity, Column } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity()
export class Receipt extends BaseEntity {
    @Column()
    owner_id: number;

    @Column()
    attachment: string;

    @Column()
    need_status: number;

    @Column()
    code: string;

    @Column()
    title: string;
    
    @Column()
    description: string;

    @Column({ nullable: true })
    deleted: Date;
}
