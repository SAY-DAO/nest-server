import { Controller, Get, HttpException, HttpStatus, NotFoundException, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NeedEntity } from '../../entities/need.entity';
import { UserEntity } from '../../entities/user.entity';
import { UserService } from './user.service';
import { RolesEnum } from '../../types/interface';
import { NEEDS_URL } from '../need/need.controller';
import { NeedService } from '../need/need.service';
import { ObjectNotFound } from 'src/filters/notFound-expectation.filter';

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(
        private userService: UserService,
        private needService: NeedService
    ) { }

    @Get(`all`)
    @ApiOperation({ description: 'Get a single transaction by ID' })
    async getUSers() {
        return await this.userService.getUsers();
    }

    @Get(`done`)
    @ApiOperation({ description: 'Get all done needs' })
    async getUserChildDoneNeeds(
        @Query('childId', ParseIntPipe) childId: number,
        @Query('userId', ParseIntPipe) userId: number,
    ) {
        let user: UserEntity
        user = await this.userService.getUserDoneNeeds(userId);
        if (!user) {
            user = await this.userService.createUser({ flaskUserId: userId });
        }
        let filteredNeeds = [];
        function isMatched(doneNeed: NeedEntity) {
            return doneNeed.flaskChildId === childId;
        }

        // user is not found when there is no done needs
        if (user && user.doneNeeds) {
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
        console.log(filteredNeeds);

        return {
            flaskUserId: userId,
            id: user.id,
            flaskChildId: childId,
            doneNeeds: needData,
            total: filteredNeeds.length,
        };
    }


    @Get(`tasks/:flaskId`)
    @ApiOperation({ description: 'Get user contribution' })
    async getUserContribution(@Param('flaskId') flaskId: number, @Query('page') page = 1, @Query('limit') limit = 10) {
        limit = limit > 100 ? 100 : limit;
        const user = await this.userService.getUser(flaskId);
        if (user) {
            console.log(user.role)
            if (user.role === RolesEnum.SOCIAL_WORKER) {
                await this.needService.getSocialWorkerCreatedNeeds(user.flaskSwId, {
                    limit: Number(limit),
                    page: Number(page),
                    route: NEEDS_URL
                })
            }
        } else {
            throw new ObjectNotFound();
        }

        // return user;
    }
}


// export enum RolesEnum {
//     NO_ROLE = 0,
//     SUPER_ADMIN = 1,
//     SOCIAL_WORKER = 2,
//     COORDINATOR = 3, // contributor
//     NGO_SUPERVISOR = 4,
//     SAY_SUPERVISOR = 5,
//     ADMIN = 6, // team lead
//     FAMILY = 7,
//     FRIEND = 8,
// };
