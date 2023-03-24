import { Entity, Column, OneToMany, OneToOne } from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { EthereumTransaction } from './ethereum.transaction.entity'
import { AllUserEntity } from './user.entity'

@Entity()
export class EthereumAccountEntity extends BaseEntity {
  @Column()
  address: string

  @Column({ nullable: true })
  chainId: number

  @OneToMany(() => EthereumTransaction, (tx) => tx.ethereumAccount)
  ethereumTransactions: EthereumTransaction

  @OneToOne(() => AllUserEntity, (user) => user.wallet, { eager: false })
  user: AllUserEntity;
}
