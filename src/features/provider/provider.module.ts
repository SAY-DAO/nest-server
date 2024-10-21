import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderEntity } from '../../entities/provider.entity';
import { ProviderService } from './provider.service';
import { ProviderController } from './provider.controller';
import { ProviderJoinNeedEntity } from 'src/entities/provider.Join.need..entity';
import { ProviderMiddleware } from './middlewares/provider.middleware';
import { NeedService } from '../need/need.service';
import { NeedEntity } from 'src/entities/need.entity';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { VariableEntity } from 'src/entities/variable.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Need], 'flaskPostgres'),
    TypeOrmModule.forFeature([
      ProviderEntity,
      ProviderJoinNeedEntity,
      ProviderEntity,
      NeedEntity,
      VariableEntity,
    ]),
  ],
  controllers: [ProviderController],
  providers: [ProviderService, NeedService],
})
export class ProviderModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ProviderMiddleware)
      .exclude('providers/images/:fileName')
      .forRoutes(ProviderController);
  }
}
