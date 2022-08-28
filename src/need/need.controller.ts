import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { NeedRequest } from '../requests/NeedRequest';
import { NeedService } from './need.service';

@ApiTags('Needs')
@Controller('needs')
export class NeedController {
  constructor(private needService: NeedService) {}

  @Get(`all`)
  @ApiOperation({ description: 'Get a single transaction by ID' })
  async getNeeds() {
    return await this.needService.getNeeds();
  }

  @Post(`update`)
  async updateServer(@Body() data: NeedRequest) {
    console.log(data);
    // if (request.accountId) {
    //   const accountId = request.accountId;
    //   account = await this.accountService.getAccount(accountId);
    // } else {
    //   if (!account) {
    //     throw new ObjectNotFound('No such transaction');
    //   }
    // }
    const need = await this.needService.createNeed({
      need_id: data[0].id,
      title: data[0].name,
    });
    return need;
  }
}
