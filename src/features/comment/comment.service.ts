import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from 'src/entities/comment.entity';
import { NeedEntity } from 'src/entities/need.entity';
import { VirtualFamilyRole } from 'src/types/interfaces/interface';
import { Repository } from 'typeorm';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
  ) {}

  async getNeedComments(needId: string): Promise<CommentEntity[]> {
    return this.commentRepository.find({
      where: {
        need: {
          id: needId,
        },
      },
    });
  }

  async createComment(
    theNeed: NeedEntity,
    flaskUserId: number,
    details: { vRole: VirtualFamilyRole; message: string },
  ): Promise<CommentEntity> {
    const theSignature = this.commentRepository.create({
      flaskUserId: flaskUserId,
      vRole: details.vRole,
      content: details.message,
    });
    theSignature.need = theNeed;

    return await this.commentRepository.save(theSignature);
  }
}
