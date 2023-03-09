import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { SocialWorker } from 'src/entities/flaskEntities/user.entity';
import { UserController } from './user.controller';
import { FlaskUserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SocialWorker
    ], 'flaskPostgres'),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [UserController],
  providers: [
    FlaskUserService,

  ],
})
export class FlaskUserModule {
}
