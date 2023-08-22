import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from 'src/entities/comment.entity';
import { NeedService } from '../need/need.service';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { SocialWorker } from 'src/entities/flaskEntities/user.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';
import { NeedEntity } from 'src/entities/need.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Need, SocialWorker, Child], 'flaskPostgres'),
    TypeOrmModule.forFeature([CommentEntity, NeedEntity]),
  ],
  controllers: [CommentController],
  providers: [CommentService, NeedService],
})
export class CommentModule {}
