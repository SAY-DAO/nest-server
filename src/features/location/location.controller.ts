import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { LocationService } from './location.service';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) { }

  @Get(`all`)
  @ApiOperation({ description: 'Get all ngos' })
  async getCities() {
    return await this.locationService.getCities();
  }

}
