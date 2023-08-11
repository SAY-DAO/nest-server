import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CityEntity } from 'src/entities/city.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { NGO } from 'src/entities/flaskEntities/ngo.entity';
import { NgoArrivalEntity, NgoEntity } from 'src/entities/ngo.entity';
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
    @InjectRepository(NgoArrivalEntity)
    private ngoArrivalRepository: Repository<NgoArrivalEntity>,
    @InjectRepository(NGO, 'flaskPostgres')
    private ngoFlaskRepository: Repository<NGO>,
    @InjectRepository(Need, 'flaskPostgres')
    private needFlaskRepository: Repository<Need>,
  ) {}

  getNgos(): Promise<NgoEntity[]> {
    return this.ngoRepository.find();
  }

  async updateNgoArrivals(
    ngo: NgoEntity,
    deliveryCode: string,
    arrivalCode: string,
  ): Promise<NgoArrivalEntity | UpdateResult> {
    const nestNgoArrival = await this.ngoArrivalRepository.findOne({
      where: {
        deliveryCode,
      },
    });
    if (!nestNgoArrival) {
      console.log('Creating NgoArrivals...\n');
      const ngoArrival = this.ngoArrivalRepository.create({
        arrivalCode,
        deliveryCode,
        ngo,
      });
      return this.ngoArrivalRepository.save(ngoArrival);
    } else {
      console.log('Updating NgoArrivals...\n');
      return this.ngoArrivalRepository.update(nestNgoArrival.id, {
        id: nestNgoArrival.id,
        arrivalCode,
      });
    }
  }

  async getNgoArrivals(socialWorker: number, swIds: number[]) {
    const today = new Date();
    const daysAgo = today.setDate(today.getDate() - 10);

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
      .andWhere('need.deliveryCode IS NOT NULL')

      .select([
        'need.id',
        'ngo.name',
        'child.id',
        'child.id_ngo',
        'need.deliveryCode',
        'need.type',
        'need.status',
        'need.created_by_id',
        'need.expected_delivery_date',
      ])
      .getMany();

    // return codes
    const codesArray = needs.map(
      (n: { deliveryCode: string }) => n.deliveryCode,
    );
    const uniqueCodes = Array.from(new Set(codesArray));

    const arrivalCodes = [];
    for await (const c of uniqueCodes) {
      const arrival = await this.ngoArrivalRepository.findOne({
        where: {
          deliveryCode: c,
        },
      });
      arrivalCodes.push(arrival);
    }
    // we get the max date to ignore codes with wrong date / help find same codes with different dates
    const arrivals = uniqueCodes.map((c) => {
      return {
        deliveryCode: c,
        maxDate: Math.min(
          ...needs
            .filter((n) => n.deliveryCode === c)
            .map((n) => Date.parse(String(n.expected_delivery_date))),
        ),
        ngoId: needs
          .filter((n) => n.deliveryCode === c)
          .map((n: any) => n.child.id_ngo)[0],

        ngoName: needs
          .filter((n) => n.deliveryCode === c)
          .map((n: any) => n.child.ngo.name)[0],

        arrivalCode: arrivalCodes.find((a) => a && a.deliveryCode === c)
          ? arrivalCodes.find((a) => a && a.deliveryCode === c).arrivalCode
          : '',

        itemCount: needs.filter((n) => n.deliveryCode === c).length,
      };
    });

    arrivals.sort(function (a, b) {
      return b.maxDate - a.maxDate;
    });

    return [...arrivals];
  }

  getFlaskNgos(): Promise<NGO[]> {
    return this.ngoFlaskRepository
      .createQueryBuilder('ngo')
      .andWhere('ngo.id NOT IN (:...testNgoIds)', {
        testNgoIds: [3, 14],
      })
      .cache(10000)
      .getMany();
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
    console.log(city);
    console.log(ngoDetails);
    const newNgo = this.ngoRepository.create({
      ...ngoDetails,
      flaskCityId: ngoDetails.flaskCityId,
      city: city,
    });

    console.log(newNgo);

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
