import { Controller, Get, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { NgoService } from './ngo.service';

@ApiTags('Ngo')
@Controller('ngo')
export class NgoController {
  constructor(private ngoService: NgoService) { }

  @Get(`all`)
  @ApiOperation({ description: 'Get all ngos' })
  async getNgos() {
    return await this.ngoService.getNgos();
  }

  @Get(`ngo/arrivals`)
  @ApiOperation({ description: 'Get all done needs from flask' })
  async getNgoArrivals() {
    return await this.ngoService.getNgoArrivals(null, [1, 27, 13]);
  }
}
