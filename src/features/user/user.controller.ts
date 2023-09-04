import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { ServerError } from '../../filters/server-exception.filter';
import {
  FlaskUserTypesEnum,
  SAYPlatformRoles,
} from 'src/types/interfaces/interface';
import {
  convertFlaskToSayRoles,
  getOrganizedNeeds,
  timeDifferenceWithComment,
} from 'src/utils/helpers';
import { MyPageInterceptor } from './interceptors/mypage.interceptors';
import { TicketService } from '../ticket/ticket.service';
import { WalletService } from '../wallet/wallet.service';
import { IpfsService } from '../ipfs/ipfs.service';
import { NeedService } from '../need/need.service';
import { ChildrenService } from '../children/children.service';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { Paginated } from 'nestjs-paginate';
import { NgoService } from '../ngo/ngo.service';
import { TicketEntity } from 'src/entities/ticket.entity';
import { SignatureEntity } from 'src/entities/signature.entity';
import { IpfsEntity } from 'src/entities/ipfs.entity';
import { isAuthenticated } from 'src/utils/auth';

@ApiTags('Users')
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskId',
  description: 'to use cache and flask authentication',
  required: true,
})
@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private needService: NeedService,
    private childrenService: ChildrenService,
    private ticketService: TicketService,
    private walletService: WalletService,
    private ipfsService: IpfsService,
    private ngoService: NgoService,
  ) {}

  @Get(`all`)
  @ApiOperation({ description: 'Get all users' })
  async getUsers(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
    return await this.userService.getUsers();
  }

  @Get(`all/contributor`)
  @ApiOperation({ description: 'Get all contributors' })
  async getContributors(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
    return await this.userService.getContributors();
  }

  @UseInterceptors(MyPageInterceptor)
  @Get('myPage/:userId/:typeId')
  @ApiOperation({ description: 'Get user My page' })
  async fetchMyPage(
    @Req() req: Request,
    @Param('typeId', ParseIntPipe) typeId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(403, 'You Are not authorized!');
    }
    const time1 = new Date().getTime();

    const X_LIMIT = parseInt(req.headers['x-limit']);
    const X_TAKE = parseInt(req.headers['x-take']);
    const limit = X_LIMIT > 100 ? 100 : X_LIMIT;
    const page = X_TAKE + 1;

    let allNeeds: Need[][];
    let notConfirmedCount: number;
    let paid: Paginated<Need>;
    let notPaid: Paginated<Need>;
    let purchased: Paginated<Need>;
    let delivered: Paginated<Need>;
    let children: number;
    let arrivals: any;

    const role = convertFlaskToSayRoles(typeId);

    try {
      let socialWorkerId: number;
      let auditorId: number;
      let purchaserId: number;
      let supervisorId: number;
      let ngoIds: number[];
      let swIds: number[];

      if (role === SAYPlatformRoles.SOCIAL_WORKER) {
        console.log(
          '\x1b[33m%s\x1b[0m',
          `Role for my Page is SOCIAL_WORKER...\n`,
        );
        socialWorkerId = panelFlaskUserId;
        auditorId = null;
        purchaserId = null;
        supervisorId = null;
        const socialWorker = await this.userService.getFlaskSocialWorker(
          panelFlaskUserId,
        ); // sw ngo
        ngoIds = [socialWorker.ngo_id];
        children = await this.childrenService.countChildren(ngoIds);
      }
      if (role === SAYPlatformRoles.AUDITOR) {
        console.log('\x1b[33m%s\x1b[0m', `Role for my Page is AUDITOR...\n`);
        socialWorkerId = null;
        auditorId = panelFlaskUserId;
        purchaserId = null;
        supervisorId = null;

        // for auditor - admin
        swIds = await this.userService
          .getFlaskSwIds()
          .then((r) => r.map((s) => s.id)); // all ngos
        ngoIds = await this.ngoService
          .getFlaskNgos()
          .then((r) => r.map((s) => s.id));
        children = await this.childrenService.countChildren(ngoIds);
      }
      if (role === SAYPlatformRoles.PURCHASER) {
        console.log('\x1b[33m%s\x1b[0m', `Role for my Page is PURCHASER...\n`);
        socialWorkerId = null;
        auditorId = null;
        purchaserId = panelFlaskUserId;
        supervisorId = null;
        swIds = await this.userService
          .getFlaskSwIds()
          .then((r) => r.map((s) => s.id));
        ngoIds = await this.ngoService
          .getFlaskNgos()
          .then((r) => r.map((s) => s.id)); // all ngos
        children = await this.childrenService.countChildren(ngoIds);
      }

      if (role === SAYPlatformRoles.NGO_SUPERVISOR) {
        console.log(
          '\x1b[33m%s\x1b[0m',
          `Role for my Page is NGO_SUPERVISOR...\n`,
        );
        socialWorkerId = null;
        auditorId = null;
        purchaserId = null;
        supervisorId = panelFlaskUserId;

        // for ngo supervisor
        const supervisor = await this.userService.getFlaskSocialWorker(panelFlaskUserId);
        swIds = await this.userService
          .getFlaskSocialWorkerByNgo(supervisor.ngo_id)
          .then((r) => r.map((s) => s.id));

        ngoIds = [supervisor.ngo_id];
        children = await this.childrenService.countChildren(ngoIds);
      }
      const allSignaturesNeedFlaskId =
        await this.walletService.getSignaturesFlaskNeedId();
      const needsIdList = allSignaturesNeedFlaskId.map((s) => s.flaskNeedId);

      arrivals = await this.ngoService.getNgoArrivals(socialWorkerId, swIds);
      notConfirmedCount = await this.needService.getNotConfirmedNeeds(
        socialWorkerId,
        swIds,
        ngoIds,
      );

      notPaid = await this.needService.getNotPaidNeeds(
        {
          page: page,
          limit: limit,
          path: '/',
        },
        socialWorkerId,
        auditorId,
        purchaserId,
        supervisorId,
        swIds,
        ngoIds,
      );

      paid = await this.needService.getPaidNeeds(
        {
          page: page,
          limit: limit,
          path: '',
        },
        socialWorkerId,
        auditorId,
        purchaserId,
        supervisorId,
        swIds,
        ngoIds,
      );

      purchased = await this.needService.getPurchasedNeeds(
        {
          page: page,
          limit: limit,
          path: '',
        },
        socialWorkerId,
        auditorId,
        purchaserId,
        supervisorId,
        swIds,
        ngoIds,
      );

      delivered = await this.needService.getDeliveredNeeds(
        {
          page: page,
          limit: limit,
          path: '',
        },
        socialWorkerId,
        auditorId,
        purchaserId,
        supervisorId,
        swIds,
        ngoIds,
        needsIdList,
      );

      allNeeds = [
        [...notPaid.data],
        [...paid.data],
        [...purchased.data],
        [...delivered.data],
      ];

      const time2 = new Date().getTime();
      timeDifferenceWithComment(time1, time2, 'Fetched Flask In ');
    } catch (e) {
      throw new ServerError(e.message, e.status);
    }

    const modifiedNeedList = [];
    const time3 = new Date().getTime();
    // add IPFS + tickets for every need
    try {
      let tickets: TicketEntity[];
      let signatures: SignatureEntity[];
      let ipfs: IpfsEntity;
      if (role === SAYPlatformRoles.AUDITOR) {
        tickets = await this.ticketService.getTickets();
      } else {
        tickets = await this.ticketService.getUserTickets(panelFlaskUserId);
      }
      console.log(
        '\x1b[33m%s\x1b[0m',
        `Taking care of Need signatures + Tickets...\n`,
      );

      for (let i = 0; i < allNeeds.length; i++) {
        for (let k = 0; k < allNeeds[i].length; k++) {
          const fetchedNeed = allNeeds[i][k];
          const needTickets = tickets.filter(
            (t) => allNeeds[i][k].id === t.flaskNeedId,
          );
          // signatures only at the my page last column
          //  UPDATE: we decided to snot show signatures on page reload since they have a dedicated page
          // If you removing the code, remember need.signatures need to be fixed on front-end side as well
          if (i === 3) {
            signatures = await this.walletService.getNeedSignatures(
              fetchedNeed.id,
            );
            ipfs = null;
            if (
              signatures &&
              signatures.length > 0 &&
              signatures.find((s) => s.role === SAYPlatformRoles.AUDITOR)
            ) {
              ipfs = await this.ipfsService.getNeedIpfs(fetchedNeed.id);
            }
          }
          // End of UPDATE ------------------------------------------------------

          const modifiedNeed = {
            tickets: needTickets,
            signatures,
            ipfs,
            ...fetchedNeed,
          };
          modifiedNeedList.push(modifiedNeed);
        }
      }
    } catch (e) {
      throw new ServerError(e.message, e.status);
    }

    const time4 = new Date().getTime();
    timeDifferenceWithComment(time3, time4, 'First organize In ');

    const time5 = new Date().getTime();
    const organizedNeeds = getOrganizedNeeds(modifiedNeedList);
    const time6 = new Date().getTime();
    timeDifferenceWithComment(time5, time6, 'Second organize In ');

    const paidCount = paid.meta.totalItems;
    const notPaidCount = notPaid.meta.totalItems;
    const purchasedCount = purchased.meta.totalItems;
    const deliveredCount = delivered.meta.totalItems;

    const max = Math.max(
      paidCount,
      notPaidCount,
      purchasedCount,
      deliveredCount,
    );
    console.log('X_LIMIT2');
    console.log(X_LIMIT);
    console.log(X_TAKE);
    console.log(limit);
    console.log(page);

    return {
      page,
      limit,
      max:
        paidCount === max
          ? paidCount
          : notPaidCount === max
          ? notPaidCount
          : purchasedCount === max
          ? purchasedCount
          : deliveredCount,
      meta: {
        paid: paidCount,
        notPaid: notPaidCount,
        purchased: purchasedCount,
        delivered: deliveredCount,
        total: notPaidCount + paidCount + purchasedCount + deliveredCount,
        realNotConfirmCount: notConfirmedCount,
        realConfirmCount:
          notPaidCount +
          paidCount +
          purchasedCount +
          deliveredCount -
          notConfirmedCount,
      },
      panelFlaskUserId,
      typeId,
      needs: organizedNeeds,
      children,
      arrivals,
    };
  }
}
