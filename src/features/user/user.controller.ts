import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Query,
    Req,
    UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { ServerError } from '../../filters/server-exception.filter';
import { FlaskUserTypesEnum, ProductStatusEnum } from 'src/types/interfaces/interface';
import {
    SwMyPage, SwmypageNeeds,
} from 'src/generated-sources/openapi';
import { getNeedsTimeLine, getOrganizedNeeds, timeDifferenceWithComment } from 'src/utils/helpers';
import { ChildNeed } from 'src/types/interfaces/Need';
import { MyPageInterceptor } from './interceptors/mypage.interceptors';
import { TicketService } from '../ticket/ticket.service';
import { AllExceptionsFilter } from 'src/filters/all-exception.filter';
import { SignatureService } from '../wallet/wallet.service';
import { IpfsService } from '../ipfs/ipfs.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(
        private userService: UserService,
        private ticketService: TicketService,
        private signatureService: SignatureService,
        private ipfsService: IpfsService,
    ) { }

    @Get(`all`)
    @ApiOperation({ description: 'Get all users' })
    async getUsers() {
        return await this.userService.getUsers()
    }

    @Get(`all/contributor`)
    @ApiOperation({ description: 'Get all contributors' })
    async getContributors() {
        return await this.userService.getContributors()
    }


    @UseInterceptors(MyPageInterceptor)
    @Get('myPage/:ngoId/:userId/:typeId')
    @ApiOperation({ description: 'Get user My page' })
    async fetchMyPage(
        @Req() req: Request,
        @Param('userId', ParseIntPipe) userId: number,
        @Param('typeId', ParseIntPipe) typeId: number,
        @Param('ngoId') ngoId: number,
        @Query('isUser') isUser: "0" | "1", // when 0 displays all children when 1 shows children/needs created by them
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
                parseInt(isUser)
            );

        } catch (e) {
            throw new AllExceptionsFilter(e);

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
        let swNeedsList: SwmypageNeeds[] = [];
        // extract contributors related needs
        const time2 = new Date().getTime();
        timeDifferenceWithComment(time1, time2, "Fetched Flask In ")

        const time3 = new Date().getTime();
        try {
            if (pageData) {
                for (let i = 0; i < pageData.result.length; i++) {
                    const childNeedsList = [];
                    child = {
                        id: pageData.result[i].id,
                        sayName: pageData.result[i].sayName,
                        firstName: pageData.result[i].firstName,
                        lastName: pageData.result[i].lastName,
                        birthDate: pageData.result[i].birthDate,
                        awakeAvatarUrl: pageData.result[i].awakeAvatarUrl,
                    };

                    // add child + IPFS + tickets for every need
                    const tickets = await this.ticketService.getUserTickets(userId)
                    for (let k = 0; k < pageData.result[i].needs.length; k++) {
                        const fetchedNeed = pageData.result[i].needs[k]
                        const ticket = tickets.find((t) => pageData.result[i].needs[k].id === t.flaskNeedId)
                        const ipfs = await this.ipfsService.getNeedIpfs(pageData.result[i].needs[k].id)

                        childNeed = { child, ticket, ipfs, ...fetchedNeed };
                        childNeedsList.push(childNeed);
                    }
                    // SW
                    if (typeId === FlaskUserTypesEnum.SOCIAL_WORKER) {
                        role = 'createdById';
                        const swNeeds = childNeedsList.filter(
                            (need) => need[role] === userId,
                        );
                        const newList = swNeedsList.concat(swNeeds); // Merging
                        swNeedsList = newList;
                    }
                    // NGO supervisor
                    else if (typeId === FlaskUserTypesEnum.NGO_SUPERVISOR) {
                        role = 'ngo';
                        const swNeeds = childNeedsList;
                        const newList = swNeedsList.concat(swNeeds); // Merging
                        swNeedsList = newList;
                    }
                    // Auditor
                    else if (
                        typeId === FlaskUserTypesEnum.ADMIN ||
                        typeId === FlaskUserTypesEnum.SUPER_ADMIN ||
                        FlaskUserTypesEnum.SAY_SUPERVISOR
                    ) {
                        role = 'confirmedBy';
                        const swNeeds = childNeedsList;
                        const newList = swNeedsList.concat(swNeeds); // Merging
                        swNeedsList = newList;
                    }
                    // Purchaser
                    else if (typeId === FlaskUserTypesEnum.COORDINATOR) {
                        role = 'purchasedBy';
                        const swNeeds = childNeedsList;
                        for (let k = 0; k < pageData.result[i].needs.length; k++) {
                            const statusUpdates = pageData.result[i].needs[k].statusUpdates.filter(
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
            throw new ServerError(e);
        }
        const time4 = new Date().getTime();
        timeDifferenceWithComment(time3, time4, "First organize In ")

        const time5 = new Date().getTime();
        const organizedNeeds = getOrganizedNeeds(swNeedsList);
        const time6 = new Date().getTime();
        timeDifferenceWithComment(time5, time6, "Second organize In ")


        const time7 = new Date().getTime();
        const { summary, inMonth } = getNeedsTimeLine(swNeedsList, role);
        const time8 = new Date().getTime();
        timeDifferenceWithComment(time7, time8, "TimeLine In ")

        const signatures = await this.signatureService.getUserSignatures(userId)

        return {
            ngoId,
            userId,
            role,
            typeId,
            needs: organizedNeeds,
            childrenCount: pageData ? pageData.count : 0,
            timeLine: { summary, inMonth },
            signatures,
        };
    }
}
