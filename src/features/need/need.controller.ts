import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateNeedDto } from '../../types/dtos/CreateNeed.dto';
import { ChildrenService } from '../children/children.service';
import { NeedService } from './need.service';

export const NEEDS_URL = 'http://localhost:3000/api/dao/sync/update';


@ApiTags('Needs')
@Controller('needs')
export class NeedController {
  constructor(private needService: NeedService,
    private childrenService: ChildrenService) { }

  @Get(`all`)
  @ApiOperation({ description: 'Get all needs from flask' })
  async getNeeds(@Query('page') page = 1, @Query('limit') limit = 10) {
    limit = limit > 100 ? 100 : limit;
    return await this.needService.getNeeds({
      limit: Number(limit),
      page: Number(page),
      route: NEEDS_URL
    })
  }


  @Get(`all/done`)
  @ApiOperation({ description: 'Get all needs from flask' })
  async getDoneNeeds() {
    const doneNeeds = await this.needService.getDoneNeeds()
    return doneNeeds.length

  }

  @Get(`:needId`)
  @ApiOperation({ description: 'Get one need' })
  async getOneNeed(@Query('needId', ParseIntPipe) needId: number) {
    return await this.needService.getNeedById(needId);
  }

  @Post(`add`)
  @ApiOperation({ description: 'Get one need' })
  async createNeed(@Body() { request: data }: { request: CreateNeedDto }) {
    const newNeed = {
      childId: data.childId,
      needId: data.needId,
      title: data.title,
      affiliateLinkUrl: data.affiliateLinkUrl,
      bankTrackId: data.bankTrackId,
      category: data.category,
      childGeneratedCode: data?.childGeneratedCode,
      childSayName: data.childSayName,
      childDeliveryDate:
        data.childDeliveryDate &&
        new Date(data.childDeliveryDate),
      confirmDate:
        data.confirmDate &&
        new Date(data?.confirmDate),
      confirmUser: data.confirmUser,
      cost: data.cost,
      created:
        data.created && new Date(data?.created),
      createdById: data.createdById,
      deletedAt:
        data.deleted_at &&
        new Date(data?.deleted_at),
      description: data.description, // { en: '' , fa: ''}
      descriptionTranslations: data.descriptionTranslations, // { en: '' , fa: ''}
      titleTranslations: data.titleTranslations,
      details: data.details,
      doingDuration: data.doing_duration,
      donated: data.donated,
      doneAt:
        data.doneAt && new Date(data?.doneAt),
      expectedDeliveryDate:
        data.expectedDeliveryDate &&
        new Date(data?.expectedDeliveryDate),
      information: data.information,
      isConfirmed: data.isConfirmed,
      isDeleted: data.isDeleted,
      isDone: data.isDone,
      isReported: data.isReported,
      isUrgent: data.isUrgent,
      ngoId: data.ngoId,
      ngoAddress: data.ngoAddress,
      ngoName: data.ngoName,
      ngoDeliveryDate:
        data.ngoDeliveryDate &&
        new Date(data?.ngoDeliveryDate),
      oncePurchased: data.oncePurchased,
      paid: data.paid,
      purchaseCost: data.purchaseCost,
      purchaseDate:
        data.purchaseDate &&
        new Date(data?.purchaseDate),
      receiptCount: data.receiptCount,
      receipts: data.receipts,
      status: data.status,
      statusDescription: data.statusDescription,
      statusUpdatedAt:
        data.statusUpdatedAt &&
        new Date(data?.statusUpdatedAt),
      type: data.type,
      typeName: data.typeName,
      unavailableFrom:
        data.unavailableFrom &&
        new Date(data?.unavailableFrom),
      unconfirmedAt:
        data.unconfirmedAt &&
        new Date(data?.unconfirmedAt),
      unpaidCost: data.unpaidCost,
      unpayable: data.unpayable,
      unpayableFrom:
        data.unpayableFrom &&
        new Date(data?.unpayableFrom),
      updated:
        data.updated && new Date(data?.updated),
      imageUrl: data.imageUrl,
      needRetailerImg: data.needRetailerImg,
      progress: data?.progress,
    };
    const theChild = await this.childrenService.getChildById(data.childId)
    return await this.needService.createNeed(theChild, newNeed);
  }


  @Get(`child/done/:id`)
  @ApiOperation({ description: 'Get child all done need' })
  async getChildNeeds(@Param('id', ParseIntPipe) id: number) {
    const theChild = await this.childrenService.getChildById(id);
    return theChild.needs;
  }
}
