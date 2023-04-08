import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Req,
    UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { ServerError } from '../../filters/server-exception.filter';
import {

    SAYPlatformRoles,
} from 'src/types/interfaces/interface';
import {
    convertFlaskToSayRoles,
    timeDifferenceWithComment,
} from 'src/utils/helpers';
import { MyPageInterceptor } from './interceptors/mypage.interceptors';
import { TicketService } from '../ticket/ticket.service';
import { SignatureService } from '../wallet/wallet.service';
import { IpfsService } from '../ipfs/ipfs.service';
import { NeedService } from '../need/need.service';
import { ChildrenService } from '../children/children.service';
import { Pagination, IPaginationMeta } from 'nestjs-typeorm-paginate';
import { Need } from 'src/entities/flaskEntities/need.entity';

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(
        private userService: UserService,
        private needService: NeedService,
        private childrenService: ChildrenService,
        private ticketService: TicketService,
        private signatureService: SignatureService,
        private ipfsService: IpfsService,
    ) { }

    @Get(`all`)
    @ApiOperation({ description: 'Get all users' })
    async getUsers() {
        return await this.userService.getUsers();
    }

    @Get(`all/contributor`)
    @ApiOperation({ description: 'Get all contributors' })
    async getContributors() {
        return await this.userService.getContributors();
    }

    @UseInterceptors(MyPageInterceptor)
    @Get('myPage/:userId/:typeId')
    @ApiOperation({ description: 'Get user My page' })
    async fetchMyPage(
        @Req() req: Request,
        @Param('userId', ParseIntPipe) userId: number,
        @Param('typeId', ParseIntPipe) typeId: number,
    ) {
        const time1 = new Date().getTime();

        const X_LIMIT = parseInt(req.headers['x-limit']);
        const X_TAKE = parseInt(req.headers['x-take']);
        const limit = X_LIMIT > 100 ? 100 : X_LIMIT;
        const page = X_TAKE + 1;

        let allNeeds: Need[][];
        let paid: Pagination<Need, IPaginationMeta>;
        let unpaid: Pagination<Need, IPaginationMeta>;
        let purchased: Pagination<Need, IPaginationMeta>
        let delivered: Pagination<Need, IPaginationMeta>;
        const roleId = convertFlaskToSayRoles(typeId);

        try {
            let socialWorker: number;
            let auditor: number;
            let purchaser: number;
            let ngoId: number;

            if (roleId === SAYPlatformRoles.SOCIAL_WORKER) {
                console.log('\x1b[33m%s\x1b[0m', `Role for my Page is SOCIAL_WORKER...\n`);
                socialWorker = userId;
                auditor = null;
                purchaser = null;
                ngoId = null;
            }
            if (roleId === SAYPlatformRoles.AUDITOR) {
                console.log('\x1b[33m%s\x1b[0m', `Role for my Page is AUDITOR...\n`);
                socialWorker = null;
                auditor = userId;
                purchaser = null;
                ngoId = null;
            }
            if (roleId === SAYPlatformRoles.NGO_SUPERVISOR) {
                console.log('\x1b[33m%s\x1b[0m', `Role for my Page is NGO_SUPERVISOR...\n`);
                socialWorker = null;
                auditor = null;
                purchaser = null;
                const supervisor = await this.userService.getFlaskSocialWorker(userId);
                ngoId = supervisor.ngo_id;
            }
            if (roleId === SAYPlatformRoles.PURCHASER) {
                console.log('\x1b[33m%s\x1b[0m', `Role for my Page is PURCHASER...\n`);
                socialWorker = null;
                auditor = null;
                purchaser = userId;
                ngoId = null;
            }

            unpaid = await this.needService.getUnpaidNeeds(
                {
                    page,
                    limit,
                },
                socialWorker,
                auditor,
                purchaser,
                ngoId,
            );

            paid = await this.needService.getPaidNeeds(
                {
                    page,
                    limit,
                },
                socialWorker,
                auditor,
                purchaser,
                ngoId,
            );

            purchased = await this.needService.getPurchasedNeeds(
                {
                    page,
                    limit,
                },
                socialWorker,
                auditor,
                purchaser,
                ngoId,
            );

            delivered = await this.needService.getDeliveredNeeds(
                {
                    page,
                    limit,
                },
                socialWorker,
                auditor,
                purchaser,
                ngoId,
            );

            allNeeds = [
                [...unpaid.items],
                [...paid.items],
                [...purchased.items],
                [...delivered.items],
            ];


            const time2 = new Date().getTime();
            timeDifferenceWithComment(time1, time2, 'Fetched Flask In ');
        } catch (e) {
            throw new ServerError(e.message, e.status);
        }

        // const modifiedNeedList = [];
        console.log(paid.meta.totalItems)
        console.log(unpaid.meta.totalItems)
        console.log(purchased.meta.totalItems)
        console.log(delivered.meta.totalItems)
        const time3 = new Date().getTime();
        // try {
        //     // add child + IPFS + tickets for every need
        //     const tickets = await this.ticketService.getUserTickets(userId);
        //     for (let k = 0; k < allNeeds.length; k++) {
        //         const fetchedNeed = allNeeds[k];
        //         const ticket = tickets.find(
        //             (t) => allNeeds[k].id === t.flaskNeedId,
        //         );
        //         const ipfs = await this.ipfsService.getNeedIpfs(allNeeds[k].id);

        //         const modifiedNeed = { ticket, ipfs, ...fetchedNeed };
        //         modifiedNeedList.push(modifiedNeed);
        //     }
        // } catch (e) {
        //     throw new ServerError(e.message, e.status);
        // }

        const time4 = new Date().getTime();
        timeDifferenceWithComment(time3, time4, 'First organize In ');

        // const time5 = new Date().getTime();
        // const organizedNeeds = getOrganizedNeeds(modifiedNeedList);
        // const time6 = new Date().getTime();
        // timeDifferenceWithComment(time5, time6, 'Second organize In ');

        // const time7 = new Date().getTime();
        // const { summary, inMonth } = getNeedsTimeLine(modifiedNeedList, role);
        // const time8 = new Date().getTime();

        // timeDifferenceWithComment(time7, time8, 'TimeLine In ');
        const signatures = await this.signatureService.getUserSignatures(userId);

        const max = Math.max(
            paid.meta.totalItems,
            unpaid.meta.totalItems,
            purchased.meta.totalItems,
            delivered.meta.totalItems,
        );
        return {
            page,
            limit,
            meta:
                paid.meta.totalItems === max
                    ? paid.meta
                    : unpaid.meta.totalItems === max
                        ? unpaid.meta
                        : purchased.meta.totalItems === max
                            ? purchased.meta
                            : delivered.meta,
            userId,
            typeId,
            needs: allNeeds,
            // timeLine: { summary, inMonth },
            signatures,
        };
    }
}
