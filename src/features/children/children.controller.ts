


import { Controller, Get} from '@nestjs/common';
import { ApiOperation,  ApiTags } from '@nestjs/swagger';
import { ChildrenService } from './children.service';

@ApiTags('Children')
@Controller('children')
export class ChildrenController {
    constructor(private childrenService: ChildrenService) { }

    @Get(`all`)
    @ApiOperation({ description: 'Get a single transaction by ID' })
    async getChildren() {
        return await this.childrenService.getChildren();
    }

}

