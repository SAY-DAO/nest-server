import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, from } from 'rxjs';
import { CommentEntity } from 'src/entities/comment.entity';
import { NeedEntity } from 'src/entities/need.entity';
import { AllUserEntity } from 'src/entities/user.entity';
import { VirtualFamilyRole } from 'src/types/interfaces/interface';
import { IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
    @InjectRepository(NeedEntity)
    private needRepository: Repository<NeedEntity>,
  ) {}

  async getComment(commentId: string): Promise<CommentEntity> {
    return await this.commentRepository.findOne({
      where: {
        id: commentId,
      },
    });
  }

  async getNeedComments(needId: string): Promise<CommentEntity[]> {
    return this.commentRepository.find({
      relations: {
        user: true,
      },
      where: {
        need: {
          id: needId,
        },
      },
    });
  }

  async getComments(): Promise<NeedEntity[]> {
    return this.needRepository.find({
      relations: { comments: true },
      where: {
        comments: {
          content: Not(IsNull()),
        },
      },
    });
  }

  async createComment(
    theUser: AllUserEntity,
    theNeed: NeedEntity,
    flaskUserId: number,
    details: { vRole: VirtualFamilyRole; message: string; flaskNeedId: number },
  ): Promise<CommentEntity> {
    const theComment = this.commentRepository.create({
      flaskUserId: flaskUserId,
      vRole: details.vRole,
      content: details.message,
      flaskNeedId: details.flaskNeedId,
    });
    console.log('theNeed.id');
    console.log(theComment);
    theComment.need = theNeed;
    theComment.user = theUser;
    return await this.commentRepository.save(theComment);
  }

  async deleteOne(commentId: string): Promise<Observable<any>> {
    return from(this.commentRepository.delete(commentId));
  }
}
