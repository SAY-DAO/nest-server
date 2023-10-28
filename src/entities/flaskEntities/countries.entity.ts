import { Entity, Column } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity()
export class Countries extends BaseEntity {
  @Column()
  phone_code: string;

  @Column()
  name: string;

  @Column()
  capital: string;

  @Column()
  currency: string;

  @Column()
  currency_name: string;

  @Column()
  currency_symbol: string;

  @Column()
  tld: string;

  @Column()
  region: string;

  @Column()
  subregion: string;

  @Column()
  timezones: string;

  @Column()
  translations: string;

  @Column()
  latitude: string;

  @Column()
  longitude: string;
}
