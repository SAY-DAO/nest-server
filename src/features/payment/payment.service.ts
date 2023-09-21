import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, UpdateResult } from 'typeorm';
import { PaymentEntity } from '../../entities/payment.entity';
import { PaymentParams } from '../../types/parameters/PaymentParameters';
import { AllUserEntity } from '../../entities/user.entity';
import { Payment } from 'src/entities/flaskEntities/payment.entity';
import { Need } from 'src/entities/flaskEntities/need.entity';
import {
  NeedTypeEnum,
  ProductStatusEnum,
  SAY_DAPP_ID,
  ServiceStatusEnum,
} from 'src/types/interfaces/interface';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment, 'flaskPostgres')
    private flaskPaymentRepository: Repository<Payment>,
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,
  ) {}

  getPayments(): Promise<PaymentEntity[]> {
    return this.paymentRepository.find();
  }

  getUserPayments(flaskUserId: number): Promise<PaymentEntity[]> {
    return this.paymentRepository.find({
      where: {
        flaskUserId,
      },
    });
  }
  getPaymentById(flaskId: number): Promise<PaymentEntity> {
    const user = this.paymentRepository.findOne({
      where: {
        flaskId: flaskId,
      },
    });
    return user;
  }

  getNeedPayments(flaskNeedId: number): Promise<PaymentEntity[]> {
    const user = this.paymentRepository.find({
      where: {
        flaskNeedId: flaskNeedId,
      },
    });
    return user;
  }

  getFlaskNeedPayments(flaskNeedId: number): Promise<Payment[]> {
    const user = this.flaskPaymentRepository.find({
      where: {
        id_need: flaskNeedId,
      },
    });
    return user;
  }

  createPayment(
    paymentDetails: PaymentParams,
    familyMember: AllUserEntity,
  ): Promise<PaymentEntity> {
    const newPayment = this.paymentRepository.create({
      ...paymentDetails,
      familyMember: familyMember,
    });
    return this.paymentRepository.save({ id: newPayment.id, ...newPayment });
  }

  updatePayment(
    paymentId: string,
    paymentDetails: PaymentParams,
    familyMember: AllUserEntity,
  ): Promise<UpdateResult> {
    return this.paymentRepository.update(paymentId, {
      ...paymentDetails,
      familyMember: familyMember,
    });
  }

  async getPaymentsInRange(
    paymentDate: Date,
    needCategory: number,
    needType: number,
    month: number,
  ): Promise<[Payment[], number]> {
    const d = new Date(paymentDate);
    d.setMonth(d.getMonth() - month); // 1 months ago

    const d2 = new Date(paymentDate);
    d2.setMonth(d2.getMonth() + month); // 1 months after

    return await this.flaskPaymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndMapOne(
        'payment.need',
        Need,
        'need',
        'need.id = payment.id_need',
      )
      .where(
        new Brackets((qb) => {
          qb.where('need.type = :typeProduct', {
            typeProduct: NeedTypeEnum.PRODUCT,
          })
            .andWhere('need.status = :productStatus', {
              productStatus: ProductStatusEnum.DELIVERED,
            })
            .orWhere('need.type = :typeService', {
              typeService: NeedTypeEnum.SERVICE,
            })
            .andWhere('need.status = :serviceStatus', {
              serviceStatus: ServiceStatusEnum.DELIVERED,
            });
        }),
      )
      .andWhere('need.category = :needCategory', { needCategory })
      .andWhere('need.type = :needType', { needType })
      .andWhere('payment.created > :startDate', {
        startDate: new Date(d),
      })
      .andWhere('payment.created <= :endDate', {
        endDate: new Date(d2),
      })
      .andWhere('payment.need_amount > :amount', { amount: 0 }) // only positive amounts
      .andWhere('payment.id_user != :sayId', { sayId: SAY_DAPP_ID }) // only positive amounts

      .andWhere('payment.id_need IS NOT NULL')
      .andWhere('payment.id IS NOT NULL')
      .andWhere('payment.verified IS NOT NULL')
      .select(['payment', 'need'])
      .getManyAndCount();
  }
}
