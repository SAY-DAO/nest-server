import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import config from './config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'reflect-metadata';
import { NeedModule } from './need/need.module';
import { NeedEntity } from './entities/need.entity';
import { SignatureModule } from './signature/signature.module';
import { SignatureEntity } from './entities/signature.entity';
import { SyncModule } from './sync/sync.module';
import { ChildrenModule } from './children/children.module';
import { ChildrenEntity } from './entities/children.entity';

const imports = [
  LoggerModule.forRoot(),
  TypeOrmModule.forRoot({
    ...config().db,
    entities: [NeedEntity, SignatureEntity, ChildrenEntity],
  }),
  SyncModule,
  ChildrenModule,
  NeedModule,
  SignatureModule,
  ScheduleModule.forRoot(),
];

@Module({
  imports: imports,
  controllers: [],
  providers: [],
})
export class AppModule { }
