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
import { ChildrenEntity } from '../../entities/children.entity';
import { ChildrenService } from '../children/children.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FamilyEntity, SocialWorkerEntity, NeedEntity, ChildrenEntity]),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [UserController],
  providers: [UserService, NeedService, ChildrenService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes('users')
  }
}
