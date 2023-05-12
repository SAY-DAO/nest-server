import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IpfsService } from './ipfs.service';

@ApiTags('IPFS')
@Controller('ipfs')
export class IpfsController {
  constructor(private readonly ipfsService: IpfsService) { }

  @Get(`all`)
  @ApiOperation({ description: 'Get all IPFS' })
  async getProviders() {
    return await this.ipfsService.getAllIpfs()
  }

}

