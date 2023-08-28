import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { ServerError } from 'src/filters/server-exception.filter';
import { NeedService } from '../need/need.service';
import { NeedEntity } from 'src/entities/need.entity';
import { AllUserEntity } from 'src/entities/user.entity';
import { UserService } from '../user/user.service';
import { ValidateCommentPipe } from './pipes/validate-ticket.pipe';
import { CreateCommentDto } from 'src/types/dtos/CreateComment.dto';
import { CommentEntity } from 'src/entities/comment.entity';
import { VirtualFamilyRole } from 'src/types/interfaces/interface';

@ApiTags('Comment')
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskId',
  description: 'to use cache and flask authentication',
  required: true,
})
@Controller('comment')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly needService: NeedService,
    private userService: UserService,
  ) {}

  @Get(`all`)
  @ApiOperation({ description: 'Get all comments' })
  async getComments() {
    return await this.commentService.getComments();
  }

  @Get(`need/:needId`)
  @ApiOperation({ description: 'Get the Need comments' })
  async getNeedComments(@Param('needId') needId: string) {
    return await this.commentService.getNeedComments(needId);
  }

  @Post('create')
  @UsePipes(new ValidationPipe()) // validation for dto files
  async createComment(
    @Req() req: Request,
    @Body(ValidateCommentPipe)
    body: CreateCommentDto,
  ) {
    const flaskAppUserId = Number(req.headers['appFlaskUserId']);
    const flaskPanelUserId = Number(req.headers['panelFlaskUserId']);

    let theNeed: NeedEntity;
    let theUser: AllUserEntity;
    let comment: CommentEntity;
    try {
      if (!flaskPanelUserId && !flaskAppUserId) {
        throw new ServerError('We need the user Id!');
      }
      theNeed = await this.needService.getNeedByFlaskId(body.flaskNeedId);
      if (flaskAppUserId) {
        theUser = await this.userService.getUserByFlaskId(flaskAppUserId);
        comment = await this.commentService.createComment(
          theUser,
          theNeed,
          flaskAppUserId,
          {
            vRole: body.vRole,
            message: body.message,
            flaskNeedId: body.flaskNeedId,
          },
        );
        await this.needService.updateIsResolved(theNeed.id, false);
      }
      if (flaskPanelUserId) {
        theUser = await this.userService.getUserByFlaskId(flaskPanelUserId);
        comment = await this.commentService.createComment(
          theUser,
          theNeed,
          flaskPanelUserId,
          {
            vRole: VirtualFamilyRole.SAY,
            message: body.message,
            flaskNeedId: body.flaskNeedId,
          },
        );
      }
    } catch (e) {
      throw new ServerError(e);
    }

    return comment;
  }

  @Delete(`:commentId`)
  @ApiOperation({ description: 'Delete a comment' })
  async deleteComment(
    @Req() req: Request,
    @Param('commentId') commentId: string,
  ) {
    try {
      const theComment = await this.commentService.getComment(commentId);
      const flaskPanelUserId = Number(req.headers['panelFlaskUserId']);
      if (theComment.flaskUserId !== flaskPanelUserId) {
        throw new ServerError('You can not delete users comment!');
      }
      await this.commentService.deleteOne(theComment.id);
      const theNeed = await this.needService.getNeedById(theComment.need.id);
      if (theNeed.comments.length === 0) {
        await this.needService.updateIsResolved(theNeed.id, true);
      }
    } catch (e) {
      throw new ServerError(e);
    }
  }

  @Patch(`resolve/:needId`)
  @ApiOperation({ description: 'Delete a comment' })
  async updateComment(@Param('needId') needId: string) {
    const theNeed = await this.needService.getNeedById(needId);
    let isResolved = theNeed.isResolved;
    if (isResolved) {
      isResolved = false;
    } else {
      isResolved = true;
    }
    await this.needService.updateIsResolved(needId, isResolved);
    return { isResolved, needId };
  }
}
