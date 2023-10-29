import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { NgoEntity } from './ngo.entity';
import { ChildrenPreRegisterEntity } from './childrenPreRegister.entity';

@Entity()
export class LocationEntity extends BaseEntity {
  @Column()
  flaskCityId: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  stateId: number;

  @Column({ nullable: true })
  stateCode: string;

  @Column({ nullable: true })
  stateName: string;

  @Column({ nullable: true })
  countryId: number;

  @Column({ nullable: true })
  countryCode: string;

  @Column({ nullable: true })
  countryName: string;

  @Column({ nullable: true })
  latitude: string;

  @Column({ nullable: true })
  longitude: string;

  @OneToMany(() => NgoEntity, (n) => n.location, { eager: false })
  ngos?: NgoEntity[];

  @OneToMany(() => NgoEntity, (n) => n.location, { eager: false })
  preRegisters?: NgoEntity[];

  @OneToMany(() => ChildrenPreRegisterEntity, (c) => c.location, {
    eager: false,
  })
  children: ChildrenPreRegisterEntity[];
}
