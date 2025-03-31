import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from '../../entities/comment.entity';
import { NeedService } from '../need/need.service';
import { Need } from '../../entities/flaskEntities/need.entity';
import { SocialWorker, User } from '../../entities/flaskEntities/user.entity';
import { Child } from '../../entities/flaskEntities/child.entity';
import { NeedEntity } from '../../entities/need.entity';
import { CommentMiddleware } from './middlewares/comment.middleware';
import { UserService } from '../user/user.service';
import { ContributorEntity } from '../../entities/contributor.entity';
import { AllUserEntity } from '../../entities/user.entity';
import { EthereumAccountEntity } from '../../entities/ethereum.account.entity';
import { VariableEntity } from '../../entities/variable.entity';
import { Receipt } from '../../entities/flaskEntities/receipt.entity';
import { NeedReceipt } from '../../entities/flaskEntities/needReceipt.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [User, Need, SocialWorker, Child, Receipt, NeedReceipt],
      'flaskPostgres',
    ),
    TypeOrmModule.forFeature([
      CommentEntity,
      VariableEntity,
      NeedEntity,
      ContributorEntity,
      AllUserEntity,
      EthereumAccountEntity,
    ]),
  ],
  controllers: [CommentController],
  providers: [CommentService, NeedService, UserService],
})
export class CommentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CommentMiddleware).forRoutes('comment');
  }
}
