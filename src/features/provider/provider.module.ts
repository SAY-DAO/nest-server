import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderEntity } from '../../entities/provider.entity';
import { ProviderService } from './provider.service';
import { ProviderController } from './provider.controller';
import { ProviderJoinNeedEntity } from 'src/entities/provider.Join.need..entity';

@Module({
    imports: [TypeOrmModule.forFeature([ProviderEntity]),
    TypeOrmModule.forFeature([ProviderEntity, ProviderJoinNeedEntity]),
    ],
    controllers: [ProviderController],
    providers: [ProviderService],
})
export class ProviderModule {

}
