import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CityEntity } from 'src/entities/city.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { NGO } from 'src/entities/flaskEntities/ngo.entity';
import { NgoEntity } from 'src/entities/ngo.entity';
import {
  NeedTypeEnum,
  ProductStatusEnum,
} from 'src/types/interfaces/interface';
import { NgoParams } from 'src/types/parameters/NgoParammeters';
import { Brackets, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class NgoService {
  constructor(
    @InjectRepository(NgoEntity)
    private ngoRepository: Repository<NgoEntity>,
    @InjectRepository(NGO, 'flaskPostgres')
    private ngoFlaskRepository: Repository<NGO>,
    @InjectRepository(Need, 'flaskPostgres')
    private needFlaskRepository: Repository<Need>,
  ) { }

  getNgos(): Promise<NgoEntity[]> {
    return this.ngoRepository.find();
  }

  async getNgoArrivals(socialWorker: number, swIds: number[]) {
    const today = new Date();
    const daysAgo = today.setDate(today.getDate() - 2);

    const needs = await this.needFlaskRepository
      .createQueryBuilder('need')
      .leftJoinAndMapOne(
        'need.child',
        Child,
        'child',
        'child.id = need.child_id',
      )
      .leftJoinAndMapOne('child.ngo', NGO, 'ngo', 'ngo.id = child.id_ngo')
      .where(
        new Brackets((qb) => {
          qb.where('need.type = :typeProduct', {
            typeProduct: NeedTypeEnum.PRODUCT,
          }).andWhere('need.status = :productStatus', {
            productStatus: ProductStatusEnum.PURCHASED_PRODUCT,
          });
        }),
      )
      .andWhere('child.isConfirmed = :childConfirmed', { childConfirmed: true })
      .andWhere('need.isConfirmed = :needConfirmed', { needConfirmed: true })
      .andWhere('need.expected_delivery_date > :startDate', {
        startDate: new Date(daysAgo),
      })
      .andWhere('need.isDeleted = :needDeleted', { needDeleted: false })
      .andWhere('need.created_by_id IN (:...swIds)', {
        swIds: socialWorker ? [socialWorker] : [...swIds],
      })
      .andWhere('need.retailerCode IS NOT NULL')

      .select([
        'need.id',
        'need.link',
        'ngo.name',
        'child.id',
        'child.id_ngo',
        'need.retailerCode',
        'need.type',
        'need.status',
        'need.created_by_id',
        'need.expected_delivery_date',
      ])
      .getMany();

    const codesArray = needs.map(
      (n: { retailerCode: string }) => n.retailerCode,
    );
    const uniqueCodes = Array.from(new Set(codesArray));

    // we get the max date to ignore codes with wrong date / help find same codes with different dates
    const arrivals = uniqueCodes.map((c) => {
      return {
        [c]: {
          maxDate: Math.max(
            ...needs
              .filter((n) => n.retailerCode === c)
              .map((n) => Date.parse(String(n.expected_delivery_date))),
          ),
          ngoId: needs
            .filter((n) => n.retailerCode === c)
            .map((n: any) => n.child.id_ngo)[0],

          ngoName: needs
            .filter((n) => n.retailerCode === c)
            .map((n: any) => n.child.ngo.name)[0],
        },

      };
    });

    return { arrivals };
  }

  getFlaskNgos(): Promise<NGO[]> {
    return this.ngoFlaskRepository.find();
  }
  getFlaskNgo(flaskNgoId: number): Promise<NGO> {
    return this.ngoFlaskRepository.findOne({
      where: { id: flaskNgoId },
    });
  }

  getNgoById(flaskNgoId: number): Promise<NgoEntity> {
    const ngo = this.ngoRepository.findOne({
      where: {
        flaskNgoId: flaskNgoId,
      },
    });
    return ngo;
  }

  createNgo(ngoDetails: NgoParams, city: CityEntity): Promise<NgoEntity> {
    const newNgo = this.ngoRepository.create({
      ...ngoDetails,
      city: city,
    });
    return this.ngoRepository.save({ id: newNgo.id, ...newNgo });
  }

  async updateNgo(
    ngoId: string,
    ngoDetails: NgoParams,
    city: CityEntity,
  ): Promise<UpdateResult> {
    return this.ngoRepository.update(ngoId, {
      ...ngoDetails,
      city: city,
    });
  }
}
