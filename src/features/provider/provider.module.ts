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

@Module({
  imports: [
    TypeOrmModule.forFeature([ProviderEntity]),
    TypeOrmModule.forFeature([ProviderEntity, ProviderJoinNeedEntity]),
  ],
  controllers: [ProviderController],
  providers: [ProviderService],
})
export class ProviderModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ProviderMiddleware)
      .exclude('providers/images/:fileName')
      .forRoutes(ProviderController);
  }
}
