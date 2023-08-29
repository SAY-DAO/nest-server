import {
  Body,
  Controller,
  Delete,
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
  getAvailableContributions() {
    return this.contributionService.getAvailableContributions();
  }

  // @Post('/create')
  // @UsePipes(new ValidationPipe()) 
  // createContributions(
  //   @Body(ValidateContributionPipe)
  //   body: CreateContributionDto,
  // ) {
  //   return this.contributionService.create(body.title, body.description);
  // }

  @Delete(`:contributionId`)
  @ApiOperation({ description: 'Delete a contribution' })
  async deleteComment(
    @Req() req: Request,
    @Param('contributionId') contributionId: string,
  ) {
    try {
      const contribution = await this.contributionService.getContribution(
        contributionId,
      );
      const flaskPanelUserId = Number(req.headers['panelFlaskUserId']);

      if (flaskPanelUserId !== 25) {
        throw new ServerError('You can not delete users comment!');
      }
      await this.contributionService.deleteOne(contribution.id);
    } catch (e) {
      throw new ServerError(e);
    }
  }
}
