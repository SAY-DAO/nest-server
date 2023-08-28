import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { EthereumAccountEntity } from './ethereum.account.entity';
import { NeedEntity } from './need.entity';

@Entity()
export class EthereumTransaction extends BaseEntity {
  @Column({ nullable: true })
  transactionHash: string;

  @Column({ nullable: true })
  transactionStatus: string;

  @Column({ nullable: true })
  createdTimestamp: Date;

  @Column({ nullable: true })
  submittedTimestamp: Date;

  @Column({ nullable: true })
  signedTimestamp: Date;

  @Column({ nullable: true })
  abortedTimestamp: Date;

  @Column({ nullable: true })
  failedTimestamp: Date;

  @Column({ nullable: true })
  minedTimestamp: Date;

  @Column({ nullable: true })
  failureReason: string;

  @Column({ nullable: true })
  to: string;

  @Column({ nullable: true })
  from: string;

  @Column({ nullable: true })
  value: string;

  @Column({ nullable: true })
  data: string;

  @Column({ nullable: true })
  gasUsed: string;

  @Column({ nullable: true })
  fees: string;

  @Column({ nullable: true })
  gasLimit: string;

  @Column({ nullable: true })
  gasPrice?: string;

  @Column({ nullable: true })
  maxPriorityFeePerGas?: string;

  @Column({ nullable: true })
  maxFeePerGas?: string;

  @Column({ nullable: true })
  network: string;

  @Column({ nullable: true })
  nonce: string;

  @Column({ nullable: true })
  signedRawTransaction: string;

  @Column({ nullable: true })
  userId: string

  @Column({ nullable: true })
  needId: string

  @ManyToOne(
    () => EthereumAccountEntity,
    (account) => account.ethereumTransactions,
    {
      eager: true,
    },
  )
  ethereumAccount: EthereumAccountEntity;

  @ManyToOne(() => NeedEntity, (n) => n.ethereumTransactions, {
    eager: false,
  })
  need: NeedEntity;

  @Column({ nullable: true })
  type: string;
}
