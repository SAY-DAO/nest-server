import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import config from '../../config';
import { AnalyticPublicService } from './public.analytic.service';
import { CheckPointService } from '../checkpoint/checkpoint.service';
import {
  NeedTypeEnum,
  VirtualFamilyRole,
} from 'src/types/interfaces/interface';

@ApiTags('Analytic/public')
@Controller('analytic/public')
export class AnalyticPublicController {
  constructor(
    private readonly checkPointService: CheckPointService,
    private readonly analyticPublicService: AnalyticPublicService,
  ) {}

  @Get('needs/delivered/:needType')
  @ApiOperation({ description: 'Get all delivered needs from flask' })
  async getNeedsAnalytic(
    @Param('needType') needType: NeedTypeEnum,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const p = Math.max(Number.parseInt(page, 10) || 1, 1);
    const l = Math.max(Number.parseInt(limit, 10) || 10, 1);
    const [items, total] =
      await this.analyticPublicService.getDeliveredNeedsAnalytic(
        needType,
        p,
        l,
      );

    return { delivered: items, count: total, page: p, limit: l };
  }

  @Get('summary')
  @ApiOperation({ description: 'get summary of totals' })
  async getSummaryAnalytic() {
    return this.analyticPublicService.getSummary();
  }

  @Get('transactions')
  @ApiOperation({ description: 'get needs payments' })
  async getTransactionsAnalytic(@Req() req: Request) {
    const X_LIMIT = parseInt(req.headers['x-limit']);
    const X_TAKE = parseInt(req.headers['x-take']);
    const limit = X_LIMIT > 100 ? 100 : X_LIMIT;
    const page = X_TAKE ? X_TAKE + 1 : 1;

    return this.analyticPublicService.getTransactions({
      page: page,
      limit: limit,
      path: '/',
    });
  }

  @Get('season-comparison')
  getSeasonComparison(@Query('season') season?: string) {
    return this.analyticPublicService.getSeasonComparison(season);
  }

  @Get('family/scattered')
  async getFamilyRoleScattered() {
    return config().dataCache.roleScatteredData();
  }

  @Get('checkpoints')
  @ApiOperation({
    description: 'Get latest 20 checkpoints (by checkpoint date)',
  })
  async getAll() {
    try {
      return this.checkPointService.findLatest20();
    } catch (e) {
      console.log(e);
    }
  }

  @Get('children/network')
  getAvailableContributions() {
    return this.analyticPublicService.getTheNetwork();
  }
}
