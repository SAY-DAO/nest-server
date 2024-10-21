import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { StatusService } from './status.service';
import { StatusController } from './status.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusEntity } from 'src/entities/status.entity';
import { StatusMiddleware } from './middlewares/status.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([StatusEntity ])],
  controllers: [StatusController],
  providers: [StatusService,],
})
export class StatusModule  implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(StatusMiddleware).forRoutes('status');
  }
}
