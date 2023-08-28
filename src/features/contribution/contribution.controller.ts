import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ContributionService } from './contribution.service';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ServerError } from 'src/filters/server-exception.filter';

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

  @Post('/create')
  createContributions(@Body() body: { title: string; descrition: string }) {
    return this.contributionService.create(body.title, body.descrition);
  }

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
      console.log(flaskPanelUserId);

      if (flaskPanelUserId !== 25) {
        throw new ServerError('You can not delete users comment!');
      }
      await this.contributionService.deleteOne(contribution.id);
    } catch (e) {
      throw new ServerError(e);
    }
  }
}
