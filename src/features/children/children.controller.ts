import { Controller, Get, Param, Req } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ChildrenService } from './children.service';

@ApiTags('Children')
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskSwId',
  description: 'to use cache and flask authentication',
  required: true,
})
@Controller('children')
export class ChildrenController {
  constructor(private childrenService: ChildrenService) {}

  @Get(`all`)
  @ApiOperation({ description: 'Get all children from db' })
  async getChildren() {
    return await this.childrenService.getChildren();
  }

  @Get(`all/actives`)
  @ApiOperation({ description: 'Get all active children from flask db' })
  async getActiveChildren() {
    return await this.childrenService.getFlaskActiveChildren();
  }


  @Get(`flask/all`)
  @ApiOperation({ description: 'Get all flask children from db' })
  async getFlaskChildren() {
    return await this.childrenService.getFlaskChildren();
  }

  @Get(`flask/child/needs-summary/:childId`)
  @ApiOperation({ description: 'Get a single child needs summary by ID' })
  async getChildNeedsSummary(
    @Req() req: Request,
    @Param('childId') childId: number,
  ) {
    const accessToken = req.headers['authorization'];
    return await this.childrenService.getChildNeedsSummery(
      accessToken,
      childId,
    );
  }
}
