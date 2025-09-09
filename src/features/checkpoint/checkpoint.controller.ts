import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  ParseIntPipe,
  Delete,
  Patch,
  Query,
  UseGuards,
  ForbiddenException,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CheckPointService } from './checkpoint.service';
import { CreateCheckPointDto } from './dto/create-checkpoint.dto';
import { CheckPointEntity } from '../../entities/checkpoint.entity';
import { CheckPointType } from 'src/types/interfaces/checkpoint-type.enum';
import { isAuthenticated } from 'src/utils/auth';
import { FlaskUserTypesEnum } from 'src/types/interfaces/interface';
import { UserService } from '../user/user.service';
import { ServerError } from 'src/filters/server-exception.filter';
import { GetCheckpointsDto } from './dto/get-checkpoints.dto';

@ApiTags('Checkpoint')
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskdappid',
  description: 'to use cache and flask authentication',
  required: true,
})
@Controller('checkpoints')
export class CheckPointController {
  constructor(
    private readonly cpService: CheckPointService,
    private userService: UserService,
  ) {}

  // create: user posts a checkpoint. You probably want to infer userId from JWT in real app.
  @Post('')
  @ApiOperation({
    description:
      'Create a checkpoint (log) for a user (limited to 5 unconfirmed)',
  })
  async create(
    @Req() req: Request,
    @Body() dto: CreateCheckPointDto,
  ): Promise<CheckPointEntity> {
    const dappFlaskUserId = req.headers['dappFlaskUserId'];
    if (dappFlaskUserId) {
      if (!isAuthenticated(dappFlaskUserId, FlaskUserTypesEnum.FAMILY)) {
        throw new ForbiddenException('You Are not authorized');
      }
    }
    const user = await this.userService.getFamilyByFlaskId(dappFlaskUserId);
    if (!user) throw new NotFoundException(`User not found`);
    try {
      return await this.cpService.createForUser(user, dto);
    } catch (e) {
      throw new ServerError({ ...e });
    }
  }

  // list: supports filtering by type and confirmation status
  @Get('user/:userId')
  @ApiOperation({
    description: 'List checkpoints for a user (filter by type, confirmation)',
  })
  async listForUser(
    @Req() req: Request,
    @Query('type') type: CheckPointType,
    @Query('onlyConfirmed') onlyConfirmed?: string, // 'true' | 'false' | undefined
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
  ): Promise<CheckPointEntity[]> {
    const dappFlaskUserId = req.headers['dappFlaskUserId'];
    if (dappFlaskUserId) {
      if (!isAuthenticated(dappFlaskUserId, FlaskUserTypesEnum.FAMILY)) {
        throw new ForbiddenException('You Are not authorized');
      }
    }
    const user = await this.userService.getFamilyByFlaskId(dappFlaskUserId);
    const onlyConfirmedBool =
      onlyConfirmed === 'true'
        ? true
        : onlyConfirmed === 'false'
        ? false
        : undefined;
    return this.cpService.findByUser(
      user.id,
      type,
      onlyConfirmedBool,
      Number(limit),
      Number(offset),
    );
  }

  // admin: confirm checkpoint
  // protect with an AuthGuard + role check in real app (example left open)
  @Patch(':id/confirm')
  @ApiOperation({
    description: 'Confirm (approve) a checkpoint (admin action)',
  })
  async confirm(
    @Param('id', ParseIntPipe) id: string,
  ): Promise<CheckPointEntity> {
    return this.cpService.confirmCheckpoint(id);
  }

  @Get(':id')
  async getOne(
    @Param('id', ParseIntPipe) id: string,
  ): Promise<CheckPointEntity> {
    return this.cpService.findOne(id);
  }

  @Get('')
  async getAll(@Req() req: Request, @Query() query: GetCheckpointsDto) {
    const dappFlaskUserId = req.headers['dappFlaskUserId'];
    if (dappFlaskUserId) {
      if (!isAuthenticated(dappFlaskUserId, FlaskUserTypesEnum.FAMILY)) {
        throw new ForbiddenException('You Are not authorized');
      }
    }
    const user = await this.userService.getFamilyByFlaskId(dappFlaskUserId);
    return this.cpService.findAll(query);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: string,
  ): Promise<{ ok: boolean }> {
    await this.cpService.remove(id);
    return { ok: true };
  }
}
