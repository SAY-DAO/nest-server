import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NeedEntity } from '../../entities/need.entity';
import { ReceiptEntity } from '../../entities/receipt.entity';
import { NeedService } from '../need/need.service';
import { ReceiptController } from './receipt.controller';
import { ReceiptService } from './receipt.service';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { ContributorEntity } from 'src/entities/contributor.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';
import { Payment } from 'src/entities/flaskEntities/payment.entity';
import { SocialWorker } from 'src/entities/flaskEntities/user.entity';
import { ReceiptMiddleware } from './middlewares/receipt.middleware';
import { VariableEntity } from 'src/entities/variable.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Need, Child, Payment, SocialWorker],
      'flaskPostgres',
    ),
    TypeOrmModule.forFeature([
      ReceiptEntity,
      NeedEntity,
      ContributorEntity,
      VariableEntity,
    ]),
  ],
  controllers: [ReceiptController],
  providers: [ReceiptService, NeedService],
})
export class ReceiptModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ReceiptMiddleware).forRoutes('receipt');
  }
}
