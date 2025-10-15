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
import { daysDifference } from '../../utils/helpers';
import { AnalyticService } from './analytic.service';
import config from '../../config';
import { AnalyticPublicService } from './public.analytic.service';
import { Need } from 'src/entities/flaskEntities/need.entity';

@ApiTags('Analytic/public')
@Controller('analytic/public')
export class AnalyticPublicController {
  constructor(
    private readonly analyticService: AnalyticService,
    private readonly analyticPublicService: AnalyticPublicService,
  ) {}

  @Get('summary')
  @ApiOperation({ description: 'get summary of totals' })
  async getSummaryAnalytic() {
    return this.analyticPublicService.getSummary();
  }

  @Get('transactions')
  @ApiOperation({ description: 'get summary of totals' })
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

  @Get('needs-frequency-clustered')
  async getNeedsFrequencyClustered(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('since') since?: string,
    @Query('until') until?: string,
    @Query('filterByDoneAt', new DefaultValuePipe(false))
    filterByDoneAt?: boolean,
    @Query('similarityThreshold', new DefaultValuePipe(0.2))
    similarityThreshold?: number,
  ) {
    return this.analyticPublicService.getNeedsFrequency({
      limit,
      since,
      until,
      filterByDoneAt,
      similarityThreshold: Number(similarityThreshold),
    });
  }

  @Get('multi-payers')
  async getNeedsWithMultiplePayers() {
    return config().dataCache.roleScatteredData();
  }

  @Get('checkpoints')
  @ApiOperation({
    description: 'Get latest 20 checkpoints (by checkpoint date)',
  })
  async getAll() {
    try {
      return this.analyticPublicService.findLatest20();
    } catch (e) {
      console.log(e);
    }
  }
}
