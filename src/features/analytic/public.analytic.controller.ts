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
  getSeasonComparison(
    @Query('season') season?: string,
    @Query('includeRates') includeRates?: string,
  ) {
    const include = includeRates === 'true' || includeRates === '1';
    return this.analyticPublicService.getSeasonComparison(season, include);
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
  async getNeedsWithMultiplePayers(
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ): Promise<Need[]> {
    const safeLimit = Math.min(Math.max(limit, 1), 1000);
    return this.analyticPublicService.getLastNeedsWithAtLeastTwoPayers(
      safeLimit,
      2,
    );
  }
}
