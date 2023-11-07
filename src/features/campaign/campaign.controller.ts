import { Controller, Get, Req, ForbiddenException } from '@nestjs/common';
import { ApiHeader, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { FlaskUserTypesEnum } from 'src/types/interfaces/interface';
import { isAuthenticated } from 'src/utils/auth';
import { CampaignService } from './campaign.service';

@ApiTags('Campaign')
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskId',
  description: 'to use cache and flask authentication',
  required: true,
})
@Controller('campaign')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Get('/all')
  getAvailableContributions(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      !(
        panelFlaskTypeId === FlaskUserTypesEnum.SUPER_ADMIN ||
        panelFlaskTypeId === FlaskUserTypesEnum.ADMIN
      )
    ) {
      throw new ForbiddenException(403, 'You Are not authorized');
    }

    return this.campaignService.getCampaigns();
  }
}
