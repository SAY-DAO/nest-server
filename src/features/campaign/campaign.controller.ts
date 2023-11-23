import {
  Controller,
  Get,
  Req,
  ForbiddenException,
  Post,
  Body,
  Res,
  Param,
} from '@nestjs/common';
import { ApiHeader, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { FlaskUserTypesEnum } from 'src/types/interfaces/interface';
import { isAuthenticated } from 'src/utils/auth';
import { CampaignService } from './campaign.service';
import { ShortenURLDto } from 'src/types/dtos/url.dto';
import { ServerError } from 'src/filters/server-exception.filter';

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
      throw new ForbiddenException('You Are not authorized');
    }

    return this.campaignService.getCampaigns();
  }

  @Get(':code')
  async redirect(@Res() res, @Param('code') code: string) {
    const url = await this.campaignService.redirect(code);
    if (!url) {
      throw new ServerError('Could not find the url', 500);
    }
    return res.redirect(url.longUrl);
  }

  @Post('shorten')
  shortenUrl(@Body() longUrl: ShortenURLDto) {
    return this.campaignService.shortenUrl(longUrl);
  }
}
