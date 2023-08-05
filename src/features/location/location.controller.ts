import { Controller, Get } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { LocationService } from './location.service';

@ApiTags('Location')
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskSwId',
  description: 'to use cache and flask authentication',
  required: true,
})
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get(`all`)
  @ApiOperation({ description: 'Get all ngos' })
  async getCities() {
    return await this.locationService.getCities();
  }
}
