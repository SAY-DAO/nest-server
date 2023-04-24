import { Controller, Get, Param, Patch, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SAYPlatformRoles } from 'src/types/interfaces/interface';
import { convertFlaskToSayRoles } from 'src/utils/helpers';
import { SyncService } from '../sync/sync.service';
import { UserService } from '../user/user.service';

import { NgoService } from './ngo.service';

@ApiTags('Ngo')
@Controller('ngo')
export class NgoController {
  constructor(private ngoService: NgoService,
    private userService: UserService,
    private syncService: SyncService
  ) { }

  @Get(`all`)
  @ApiOperation({ description: 'Get all ngos' })
  async getNgos() {
    return await this.ngoService.getNgos();
  }

  @Get(`arrivals/:swId`)
  async getNgoArrivals(
    @Param('swId') swId: number,
  ) {
    let socialWorkerId: number;
    let swIds: number[]
    const socialWorker = await this.userService.getFlaskSocialWorker(swId)
    const roleId = convertFlaskToSayRoles(socialWorker.type_id);
    if (roleId === SAYPlatformRoles.SOCIAL_WORKER) {
      socialWorkerId = swId;
    }
    if (roleId === SAYPlatformRoles.AUDITOR) {
      socialWorkerId = null;
      swIds = await this.userService.getFlaskSwIds().then(r => r.map(s => s.id))
    }
    if (roleId === SAYPlatformRoles.PURCHASER) {
      socialWorkerId = null;
      swIds = await this.userService.getFlaskSwIds().then(r => r.map(s => s.id))
    }
    if (roleId === SAYPlatformRoles.NGO_SUPERVISOR) {
      socialWorkerId = null;
      swIds = await this.userService.getFlaskSocialWorkerByNgo(socialWorker.ngo_id).then(r => r.map(s => s.id))
    }
    return await this.ngoService.getNgoArrivals(socialWorkerId, swIds);

  }


  @Patch(`arrivals/update/:flaskUserId/:deliveryCode/:arrivalCode`)
  async updateNgoArrivals(
    @Param('flaskUserId') flaskUserId: number,
    @Param('deliveryCode') deliveryCode: string,
    @Param('arrivalCode') arrivalCode: string,
  ) {
    const flaskSocialWorker = await this.userService.getFlaskSocialWorker(
      flaskUserId,
    );
    const ngo = await this.syncService.syncContributorNgo(flaskSocialWorker)

    return await this.ngoService.updateNgoArrivals(ngo, deliveryCode, arrivalCode);

  }
}



