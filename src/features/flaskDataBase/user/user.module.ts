import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserMiddleware } from './middlewares/user.middleware';
import { user } from 'src/entities/flaskEntities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      user
    ]),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,

  ],
})
export class FlaskUserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes('users');
  }
}
