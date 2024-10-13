import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ContributionService } from './contribution.service';
import { ContributionController } from './contribution.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContributionEntity } from 'src/entities/contribution.entity';
import { contributionMiddleware } from './middlewares/comment.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([ContributionEntity])],
  controllers: [ContributionController],
  providers: [ContributionService],
})
export class ContributionModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(contributionMiddleware).forRoutes('contribution');
  }
}
