import { Controller, Get } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { IpfsService } from './ipfs.service';

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
  async getProviders() {
    return await this.ipfsService.getAllIpfs();
  }
}
