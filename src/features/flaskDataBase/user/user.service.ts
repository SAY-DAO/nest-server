import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { user } from 'src/entities/flaskEntities/user.entity';
import { Repository } from 'typeorm';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(user)
    private allUserRepository: Repository<user>,
  ) { }

  getUsers(): Promise<user[]> {
    return this.allUserRepository.find();
  }
}