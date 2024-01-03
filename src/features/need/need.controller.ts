import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Req,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UserService } from '../user/user.service';
import { NeedService } from './need.service';
import { isAuthenticated } from 'src/utils/auth';
import {
  AnnouncementEnum,
  FlaskUserTypesEnum,
  NeedTypeEnum,
  ProductStatusEnum,
  SUPER_ADMIN_ID,
} from 'src/types/interfaces/interface';
import config from 'src/config';
import { daysDifference } from 'src/utils/helpers';
import axios from 'axios';
import { NgoService } from '../ngo/ngo.service';
import { format } from 'date-fns';
import { TicketService } from '../ticket/ticket.service';

@ApiTags('Needs')
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskId',
  description: 'to use cache and flask authentication',
  required: true,
})
@Controller('needs')
export class NeedController {
  constructor(
    private needService: NeedService,
    private userService: UserService,
    private ngoService: NgoService,
    private ticketService: TicketService,
    
  ) {}

  @Get(`all`)
  @ApiOperation({ description: 'Get all needs from db 1' })
  async getNeeds(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    return await this.needService.getNeeds();
  }

  @Get(`:needId`)
  @ApiOperation({ description: 'Get one need' })
  async getANeed(@Req() req: Request, @Param('needId') needId: string) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    return await this.needService.getNeedById(needId);
  }

  @Get(`flask/random`)
  @ApiOperation({ description: 'Get a random need from flask' })
  async getRandomNeed(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    return await this.needService.getFlaskRandomNeed();
  }

  @Get(`flask/arriving/:code`)
  @ApiOperation({ description: 'Get all done needs from flask' })
  async getFlaskNeedsByDeliveryCode(
    @Req() req: Request,
    @Param('code') code: string,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }
    return await this.needService.getFlaskNeedsByDeliveryCode(code);
  }

  @Get(`flask/auditedBy/:flaskUserId`)
  @ApiOperation({ description: 'Get all done needs from flask' })
  async getFlaskAuditorNeeds(
    @Req() req: Request,
    @Param('flaskUserId') flaskUserId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }
    return await this.needService.getFlaskAuditorNeeds(flaskUserId);
  }

  @Get(`nest/auditedBy/:flaskUserId`)
  @ApiOperation({ description: 'Get all done needs from nest' })
  async getNestAuditorNeeds(
    @Req() req: Request,
    @Param('flaskUserId') flaskUserId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }
    return await this.needService.getNestAuditorNeeds(flaskUserId);
  }

  @Get(`nest/purchasedBy/:flaskUserId`)
  @ApiOperation({ description: 'Get all done needs from nest' })
  async getNestPurchaserNeeds(
    @Req() req: Request,
    @Param('flaskUserId') flaskUserId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }
    return await this.needService.getNestPurchaserNeeds(flaskUserId);
  }

  @Get(`flask/:id`)
  @ApiOperation({ description: 'Get a need from db 2' })
  async getFlaskNeed(@Req() req: Request, @Param('id') id: number) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }
    return await this.needService.getFlaskNeed(id);
  }

  @Get(`one/:needFlaskId`)
  @ApiOperation({ description: 'Get a need from db 2' })
  async getNeedByFlaskId(
    @Req() req: Request,
    @Param('needFlaskId') needFlaskId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }
    return await this.needService.getNeedByFlaskId(needFlaskId);
  }

  @Get('flask/preneeds/templates')
  @ApiOperation({ description: 'Get all done needs from flask' })
  async getPrNeed(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }
    const token =
      config().dataCache.fetchPanelAuthentication(panelFlaskUserId).token;
    const preNeeds = await this.needService.getFlaskPreNeed(token);

    return preNeeds;
  }

  @Get(`unconfirmed/:swId`)
  @ApiOperation({ description: 'Get all done needs from flask' })
  async getNotConfirmedNeeds(
    @Req() req: Request,
    @Param('swId') socialWorkerId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];

    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }

    const socialWorker = await this.userService.getFlaskSocialWorker(
      socialWorkerId,
    ); // sw ngo
    return await this.needService.getNotConfirmedNeeds(socialWorkerId, null, [
      socialWorker.ngo_id,
    ]);
  }

  @Get('duplicates/:flaskChildId/:flaskNeedId')
  @ApiOperation({ description: 'Get duplicates need for confirming' })
  async getDuplicateNeeds(
    @Req() req: Request,
    @Param('flaskChildId') flaskChildId: number,
    @Param('flaskNeedId') flaskNeedId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }

    return await this.needService.getDuplicateNeeds(flaskChildId, flaskNeedId);
  }

  @Get('delete/candidates')
  @ApiOperation({ description: 'Get old needs to delete if not paid.' })
  async deleteCandidates(@Req() req: Request) {
    // delete old confirmed needs
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN ||
      panelFlaskUserId !== SUPER_ADMIN_ID
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    const deleteCandidates = await this.needService.getDeleteCandidates();

    return { list: deleteCandidates[0], total: deleteCandidates[1] };
  }

  @Get('update/candidates')
  @ApiOperation({ description: 'Get arrived needs to update them' })
  async updateArrivalsCandidates(@Req() req: Request) {
    // delete old confirmed needs
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN ||
      panelFlaskUserId !== SUPER_ADMIN_ID
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    const updateCandidates =
      await this.needService.getArrivalUpdateCandidates();

    return { list: updateCandidates[0], total: updateCandidates[1] };
  }

  @Get('delete/old')
  @ApiOperation({ description: 'Get duplicates need for confirming' })
  async deleteOldNeeds(@Req() req: Request) {
    // delete old confirmed needs
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN ||
      panelFlaskUserId !== SUPER_ADMIN_ID
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    const deleteCandidates = await this.needService.getDeleteCandidates();
    for await (const need of deleteCandidates[0]) {
      const daysDiff = daysDifference(need.confirmDate, new Date());
      if (daysDiff > 90) {
        const accessToken =
          config().dataCache.fetchPanelAuthentication(panelFlaskUserId).token;
        await this.needService.deleteFlaskOneNeed(need.id, accessToken);
      }
    }
    return { deleted: deleteCandidates[1] };
  }

  @Get('update/arrivals')
  async updateNeedsStatus(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN ||
      panelFlaskUserId !== SUPER_ADMIN_ID
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }

    const swIds = await this.userService
      .getFlaskSwIds()
      .then((r) => r.map((s) => s.id)); // all ngos

    const ngoIds = await this.ngoService
      .getFlaskNgos()
      .then((r) => r.map((s) => s.id));

    const needs = await this.needService.getArrivalUpdateCandidates();

    const token =
      config().dataCache.fetchPanelAuthentication(panelFlaskUserId).token;

    const configs = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };
    console.log(needs[1]);

    for await (const need of needs[0]) {
      const formData = new FormData();
      if (
        need.type === NeedTypeEnum.PRODUCT &&
        need.status === ProductStatusEnum.PURCHASED_PRODUCT
      ) {
        const ticket = await this.ticketService.getTicketByNeed(need.id);
        console.log('ticket');
        console.log(ticket);
        console.log(need.id);
        try {
          if (ticket && ticket.ticketHistories) {
            const { data } = await axios.patch(
              `https://api.sayapp.company/api/v2/need/update/needId=${need.id}`,
              {
                status: ProductStatusEnum.DELIVERED_TO_NGO,
                ngo_delivery_date: format(
                  new Date(
                    ticket.ticketHistories.find(
                      (h) => h.announcement == AnnouncementEnum.ARRIVED_AT_NGO,
                    ).announcedArrivalDate,
                  ),
                  'yyyy-MM-dd',
                ),
              },
              configs,
            );
            console.log(data);
            console.log(formData);
            console.log(need.id);
          }
        } catch (e) {
          console.log(e);
        }
      }
    }
  }
}
