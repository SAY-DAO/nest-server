import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from 'src/entities/comment.entity';
import { NeedService } from '../need/need.service';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { SocialWorker, User } from 'src/entities/flaskEntities/user.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';
import { NeedEntity } from 'src/entities/need.entity';
import { CommentMiddleware } from './middlewares/comment.middleware';
import { UserService } from '../user/user.service';
import { ContributorEntity } from 'src/entities/contributor.entity';
import { AllUserEntity } from 'src/entities/user.entity';
import { EthereumAccountEntity } from 'src/entities/ethereum.account.entity';
import { VariableEntity } from 'src/entities/variable.entity';
import { Receipt } from 'src/entities/flaskEntities/receipt.entity';
import { NeedReceipt } from 'src/entities/flaskEntities/needReceipt.entity';

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
