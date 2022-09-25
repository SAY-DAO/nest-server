import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NeedEntity } from 'src/entities/need.entity';
import { UserEntity } from 'src/entities/user.entity';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(private userService: UserService) { }

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
            user = await this.userService.createUser({ userId });
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
}
