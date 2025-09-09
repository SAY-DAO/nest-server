import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckPointMiddleware } from './middlewares/checkpoint.middleware';
import { CheckPointEntity } from '../../entities/checkpoint.entity';
import { CheckPointController } from './checkpoint.controller';
import { CheckPointService } from './checkpoint.service';
import { AllUserEntity } from '../../entities/user.entity';
import { UserService } from '../user/user.service';
import { ContributorEntity } from 'src/entities/contributor.entity';
import { EthereumAccountEntity } from 'src/entities/ethereum.account.entity';
import { SocialWorker, User } from 'src/entities/flaskEntities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SocialWorker, User], 'flaskPostgres'),
    TypeOrmModule.forFeature([
      CheckPointEntity,
      AllUserEntity,
      ContributorEntity,
      EthereumAccountEntity,
    ]),
  ],
  controllers: [CheckPointController],
  providers: [CheckPointService, UserService],
})
export class CheckPointModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CheckPointMiddleware).forRoutes('checkpoints');
  }
}
