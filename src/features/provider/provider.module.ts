import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderEntity } from '../../entities/provider.entity';
import { ProviderService } from './provider.service';
import { ProviderController } from './provider.controller';

@Module({
    imports: [TypeOrmModule.forFeature([ProviderEntity])],
    controllers: [ProviderController],
    providers: [ProviderService],
})
export class ProviderModule {

}
