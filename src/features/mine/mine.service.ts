import { Injectable } from '@nestjs/common';
import { CreateMineDto } from '../../types/dtos/mine/create-mine.dto';
import { UpdateMineDto } from '../../types/dtos/mine/update-mine.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NeedEntity } from 'src/entities/need.entity';
import {
  PaymentStatusEnum,
  SAYPlatformRoles,
} from 'src/types/interfaces/interface';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { Payment } from 'src/entities/flaskEntities/payment.entity';
import { SignatureEntity } from 'src/entities/signature.entity';
import { PaymentEntity } from 'src/entities/payment.entity';

@Injectable()
export class MineService {
  constructor(
    @InjectRepository(Need, 'flaskPostgres')
    private flaskNeedRepository: Repository<Need>,
    @InjectRepository(NeedEntity)
    private needRepository: Repository<NeedEntity>,
  ) {}

  create(createMineDto: CreateMineDto) {
    return 'This action adds a new mine';
  }

  getEcosystemPaidNeeds(): Promise<number> {
    return this.flaskNeedRepository
      .createQueryBuilder('need')
      .leftJoinAndMapMany(
        'need.payments',
        Payment,
        'payment',
        'payment.id_need = need.id',
      )
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .andWhere('need.status >= :status', {
        status: PaymentStatusEnum.COMPLETE_PAY,
      })
      .andWhere('payment.id IS NOT NULL')
      .andWhere('payment.verified IS NOT NULL')
      .andWhere('payment.order_id IS NOT NULL')
      .cache(60000)
      .getCount();
  }

  getEcosystemReadyToMine(): Promise<NeedEntity[]> {
    return this.needRepository.find({
      relations: {
        signatures: true,
      },
      where: {
        signatures: {
          role: SAYPlatformRoles.AUDITOR,
        },
      },
    });
  }
  getEcosystemMinedNeeds(): Promise<number> {
    return this.needRepository.count({
      relations: {
        signatures: true,
      },
      where: {
        signatures: {
          role: SAYPlatformRoles.AUDITOR,
        },
        isMined: true,
      },
    });
  }

  getMyReadyToMine(flaskUserId: number): Promise<NeedEntity[]> {
    return this.needRepository
      .createQueryBuilder('need')
      .leftJoinAndMapMany(
        'need.payments',
        PaymentEntity,
        'payment',
        'payment.flaskNeedId = need.flaskId',
      )
      .leftJoinAndMapMany(
        'need.signatures',
        SignatureEntity,
        'signature',
        'signature.flaskNeedId = need.flaskId',
      )
      .andWhere('payment.flaskUserId = :flaskUserId', {
        flaskUserId: flaskUserId,
      })
      .andWhere('need.status >= :status', {
        status: PaymentStatusEnum.COMPLETE_PAY,
      })
      .andWhere('signature.role = :role', {
        role: SAYPlatformRoles.AUDITOR,
      })
      .cache(60000)
      .getMany();
  }

  getMySignedNeeds(flaskUserId: number): Promise<NeedEntity[]> {
    return this.needRepository
      .createQueryBuilder('need')
      .leftJoinAndMapMany(
        'need.verifiedPayments',
        PaymentEntity,
        'payment',
        'payment.flaskNeedId = need.flaskId',
      )
      .leftJoinAndMapMany(
        'need.signatures',
        SignatureEntity,
        'signature',
        'signature.flaskNeedId = need.flaskId',
      )
      .andWhere('signature.flaskUserId = :sFlaskUserId', {
        sFlaskUserId: flaskUserId,
      })
      .andWhere('need.status >= :status', {
        status: PaymentStatusEnum.COMPLETE_PAY,
      })
      .andWhere('signature.role = :role', {
        role: SAYPlatformRoles.FAMILY,
      })
      .cache(60000)
      .getMany();
  }

  getMyMinedNeeds(flaskUserId: number): Promise<number> {
    return this.needRepository
      .createQueryBuilder('need')
      .leftJoinAndMapMany(
        'need.verifiedPayments',
        PaymentEntity,
        'payment',
        'payment.flaskNeedId = need.flaskId',
      )
      .leftJoinAndMapMany(
        'need.signatures',
        SignatureEntity,
        'signature',
        'signature.flaskNeedId = need.flaskId',
      )
      .where('need.isMined = :isMined', { isMined: true })
      .andWhere('payment.flaskUserId = :pFlaskUserId', {
        pFlaskUserId: flaskUserId,
      })
      .andWhere('signature.flaskUserId = :sFlaskUserId', {
        sFlaskUserId: flaskUserId,
      })
      .andWhere('need.status >= :status', {
        status: PaymentStatusEnum.COMPLETE_PAY,
      })
      .andWhere('signature.role = :role', {
        role: SAYPlatformRoles.FAMILY,
      })
      .cache(60000)
      .getCount();
  }
}
