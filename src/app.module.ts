import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import config from './config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'reflect-metadata';
import { NeedEntity } from './entities/need.entity';
import { SignatureModule } from './features/signature/signature.module';
import { SignatureEntity } from './entities/signature.entity';
import { ChildrenEntity } from './entities/children.entity';
import { UserEntity } from './entities/user.entity';
import { SyncModule } from './features/sync/sync.module';
import { ChildrenModule } from './features/children/children.module';
import { NeedModule } from './features/need/need.module';
import { MilestoneModule } from './features/milestone/milestone.module';
import { MileStoneEntity } from './entities/milestone.entity';
import { EpicModule } from './features/epic/epic.module';
import { EpicEntity } from './entities/epic.entity';
import { UserModule } from './features/user/user.module';

const imports = [
  LoggerModule.forRoot(),
  TypeOrmModule.forRoot({
    ...config().db,
    dropSchema: false,
    entities: [UserEntity, NeedEntity, EpicEntity, MileStoneEntity, SignatureEntity, ChildrenEntity],
  }),
  SyncModule,
  UserModule,
  ChildrenModule,
  EpicModule,
  NeedModule,
  MilestoneModule,
  SignatureModule,
  ScheduleModule.forRoot(),
];

@Module({
  imports: imports,
  controllers: [],
  providers: [],
})
export class AppModule { }
