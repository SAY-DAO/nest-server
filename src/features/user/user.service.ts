import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DoneNeedRequest } from '../../types/requests/DoneNeedRequest';
import { Repository, UpdateResult } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { User, UserRequest } from '../../types/requests/UserRequest';
import { Need } from '../../types/requests/NeedRequest';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) { }

  async getUsers(): Promise<UserEntity[]> {
    return await this.userRepository.find();
  }

  async getUserChildDoneNeeds(data: DoneNeedRequest): Promise<any> {
    const user = await this.userRepository.findOne({
      where: {
        id_user: data.id_user,
      },
      relations: {
        doneNeeds: true,
      },
    });
    let filteredNeeds = [];
    function isMatched(doneNeed: Need) {
      return doneNeed.child_id === data.child_id;
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

    return { ...user, doneNeeds: needData };
  }

  async getUser(id_user: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        id_user: id_user,
      },
    });
    return user;
  }

  public async updateUser(request: User): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id_user: request.id_user,
      },
    });
    user.avatarUrl = request.avatarUrl;
    return await this.userRepository.save(user);
  }

  async createUsers(request: UserRequest): Promise<UserEntity[]> {
    const list = [];
    for (let i = 0; i < request.userData.length; i++) {
      const thisUser = await this.userRepository.findOne({
        where: {
          id_user: request.userData[i].id_user,
        },
      });

      if (thisUser) {
        const updated = await this.updateUser(request.userData[i]);
        list.push(updated);
        continue;
      }

      const saved = await this.userRepository.save({
        id_user: request.userData[i].id_user,
        avatarUrl: request.userData[i].avatarUrl,
        isActive: request.userData[i].isActive,
      });
      list.push(saved);
    }
    return list;
  }

  async createUser(request: User): Promise<UserEntity> {
    const saved = await this.userRepository.save({
      id_user: request.id_user,
      avatarUrl: request.avatarUrl,
      isActive: request.isActive,
    });
    return saved;
  }
}
