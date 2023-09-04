import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
import {
  FlaskUserTypesEnum,
  VirtualFamilyRole,
} from 'src/types/interfaces/interface';
import { isAuthenticated } from 'src/utils/auth';

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
  async getComments(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
    return await this.commentService.getComments();
  }

  @Get(`need/:needId`)
  @ApiOperation({ description: 'Get the Need comments' })
  async getNeedComments(@Req() req: Request, @Param('needId') needId: string) {
    const dappFlaskUserId = req.headers['dappFlaskUserId'];
    if (!isAuthenticated(dappFlaskUserId, FlaskUserTypesEnum.FAMILY)) {
      throw new ForbiddenException(403, 'You Are not authorized');
    }
    return await this.commentService.getNeedComments(needId);
  }

  @Post('create')
  @UsePipes(new ValidationPipe())
  async createComment(
    @Req() req: Request,
    @Body(ValidateCommentPipe)
    body: CreateCommentDto,
  ) {
    const dappFlaskUserId = Number(req.headers['dappFlaskUserId']);
    const panelFlaskUserId = Number(req.headers['panelFlaskUserId']);
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];

    let theNeed: NeedEntity;
    let theUser: AllUserEntity;
    let comment: CommentEntity;
    try {
      if (!panelFlaskUserId && !dappFlaskUserId) {
        throw new ServerError('We need the user Id!');
      }
      theNeed = await this.needService.getNeedByFlaskId(body.flaskNeedId);
      if (dappFlaskUserId) {
        if (!isAuthenticated(dappFlaskUserId, FlaskUserTypesEnum.FAMILY)) {
          throw new ForbiddenException(403, 'You Are not authorized');
        }
        theUser = await this.userService.getUserByFlaskId(dappFlaskUserId);
        comment = await this.commentService.createComment(
          theUser,
          theNeed,
          dappFlaskUserId,
          {
            vRole: body.vRole,
            message: body.message,
            flaskNeedId: body.flaskNeedId,
          },
        );
        await this.needService.updateIsResolved(theNeed.id, false);
      }
      if (panelFlaskUserId) {
        if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
          throw new ForbiddenException(403, 'You Are not authorized');
        }
        theUser = await this.userService.getUserByFlaskId(panelFlaskUserId);
        comment = await this.commentService.createComment(
          theUser,
          theNeed,
          panelFlaskUserId,
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
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
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
  async updateComment(@Req() req: Request, @Param('needId') needId: string) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
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
