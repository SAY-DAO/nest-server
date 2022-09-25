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


  async getUser(userId: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        userId: userId,
      },
    });
    return user;
  }

  async getUserDoneNeeds(userId: number): Promise<UserEntity> {
    return await this.userRepository.findOne({
      where: {
        userId,
      },
      relations: {
        doneNeeds: true,
      },
    });
  }

  createUser(userDetails: UserParams): Promise<UserEntity> {
    const newUser = this.userRepository.create({
      userId: userDetails.userId,
      avatarUrl: userDetails.avatarUrl,
      // isActive: userDetails.isActive,
    });
    return this.userRepository.save(newUser);
  }

}
