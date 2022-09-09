import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderEntity } from '../../entities/provider.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ProviderEntity])],
    controllers: [],
    providers: [],
})
export class ProviderModule {

}
