import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StatusService } from './status.service';
import { UpdateStatusDto } from '../../../types/dtos/status/update-status.dto';

@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) { }


  @Get()
  findAll() {
    return this.statusService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStatusDto: UpdateStatusDto) {
    return this.statusService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.statusService.remove(+id);
  }
}
