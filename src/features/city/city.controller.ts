import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CityService } from './city.service';

@ApiTags('City')
@Controller('city')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Get(`all`)
  @ApiOperation({ description: 'Get all ngos' })
  async getCities() {
    return await this.cityService.getCities();
  }

}
