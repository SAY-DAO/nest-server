import { Module } from '@nestjs/common';
// import { LoggerModule } from 'nestjs-pino';
import { TypeOrmModule } from '@nestjs/typeorm';
import config from './config';
// import { NeedModule } from './modules/need.module';
// import { NeedEntity } from './entity/need.entity';
// import { SignatureEntity } from './entity/signature.entity';
// import { SignatureModule } from './modules/signature.module';
import 'reflect-metadata';

const imports = [
  // LoggerModule.forRoot(),
  TypeOrmModule.forRoot({
    ...config().db,
    // entities: [NeedEntity, SignatureEntity],
  }),
  // NeedModule,
  // SignatureModule,
];

@Module({
  imports: imports,
  controllers: [],
  providers: [],
})
export class AppModule {}
