import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ContributionService } from './contribution.service';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ServerError } from 'src/filters/server-exception.filter';
import { ValidateContributionPipe } from './pipes/validate-ticket.pipe';
import { CreateContributionDto } from 'src/types/dtos/contribution/CreateContribution.dto';
import { isAuthenticated } from 'src/utils/auth';
import { FlaskUserTypesEnum } from 'src/types/interfaces/interface';

@ApiTags('Contribution')
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskId',
  description: 'to use cache and flask authentication',
  required: true,
})
@Controller('contribution')
export class ContributionController {
  constructor(private readonly contributionService: ContributionService) {}

  @Get('/all')
  getAvailableContributions(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    const dappFlaskUserId = req.headers['dappFlaskUserId'];
    if (panelFlaskUserId) {
      if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
        throw new ForbiddenException(403, 'You Are not authorized');
      }
    }
    if (dappFlaskUserId) {
      if (!isAuthenticated(dappFlaskUserId, FlaskUserTypesEnum.FAMILY)) {
        throw new ForbiddenException(403, 'You Are not authorized');
      }
    }
    return this.contributionService.getAvailableContributions();
  }

  @Post('/create')
  @UsePipes(new ValidationPipe())
  createContributions(
    @Body(ValidateContributionPipe)
    body: CreateContributionDto,
  ) {
    return this.contributionService.create(body.title, body.description);
  }

  @Get(`:contributionId`)
  @ApiOperation({ description: 'Delete a contribution' })
  async getContribution(
    @Req() req: Request,
    @Param('contributionId') contributionId: string,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    const dappFlaskUserId = req.headers['dappFlaskUserId'];
    if (panelFlaskUserId) {
      if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
        throw new ForbiddenException(403, 'You Are not authorized');
      }
    }
    if (dappFlaskUserId) {
      if (!isAuthenticated(dappFlaskUserId, FlaskUserTypesEnum.FAMILY)) {
        throw new ForbiddenException(403, 'You Are not authorized');
      }
    }

    try {
      return await this.contributionService.getContribution(contributionId);
    } catch (e) {
      throw new ServerError(e);
    }
  }

  @Delete(`:contributionId`)
  @ApiOperation({ description: 'Delete a contribution' })
  async deleteContribution(
    @Req() req: Request,
    @Param('contributionId') contributionId: string,
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
      const contribution = await this.contributionService.getContribution(
        contributionId,
      );

      await this.contributionService.deleteOne(contribution.id);
    } catch (e) {
      throw new ServerError(e);
    }
  }
}
