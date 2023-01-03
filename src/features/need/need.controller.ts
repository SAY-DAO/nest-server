import { Body, Controller, Get, Post, Query, Req, Response } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NeedTypeEnum, RolesEnum } from '../../types/interface';
import { NeedDto } from '../../types/dtos/CreateNeed.dto';
import { ChildrenService } from '../children/children.service';
import { NeedService } from './need.service';
import { ValidateNeedPipe } from './pipes/validate-need.pipe';
import { NeedEntity } from '../../entities/need.entity';
import { ServerError } from '../../filters/server-exception.filter';
import { UserService } from '../user/user.service';
import { SocialWorkerParams } from '../../types/parameters/UserParameters';
import { AllExceptionsFilter } from '../../filters/all-exception.filter';
import { NgoService } from '../ngo/ngo.service';
import { NgoParams } from '../../types/parameters/NgoParammeters';


export const NEEDS_URL = 'http://localhost:3000/api/dao/sync/update';

@ApiTags('Needs')
@Controller('needs')
export class NeedController {
  constructor(private needService: NeedService,
    private childrenService: ChildrenService,
    private userService: UserService,
    private ngoService: NgoService,
  ) { }

  @Get(`flask/random`)
  @ApiOperation({ description: 'Get all done needs from flask' })
  async getRandomNeed() {
    return await this.needService.getRandomNeed()

  }

  @Get(`flask/preneed`)
  @ApiOperation({ description: 'Get all done needs from flask' })
  async getPrNeed(@Req() req: Request) {
    const accessToken = req.headers["authorization"]
    const preNeeds = await this.needService.getPreNeed(accessToken)
    return preNeeds
  }

  @Get(`flask/all`)
  @ApiOperation({ description: 'Get all needs from flask' })
  async getNeeds(@Req() req: Request, @Query('skip') skip = 0, @Query('take') take = 100) {
    const accessToken = req.headers["authorization"]
    take = take > 100 ? 100 : take;
    return await this.needService.getNeeds(
      {
        accessToken: accessToken,
        X_TAKE: Number(take),
        X_SKIP: Number(skip),
      },
      {}
    )
  }

  NeedApiParams


  @Get(`all/done`)
  @ApiOperation({ description: 'Get all done needs from flask' })
  async getDoneNeeds() {
    const doneNeeds = await this.needService.getDoneNeeds()
    return doneNeeds.length

  }

  @Get(`:flaskNeedId`)
  @ApiOperation({ description: 'Get one need' })
  async getOneNeed(@Query('flaskNeedId') flaskNeedId: number) {
    let need: NeedEntity
    try {
      need = await this.needService.getNeedById(flaskNeedId)
    } catch (e) {
      throw new ServerError(e);
    }
    return need;
  }



}
