import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DoneNeedRequestDto } from '../../types/dtos/DoneNeedRequest.dto';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { NeedEntity } from '../../entities/need.entity';
import { UserParams } from '../../types/parameters/UserParameters';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) { }

  async getUsers(): Promise<UserEntity[]> {
    return await this.userRepository.find();
  }


  async getUser(flaskUserId: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        flaskUserId: flaskUserId,
      },
    });
    return user;
  }

  async getUserDoneNeeds(flaskUserId: number): Promise<UserEntity> {
    return await this.userRepository.findOne({
      where: {
        flaskUserId,
      },
      relations: {
        doneNeeds: true,
      },
    });
  }

  createUser(userDetails: UserParams): Promise<UserEntity> {
    const newUser = this.userRepository.create({
      flaskUserId: userDetails.flaskUserId,
      avatarUrl: userDetails.avatarUrl,
      role: userDetails.role
      // isActive: userDetails.isActive,
    });
    return this.userRepository.save(newUser);
  }

}
