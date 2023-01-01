import { Body, Controller, Get, Post, Query, Response } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NeedTypeEnum, RolesEnum } from '../../types/interface';
import { CreateNeedDto } from '../../types/dtos/CreateNeed.dto';
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
import { AuthenticationService } from '../authentication/auth.service';


export const NEEDS_URL = 'http://localhost:3000/api/dao/sync/update';

@ApiTags('Needs')
@Controller('needs')
export class NeedController {
  constructor(private needService: NeedService,
    private childrenService: ChildrenService,
    private userService: UserService,
    private ngoService: NgoService,
    private authService: AuthenticationService,
  ) { }

  @Get(`flask/random`)
  @ApiOperation({ description: 'Get all done needs from flask' })
  async getRandomNeed() {
    return await this.needService.getRandomNeed()

  }

  @Get(`flask/preneed`)
  @ApiOperation({ description: 'Get all done needs from flask' })
  async getPrNeed() {
    const accessToken = await this.authService.authPanel()
    const preNeeds = await this.needService.getPreNeed(accessToken)
    return preNeeds
  }

  @Get(`flask/all`)
  @ApiOperation({ description: 'Get all needs from flask' })
  async getNeeds(@Query('skip') skip = 0, @Query('take') take = 100) {
    const accessToken = await this.authService.authPanel()
    take = take > 100 ? 100 : take;
    return await this.needService.getNeeds(accessToken, {
      X_TAKE: Number(take),
      X_SKIP: Number(skip),
    })
  }


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

  @Post(`add`)
  @ApiOperation({ description: 'Create one need' })
  async createNeed(@Body(ValidateNeedPipe) request: CreateNeedDto) {
    let theNgo = await this.ngoService.getNgo(
      request.ngoId
    );
    //  if ngo does not exist create
    if (!theNgo) {
      let newNgo: NgoParams;
      try {
        newNgo = {
          flaskNgoId: request.ngoId,
        };

        theNgo = await this.ngoService.createNgo(newNgo);
      } catch (e) {
        throw new AllExceptionsFilter(e);
      }
    }

    let supervisor = await this.userService.getSocialWorker(
      request.confirmUser
    );
    //  if supervisor does not exist create
    if (!supervisor) {
      let newSupervisor: SocialWorkerParams;
      try {
        newSupervisor = {
          flaskSwId: request.confirmUser,
          typeId: RolesEnum.SAY_SUPERVISOR,
          ngo: theNgo
        };

        supervisor = await this.userService.createSocialWorker(newSupervisor);
      } catch (e) {
        throw new AllExceptionsFilter(e);
      }
    }

    let socialWorker = await this.userService.getSocialWorker(
      request.createdById
    );
    //  if social worker does not exist create
    if (!socialWorker) {
      let newSocialWorker: SocialWorkerParams;
      try {
        newSocialWorker = {
          flaskSwId: request.createdById,
          typeId: RolesEnum.SOCIAL_WORKER,
          ngo: theNgo
        };

        socialWorker = await this.userService.createSocialWorker(newSocialWorker);
      } catch (e) {
        throw new AllExceptionsFilter(e);
      }
    }
    let need: NeedEntity
    const newNeed = {
      flaskNeedId: request.needId,
      flaskChildId: request.childId,
      flaskNgoId: request.ngoId,
      flaskSupervisorId: request?.confirmUser,
      title: request.title,
      affiliateLinkUrl: request.affiliateLinkUrl,
      link: request.link,
      bankTrackId: request.bankTrackId,
      category: request.category,
      childGeneratedCode: request?.childGeneratedCode,
      childSayName: request.childSayName,
      childDeliveryDate:
        request.childDeliveryDate &&
        new Date(request.childDeliveryDate),
      confirmDate:
        request.confirmDate &&
        new Date(request?.confirmDate),
      cost: request.cost,
      created:
        request.created && new Date(request?.created),
      socialWorker: socialWorker,
      supervisor: supervisor,
      flaskSwId: request?.createdById,
      deletedAt:
        request.deleted_at &&
        new Date(request?.deleted_at),
      description: request.description, // { en: '' , fa: ''}
      descriptionTranslations: request.descriptionTranslations, // { en: '' , fa: ''}
      titleTranslations: request.titleTranslations,
      details: request.details,
      doingDuration: request.doing_duration,
      donated: request.donated,
      doneAt:
        request.doneAt && new Date(request?.doneAt),
      expectedDeliveryDate:
        request.expectedDeliveryDate &&
        new Date(request?.expectedDeliveryDate),
      information: request.information,
      isConfirmed: request.isConfirmed,
      isDeleted: request.isDeleted,
      isDone: request.isDone,
      isReported: request.isReported,
      isUrgent: request.isUrgent,
      ngo: theNgo,
      ngoAddress: request.ngoAddress,
      ngoName: request.ngoName,
      ngoDeliveryDate:
        request.ngoDeliveryDate &&
        new Date(request?.ngoDeliveryDate),
      oncePurchased: request.oncePurchased,
      paid: request.paid,
      purchaseCost: request.purchaseCost,
      purchaseDate:
        request.purchaseDate &&
        new Date(request?.purchaseDate),
      receiptCount: request.receiptCount,
      status: request.status,
      statusDescription: request.statusDescription,
      statusUpdatedAt:
        request.statusUpdatedAt &&
        new Date(request?.statusUpdatedAt),
      type: request.type === 0 ? NeedTypeEnum.SERVICE : NeedTypeEnum.PRODUCT,
      typeName: request.typeName,
      unavailableFrom:
        request.unavailableFrom &&
        new Date(request?.unavailableFrom),
      unconfirmedAt:
        request.unconfirmedAt &&
        new Date(request?.unconfirmedAt),
      unpaidCost: request.unpaidCost,
      unpayable: request.unpayable,
      unpayableFrom:
        request.unpayableFrom &&
        new Date(request?.unpayableFrom),
      updated:
        request.updated && new Date(request?.updated),
      imageUrl: request.imageUrl,
      needRetailerImg: request.needRetailerImg,
      progress: request?.progress,
    };
    const theChild = await this.childrenService.getChildById(request.childId)
    try {
      need = await this.needService.createNeed(theChild, newNeed)
    } catch (e) {
      throw new ServerError(e);
    }
    return need;
  }

}
