import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Query,
    Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { NeedService } from '../need/need.service';
import { ServerError } from '../../filters/server-exception.filter';
import { ChildrenService } from '../children/children.service';
import { RolesEnum, ProductStatusEnum } from 'src/types/interface';
import {
    SwMyPage,
    SwmypageInnerNeeds,
} from 'src/generated-sources/openapi';
import { getNeedsTimeLine, getOrganizedNeeds, timeDifference } from 'src/utils/helpers';
import { ChildNeed } from 'src/types/interfaces/Need';

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(
        private userService: UserService,
        private needService: NeedService,
        private childrenService: ChildrenService,
    ) { }

    @Get('myPage/:ngoId/:userId/:typeId')
    @ApiOperation({ description: 'Get user My page' })
    async fetchMyPage(
        @Req() req: Request,
        @Param('userId', ParseIntPipe) userId: number,
        @Param('typeId', ParseIntPipe) typeId: number,
        @Param('ngoId') ngoId: number,
        @Query('isUser') isUser: string,
    ) {
        const time1 = new Date().getTime();

        const accessToken = req.headers['authorization'];
        const X_SKIP = req.headers['x-skip'];
        const X_TAKE = req.headers['x-take'];
        let pageData: SwMyPage
        try {
            pageData = await this.userService.getMyPage(
                accessToken,
                X_SKIP,
                X_TAKE,
                userId,
                parseInt(isUser) // when 0 displays all children when 1 shows children/needs  created by them
            );

        } catch (e) {
            console.log(e)

        }

        let child: {
            id: number;
            sayName: string;
            firstName: string;
            lastName: string;
            birthDate: string;
            awakeAvatarUrl: string;
        };

        let role = '';
        let childNeed: ChildNeed;
        let swNeedsList: SwmypageInnerNeeds[] = [];
        // extract contributors related needss
        const time2 = new Date().getTime();
        timeDifference(time1, time2, "Fetched Flask In ")

        const time3 = new Date().getTime();
        try {
            if (pageData) {
                for (let i = 0; i < pageData.length; i++) {
                    const childNeedsList = [];
                    child = {
                        id: pageData[i].id,
                        sayName: pageData[i].sayName,
                        firstName: pageData[i].firstName,
                        lastName: pageData[i].lastName,
                        birthDate: pageData[i].birthDate,
                        awakeAvatarUrl: pageData[i].awakeAvatarUrl,
                    };

                    for (let k = 0; k < pageData[i].needs.length; k++) {
                        childNeed = { child, ...pageData[i].needs[k] };
                        childNeedsList.push(childNeed);
                    }

                    // SW
                    if (typeId === RolesEnum.SOCIAL_WORKER) {
                        role = 'createdById';
                        const swNeeds = childNeedsList.filter(
                            (need) => need[role] === userId,
                        );
                        const newList = swNeedsList.concat(swNeeds); // Merging
                        swNeedsList = newList;
                    }
                    // NGO supervisor
                    else if (typeId === RolesEnum.NGO_SUPERVISOR) {
                        role = 'ngo';
                        const swNeeds = childNeedsList;
                        const newList = swNeedsList.concat(swNeeds); // Merging
                        swNeedsList = newList;
                    }
                    // Auditor
                    else if (
                        typeId === RolesEnum.ADMIN ||
                        typeId === RolesEnum.SUPER_ADMIN ||
                        RolesEnum.SAY_SUPERVISOR
                    ) {
                        role = 'confirmedBy';
                        const swNeeds = childNeedsList;
                        const newList = swNeedsList.concat(swNeeds); // Merging
                        swNeedsList = newList;
                    }
                    // Purchaser
                    else if (typeId === RolesEnum.COORDINATOR) {
                        role = 'purchasedBy';
                        const swNeeds = childNeedsList;
                        for (let k = 0; k < pageData[i].needs.length; k++) {
                            const statusUpdates = pageData[i].needs[k].statusUpdates.filter(
                                (need) => need[role] === userId,
                            );
                            for (let j = 0; j < statusUpdates.length; j++) {
                                if (
                                    statusUpdates[j].oldStatus === ProductStatusEnum.COMPLETE_PAY &&
                                    statusUpdates[j].newStatus ===
                                    ProductStatusEnum.PURCHASED_PRODUCT &&
                                    statusUpdates[j].swId === userId
                                ) {
                                    const newList = swNeedsList.concat(swNeeds); // Merging
                                    swNeedsList = newList;
                                }
                            }
                        }
                    }
                }
            }

        } catch (e) {
            console.log(e)
            throw new ServerError(e);
        }
        const time4 = new Date().getTime();
        timeDifference(time3, time4, "First organize In ")

        const time5 = new Date().getTime();
        const organizedNeeds = getOrganizedNeeds(swNeedsList);
        const time6 = new Date().getTime();
        timeDifference(time5, time6, "Second organize In ")


        const time7 = new Date().getTime();
        const { summary, inMonth } = getNeedsTimeLine(swNeedsList, role);
        const time8 = new Date().getTime();
        timeDifference(time7, time8, "TimeLine In ")

        return {
            ngoId,
            userId,
            role,
            typeId,
            needs: organizedNeeds,
            childrenCount: pageData ? pageData.length : 0,
            timeLine: { summary, inMonth },
        };
    }
}
