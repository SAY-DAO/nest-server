import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { UserService } from './user.service';
import { UserEntity } from '../../entities/user.entity';
import { UserController } from './user.controller';
import { UserMiddleware } from './middlewares/user.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes('users')
  }
}
