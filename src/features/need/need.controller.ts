import { Controller, Get, Param, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from '../user/user.service';
import { NeedService } from './need.service';

@ApiTags('Needs')
@Controller('needs')
export class NeedController {
  constructor(
    private needService: NeedService,
    private userService: UserService,
  ) { }


  @Get(`all`)
  @ApiOperation({ description: 'Get all needs from db 1' })
  async getNeeds() {
    return await this.needService.getNeeds()
  }


  @Get(`flask/random`)
  @ApiOperation({ description: 'Get all done needs from flask' })
  async getRandomNeed() {
    return await this.needService.getFlaskRandomNeed();
  }

  @Get(`flask/arriving/:code`)
  @ApiOperation({ description: 'Get all done needs from flask' })
  async getFlaskNeedsByDeliveryCode(
    @Param('code') code: string
  ) {
    return await this.needService.getFlaskNeedsByDeliveryCode(code);
  }

  @Get(`flask/:id`)
  @ApiOperation({ description: 'Get a need from db 2' })
  async getFlaskNeed(
    @Param('id') id: number
  ) {
    return await this.needService.getFlaskNeed(id)
  }

  @Get(`preneeds`)
  @ApiOperation({ description: 'Get all done needs from flask' })
  async getPrNeed(@Req() req: Request) {
    const accessToken = req.headers['authorization'];
    const preNeeds = await this.needService.getFlaskPreNeed(accessToken);
    return preNeeds;
  }

  @Get(`unconfirmed/:swId`)
  @ApiOperation({ description: 'Get all done needs from flask' })
  async getNotConfirmedNeeds(
    @Param('swId') socialWorkerId: number
  ) {
    const socialWorker = await this.userService.getFlaskSocialWorker(
      socialWorkerId,
    ); // sw ngo
    return await this.needService.getNotConfirmedNeeds(
      socialWorkerId,
      null,
      [socialWorker.ngo_id]
    );
  }

  @Get('duplicates/:flaskChildId/:flaskNeedId')
  @ApiOperation({ description: 'Get duplicates need for confirming' })
  async getDuplicateNeeds(
    @Param('flaskChildId') flaskChildId: number,
    @Param('flaskNeedId') flaskNeedId: number
  ) {
    console.log(flaskChildId, flaskNeedId)

    return await this.needService.getDuplicateNeeds(flaskChildId, flaskNeedId)
  }
}
