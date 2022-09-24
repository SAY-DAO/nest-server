import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DoneNeedRequestDto } from '../../types/dtos/DoneNeedRequest.dto';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { NeedEntity } from '../../entities/need.entity';
import { UserInterface } from '../../entities/interface/user-entity.interface';

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

  async getUserChildDoneNeeds(data: DoneNeedRequestDto): Promise<any> {
    const user = await this.userRepository.findOne({
      where: {
        userId: data.userId,
      },
      relations: {
        doneNeeds: true,
      },
    });

    let filteredNeeds = [];
    function isMatched(doneNeed: NeedEntity) {
      return doneNeed.child?.childId === data.childId;
    }
    // user is not found when there is no done needs
    if (user) {
      filteredNeeds = user.doneNeeds.filter(isMatched);
    }
    // urgent ==> index 0
    // growth 0 ==> index 1
    // joy 1 ==> index 2
    // health 2 ==> index 3
    // surroundings 3 ==> index 4
    // all ==> index 5
    const needData = [[], [], [], [], [], []];
    for (let i = 0; i < filteredNeeds.length; i += 1) {
      if (filteredNeeds[i].isUrgent) {
        needData[0].push(filteredNeeds[i]);
      } else {
        needData[filteredNeeds[i].category + 1].push(filteredNeeds[i]);
      }
    }
    needData[5].push(...filteredNeeds);

    return { ...user, doneNeeds: needData, total: filteredNeeds.length };
  }

  async createUser(request: UserInterface): Promise<UserEntity> {
    const saved = await this.userRepository.save({
      userId: request.userId,
      avatarUrl: request.avatarUrl,
      // isActive: request.isActive,
    });
    return saved;
  }

}
