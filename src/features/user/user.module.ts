import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { UserService } from './user.service';
import { FamilyEntity, SocialWorkerEntity } from '../../entities/user.entity';
import { UserController } from './user.controller';
import { UserMiddleware } from './middlewares/user.middleware';
import { NeedEntity } from '../../entities/need.entity';
import { NeedService } from '../need/need.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FamilyEntity, SocialWorkerEntity, NeedEntity]),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [UserController],
  providers: [UserService, NeedService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes('users')
  }
}
