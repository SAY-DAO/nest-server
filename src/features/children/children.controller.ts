import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Req,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ChildrenService } from './children.service';
import { FlaskUserTypesEnum } from 'src/types/interfaces/interface';
import { isAuthenticated } from 'src/utils/auth';
import config from 'src/config';

@ApiTags('Children')
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskId',
  description: 'to use cache and flask authentication',
  required: true,
})
@Controller('children')
export class ChildrenController {
  constructor(private childrenService: ChildrenService) {}

  @Get(`all`)
  @ApiOperation({ description: 'Get all children from db' })
  async getChildren(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
    return await this.childrenService.getChildren();
  }

  @Get(`all/actives`)
  @ApiOperation({ description: 'Get all active children from flask db' })
  async getActiveChildren(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
    return await this.childrenService.getFlaskActiveChildren();
  }

  @Get(`flask/all`)
  @ApiOperation({ description: 'Get all flask children from db' })
  async getFlaskChildren(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
    return await this.childrenService.getFlaskChildren();
  }

  @Get(`flask/child/needs-summary/:childId`)
  @ApiOperation({ description: 'Get a single child needs summary by ID' })
  async getChildNeedsSummary(
    @Req() req: Request,
    @Param('childId') childId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(403, 'You Are not authorized');
    }
    const token =
      config().dataCache.fetchPanelAuthentication(panelFlaskUserId).token;
    return await this.childrenService.getChildNeedsSummery(token, childId);
  }

  @Get('/network')
  getAvailableContributions(@Req() req: Request) {
    const dappFlaskUserId = req.headers['dappFlaskUserId'];
    if (!isAuthenticated(dappFlaskUserId, FlaskUserTypesEnum.FAMILY)) {
      throw new ForbiddenException(403, 'You Are not authorized');
    }
    return this.childrenService.gtTheNetwork();
  }
}
