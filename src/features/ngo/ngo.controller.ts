import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Req,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  FlaskUserTypesEnum,
  SAYPlatformRoles,
} from 'src/types/interfaces/interface';
import { convertFlaskToSayRoles } from 'src/utils/helpers';
import { SyncService } from '../sync/sync.service';
import { UserService } from '../user/user.service';

import { NgoService } from './ngo.service';
import { isAuthenticated } from 'src/utils/auth';

@ApiTags('Ngo')
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskId',
  description: 'to use cache and flask authentication',
  required: true,
})
@Controller('ngo')
export class NgoController {
  constructor(
    private ngoService: NgoService,
    private userService: UserService,
    private syncService: SyncService,
  ) {}

  @Get(`all`)
  @ApiOperation({ description: 'Get all ngos' })
  async getNgos(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
    return await this.ngoService.getNgos();
  }

  @Get(`arrivals/:swId`)
  async getNgoArrivals(@Req() req: Request, @Param('swId') swId: number) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(403, 'You Are not authorized');
    }
    let socialWorkerId: number;
    let swIds: number[];
    const socialWorker = await this.userService.getFlaskSocialWorker(swId);
    const roleId = convertFlaskToSayRoles(socialWorker.type_id);
    if (roleId === SAYPlatformRoles.SOCIAL_WORKER) {
      socialWorkerId = swId;
    }
    if (roleId === SAYPlatformRoles.AUDITOR) {
      socialWorkerId = null;
      swIds = await this.userService
        .getFlaskSwIds()
        .then((r) => r.map((s) => s.id));
    }
    if (roleId === SAYPlatformRoles.PURCHASER) {
      socialWorkerId = null;
      swIds = await this.userService
        .getFlaskSwIds()
        .then((r) => r.map((s) => s.id));
    }
    if (roleId === SAYPlatformRoles.NGO_SUPERVISOR) {
      socialWorkerId = null;
      swIds = await this.userService
        .getFlaskSocialWorkerByNgo(socialWorker.ngo_id)
        .then((r) => r.map((s) => s.id));
    }
    return await this.ngoService.getNgoArrivals(socialWorkerId, swIds);
  }

  @Patch(`arrivals/update/:flaskUserId/:deliveryCode/:arrivalCode`)
  async updateNgoArrivals(
    @Req() req: Request,
    @Param('flaskUserId') flaskUserId: number,
    @Param('deliveryCode') deliveryCode: string,
    @Param('arrivalCode') arrivalCode: string,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
    const flaskSocialWorker = await this.userService.getFlaskSocialWorker(
      flaskUserId,
    );
    const ngo = await this.syncService.syncContributorNgo(flaskSocialWorker);

    return await this.ngoService.updateNgoArrivals(
      ngo,
      deliveryCode,
      arrivalCode,
    );
  }
}
