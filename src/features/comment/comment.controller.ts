import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { VirtualFamilyRole } from 'src/types/interfaces/interface';
import { ServerError } from 'src/filters/server-exception.filter';
import { NeedService } from '../need/need.service';
import { NeedEntity } from 'src/entities/need.entity';

@ApiTags('Comment')
// @ApiSecurity('flask-access-token')
// @ApiHeader({
//   name: 'flaskId',
//   description: 'to use cache and flask authentication',
//   required: true,
// })

@Controller('comment')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly needService: NeedService,
  ) {}

  @Get(`all`)
  @ApiOperation({ description: 'Get all needs from db 1' })
  async getNeedComments(@Param('needId') needId: string) {
    return await this.commentService.getNeedComments(needId);
  }

  @Post('create')
  async createComment(
    @Req() req: Request,
    @Body()
    body: {
      flaskNeedId: number;
      needId: string;
      vRole: VirtualFamilyRole;
      message: string;
    },
  ) {
    const flaskUserId = req.headers['flaskUserId'];
    let theNeed: NeedEntity;
    try {
      theNeed = await this.needService.getNeedByFlaskId(body.flaskNeedId);
    } catch (e) {
      throw new ServerError('Could not find need!');
    }
    return await this.commentService.createComment(theNeed, flaskUserId, {
      vRole: body.vRole,
      message: body.message,
    });
  }
}
