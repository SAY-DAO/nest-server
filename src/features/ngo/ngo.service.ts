import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NgoEntity } from 'src/entities/ngo.entity';
import { NgoParams } from 'src/types/parameters/NgoParammeters';
import { Repository } from 'typeorm';
import { FamilyEntity } from '../../entities/user.entity';

@Injectable()
export class NgoService {
    constructor(
        @InjectRepository(NgoEntity)
        private ngoRepository: Repository<NgoEntity>,

    ) { }

    getNgos(): Promise<NgoEntity[]> {
        return this.ngoRepository.find();
    }


    getNgo(flaskNgoId: number): Promise<NgoEntity> {
        const user = this.ngoRepository.findOne({
            where: {
                flaskNgoId: flaskNgoId,
            },
        });
        return user;
    }

    createNgo(ngoDetails: NgoParams): Promise<NgoEntity> {
        const newNgo = this.ngoRepository.create({
            ...ngoDetails,
        });
        return this.ngoRepository.save(newNgo);
    }
}
