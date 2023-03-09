import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SocialWorker } from '../../../entities/flaskEntities/user.entity';
import { Repository } from 'typeorm';


@Injectable()
export class FlaskUserService {
  constructor(
    @InjectRepository(SocialWorker, 'flaskPostgres')
    private allUserRepository: Repository<SocialWorker>,
  ) { }

  getUsers(): Promise<SocialWorker[]> {
    return this.allUserRepository.find();
  }

  getUserById(id: number): Promise<SocialWorker> {
    return this.allUserRepository.findOne({
      where: { id: id }
    });
  }

  getSws(): Promise<SocialWorker[]> {
    return this.allUserRepository.find();
  }
  
  getFlaskSocialWorker(id: number): Promise<SocialWorker> {
    return this.allUserRepository.findOne({
      where: { id: id }
    });
  }
}