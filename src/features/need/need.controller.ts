import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Req,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UserService } from '../user/user.service';
import { NeedService } from './need.service';
import { isAuthenticated } from 'src/utils/auth';
import {
  FlaskUserTypesEnum,
  PanelContributors,
  PaymentStatusEnum,
  SAYPlatformRoles,
  SUPER_ADMIN_ID,
} from 'src/types/interfaces/interface';
import config from 'src/config';
import { convertFlaskToSayRoles, daysDifference } from 'src/utils/helpers';
import { SyncService } from '../sync/sync.service';
import { NeedStatusUpdatesAPIApi } from 'src/generated-sources/openapi';
import { ServerError } from 'src/filters/server-exception.filter';

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
    private syncService: SyncService,
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
      throw new ForbiddenException(403, 'You Are not the Super admin');
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
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
    return await this.needService.getNeedById(needId);
  }

  @Get(`delete/candidates`)
  @ApiOperation({ description: 'Get all needs from db 1' })
  async getCandidates(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN ||
      panelFlaskUserId !== SUPER_ADMIN_ID
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
    return await this.needService.getDeleteCandidates();
  }

  @Get(`flask/random`)
  @ApiOperation({ description: 'Get a random need from flask' })
  async getRandomNeed(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
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

  @Get(`preneeds`)
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
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      convertFlaskToSayRoles(panelFlaskTypeId) === SAYPlatformRoles.AUDITOR
    ) {
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
      throw new ForbiddenException(403, 'You Are not the Super admin');
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
  }

  // temp
  @Patch(`contributors/`)
  async updateNeedContributor(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
    const accessToken =
      config().dataCache.fetchPanelAuthentication(panelFlaskUserId).token;

    const allNeeds = await this.needService.getNeedsWithSignatures();

    let purchaserId: number;
    try {
      let counter = 0;
      for await (const need of allNeeds) {
        counter++;
        const flaskNeed = await this.needService.getFlaskNeed(need.flaskId);
        const statusApi = new NeedStatusUpdatesAPIApi();
        console.log('\x1b[36m%s\x1b[0m', `starting ${need.flaskId} ...\n`);

        const statuses = await statusApi.apiV2NeedStatusUpdatesGet(
          accessToken,
          null,
          null,
          null,
          flaskNeed.id,
        );

        if (!statuses || !statuses[0]) {
          console.log('\x1b[36m%s\x1b[0m', `status ...\n`);

          // we do not have a history of purchaser id before implementing our new features
          if (new Date(flaskNeed.doneAt).getFullYear() < 2023) {
            purchaserId = 31; // Nyaz
          }
          if (
            new Date(flaskNeed.doneAt).getFullYear() === 2023 &&
            new Date(flaskNeed.doneAt).getMonth() <= 3
          ) {
            purchaserId = 21; // Neda
          }
        } else {
          console.log('\x1b[36m%s\x1b[0m', `find ...\n`);
          purchaserId = statuses.find(
            (s) => s.oldStatus === PaymentStatusEnum.COMPLETE_PAY,
          )?.swId;
        }

        if (!purchaserId) {
          throw new ServerError('No purchaser Id!', 500);
        }
        const flaskPurchaser = await this.userService.getFlaskSocialWorker(
          purchaserId,
        );

        const purchaserDetails = {
          typeId: flaskPurchaser.type_id,
          firstName: flaskPurchaser.firstName,
          lastName: flaskPurchaser.lastName,
          avatarUrl: flaskPurchaser.avatar_url,
          flaskUserId: flaskPurchaser.id,
          birthDate:
            flaskPurchaser.birth_date && new Date(flaskPurchaser.birth_date),
          panelRole: PanelContributors.PURCHASER,
          userName: flaskPurchaser.userName,
        };
        const purchaserNgo = await this.syncService.syncContributorNgo(
          flaskPurchaser,
        );

        if (!purchaserNgo) {
          throw new ServerError('No purchaserNgo!', 500);
        }
        console.log('\x1b[36m%s\x1b[0m', 'Creating an auditor ...\n');
        const purchaser = await this.userService.createContributor(
          purchaserDetails,
          purchaserNgo,
        );

        const flaskAuditor = await this.userService.getFlaskSocialWorker(
          flaskNeed.confirmUser,
        );

        const auditorDetails = {
          typeId: flaskAuditor.type_id,
          firstName: flaskAuditor.firstName,
          lastName: flaskAuditor.lastName,
          avatarUrl: flaskAuditor.avatar_url,
          flaskUserId: flaskAuditor.id,
          birthDate:
            flaskAuditor.birth_date && new Date(flaskAuditor.birth_date),
          panelRole: PanelContributors.AUDITOR,
          userName: flaskAuditor.userName,
        };
        const auditorNgo = await this.syncService.syncContributorNgo(
          flaskAuditor,
        );
        console.log('\x1b[36m%s\x1b[0m', 'Creating an auditor ...\n');
        const auditor = await this.userService.createContributor(
          auditorDetails,
          auditorNgo,
        );
        if (!auditor || !purchaser) {
          console.log(auditorDetails);
          console.log(auditor);
          console.log('purchalllllllllllllllllllllllllllllllser');
          console.log(purchaser);
          throw new ServerError('whut');
        }
        if (purchaser.flaskUserId === 22) {
          console.log(purchaser);
          console.log(purchaserId);
          console.log(statuses);
          console.log(flaskNeed);

          throw new ServerError('huuuuh');
        }
        await this.needService.updateNeedContributors(
          need.id,
          auditor,
          purchaser,
        );
        for (let i = 0; i < counter * 5; i++) {
          console.log('wasting time..' + counter);
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
}
