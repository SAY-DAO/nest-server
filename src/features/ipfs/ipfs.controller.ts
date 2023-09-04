import { Controller, ForbiddenException, Get, Req } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { IpfsService } from './ipfs.service';
import { FlaskUserTypesEnum } from 'src/types/interfaces/interface';
import { isAuthenticated } from 'src/utils/auth';

@ApiTags('IPFS')
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskId',
  description: 'to use cache and flask authentication',
  required: true,
})
@Controller('ipfs')
export class IpfsController {
  constructor(private readonly ipfsService: IpfsService) {}

  @Get(`all`)
  @ApiOperation({ description: 'Get all IPFS' })
  async getProviders(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }

    return await this.ipfsService.getAllIpfs();
  }
}
