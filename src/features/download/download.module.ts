import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DownloadService } from './download.service';
import { DownloadController } from './download.controller';
import { HttpModule } from '@nestjs/axios';
import { DownloadMiddleware } from './middlewares/download.middleware';

@Module({
  imports: [HttpModule],
  controllers: [DownloadController],
  providers: [DownloadService],
})
export class DownloadModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DownloadMiddleware).forRoutes('download');
  }
}
