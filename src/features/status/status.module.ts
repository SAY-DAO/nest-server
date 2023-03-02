import { Module } from '@nestjs/common';
import { StatusService } from './status.service';
import { StatusController } from './status.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusEntity } from 'src/entities/status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StatusEntity ])],
  controllers: [StatusController],
  providers: [StatusService,],
})
export class StatusModule {

}
