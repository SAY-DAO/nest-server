


import { Controller, Get, Param, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChildrenService } from './children.service';

@ApiTags('Children')
@Controller('children')
export class ChildrenController {
    constructor(private childrenService: ChildrenService,
    ) { }

    @Get(`all`)
    @ApiOperation({ description: 'Get all children from db' })
    async getChildren() {
        return await this.childrenService.getChildren()
    }

    @Get(`all/child`)
    @ApiOperation({ description: 'Get all children from db' })
    async getFlaskChildren() {
        const children = await this.childrenService.getFlaskChildren()
        // fs.writeFile("test.json",JSON.stringify(children), function(err) {
        //     if (err) {
        //         console.log(err);
        //     }
        // });
    
       
    }


    @Get(`flask/child/needs-summary/:childId`)
    @ApiOperation({ description: 'Get a single child needs summary by ID' })
    async getChildNeedsSummary(@Req() req: Request, @Param('childId') childId: number) {
        const accessToken = req.headers["authorization"]
        return await this.childrenService.getChildNeedsSummery(accessToken, childId);
    }
}

