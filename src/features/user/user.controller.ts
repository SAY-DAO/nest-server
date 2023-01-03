import { Controller, Get, Param, ParseIntPipe, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NeedEntity } from '../../entities/need.entity';
import { FamilyEntity } from '../../entities/user.entity';
import { UserService } from './user.service';
import { NEEDS_URL } from '../need/need.controller';
import { NeedService } from '../need/need.service';
import { ObjectNotFound } from '../../filters/notFound-expectation.filter';
import { ChildrenService } from '../children/children.service';
import { ChildrenEntity } from '../../entities/children.entity';
import { NeedTypeEnum, PaymentStatusEnum, ProductStatusEnum, RolesEnum, ServiceStatusEnum } from 'src/types/interface';
import { NeedAPIApi, NeedModel, SocialWorkerAPIApi } from 'src/generated-sources/openapi';
import { NeedDto, NeedsDataDto } from 'src/types/dtos/CreateNeed.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(
        private userService: UserService,
        private needService: NeedService,
        private childrenService: ChildrenService,
    ) { }

    @Get(`all`)
    @ApiOperation({ description: 'Get a single transaction by ID' })
    async getFamilies() {
        const families = await this.userService.getFamilies();
        const socialWorkers = await this.userService.getSocialWorkers();
        return { 'families': families, 'socialWorkers': socialWorkers }
    }

    @Get(`done`)
    @ApiOperation({ description: 'Get all done needs' })
    async getUserChildDoneNeeds(
        @Query('childId', ParseIntPipe) childId: number,
        @Query('userId', ParseIntPipe) userId: number,
    ) {
        let user: FamilyEntity
        user = await this.userService.getUserDoneNeeds(userId);
        if (!user) {
            user = await this.userService.createFamilyMember({ flaskUserId: userId });
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


    @Get(`myPage/:ngoId/:swId`)
    @ApiOperation({ description: 'Get social worker created needs' })
    async fetchMyPage(@Req() req: Request, @Param('ngoId') ngoId: number, @Param('swId') swId: number) {
        const accessToken = req.headers["authorization"]
        const X_SKIP = req.headers["x-skip"]
        const X_TAKE = req.headers["x-take"]
        let needsData: NeedsDataDto
        try {

            needsData = await this.needService.getNeeds({ accessToken, X_SKIP, X_TAKE }, { ngoId:1 })
        } catch (e) {
            throw new ObjectNotFound();
        }
        console.log(needsData.needs.length)

        const filteredNeeds = needsData.needs.filter((n) => n.created_by_id === 27)

        console.log(filteredNeeds.length)

        const organizedNeeds = [[], [], [], []]; // [[not paid], [payment], [purchased/delivered Ngo], [Done]]
        if (filteredNeeds) {
            for (let i = 0; i < filteredNeeds.length; i++) {
                // not Paid
                if (filteredNeeds[i].status === 0) {
                    organizedNeeds[0].push(filteredNeeds[i]);
                }
                // Payment Received
                else if (
                    filteredNeeds[i].status === PaymentStatusEnum.PARTIAL_PAY ||
                    filteredNeeds[i].status === PaymentStatusEnum.COMPLETE_PAY
                ) {
                    organizedNeeds[1].push(filteredNeeds[i]);
                }

                if (filteredNeeds[i].type === NeedTypeEnum.SERVICE) {
                    // Payment sent to NGO
                    if (filteredNeeds[i].status === ServiceStatusEnum.MONEY_TO_NGO) {
                        organizedNeeds[2].push(filteredNeeds[i]);
                    }
                    // Delivered to child
                    if (filteredNeeds[i].status === ServiceStatusEnum.DELIVERED) {
                        organizedNeeds[3].push(filteredNeeds[i]);
                    }
                } else if (filteredNeeds[i].type === NeedTypeEnum.PRODUCT) {
                    // Purchased
                    if (filteredNeeds[i].status === ProductStatusEnum.PURCHASED_PRODUCT) {
                        organizedNeeds[2].push(filteredNeeds[i]);
                    }
                    // Delivered to Ngo
                    if (filteredNeeds[i].status === ProductStatusEnum.DELIVERED_TO_NGO) {
                        organizedNeeds[2].push(filteredNeeds[i]);
                    }
                    // Delivered to child
                    if (filteredNeeds[i].status === ProductStatusEnum.DELIVERED) {
                        organizedNeeds[3].push(filteredNeeds[i]);
                    }
                }
            }
            return organizedNeeds
        }
    }

    @Get(`social-worker/:flaskId/confirmedNeeds`)
    @ApiOperation({ description: 'Get supervisor confirmed needs' })
    async getSwConfirmedNeeds(@Param('flaskId') flaskId: number, @Query('page') page = 1, @Query('limit') limit = 100) {
        let needs: any
        limit = limit > 100 ? 100 : limit;
        const supervisor = await this.userService.getSocialWorker(flaskId);

        if (supervisor && supervisor.role === RolesEnum.SAY_SUPERVISOR) {
            try {
                needs = await this.needService.getSupervisorConfirmedNeeds(supervisor.flaskSwId, {
                    limit: Number(limit),
                    page: Number(page),
                    route: NEEDS_URL
                })
            } catch (e) {
                throw new ObjectNotFound();
            }
        }
        return needs;
    }

    @Get(`social-worker/:flaskId/confirmedChildren`)
    @ApiOperation({ description: 'Get supervisor confirmed children' })
    async getSwConfirmedChildren(@Param('flaskId') flaskId: number, @Query('page') page = 1, @Query('limit') limit = 100) {
        let needs: any
        limit = limit > 100 ? 100 : limit;
        const supervisor = await this.userService.getSocialWorker(flaskId);

        if (supervisor && supervisor.role === RolesEnum.SAY_SUPERVISOR) {
            try {
                needs = await this.childrenService.getSupervisorConfirmedChildren(supervisor.flaskSwId, {
                    limit: Number(limit),
                    page: Number(page),
                    route: NEEDS_URL
                })
            } catch (e) {
                throw new ObjectNotFound();
            }
        }

        return needs;
    }
    // Nyaz -purchasing,...
    // @Get(`social-worker/:flaskId/confirmedNeeds`)
    // @ApiOperation({ description: 'Get social worker created needs' })
    // async getContributorContribution(@Param('flaskId') flaskId: number, @Query('page') page = 1, @Query('limit') limit = 100) {
    //     let needs: any
    //     limit = limit > 100 ? 100 : limit;
    //     const socialWorker = await this.userService.getSocialWorker(flaskId);
    //     if (socialWorker && socialWorker.role === RolesEnum.SUPER_ADMIN) {
    //         try {
    //             needs = await this.needService.getSocialWorkerConfirmedNeeds(socialWorker.flaskSwId, {
    //                 limit: Number(limit),
    //                 page: Number(page),
    //                 route: NEEDS_URL
    //             })
    //         } catch (e) {
    //             throw new ObjectNotFound();
    //         }
    //     }
    //     return needs;
    // }
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
