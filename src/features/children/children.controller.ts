


import { Controller, Get, Param, ParseIntPipe, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NeedService } from '../need/need.service';
import { ChildrenService } from './children.service';

@ApiTags('Children')
@Controller('children')
export class ChildrenController {
    constructor(private childrenService: ChildrenService,
        private needService: NeedService,
    ) { }

    @Get(`all`)
    @ApiOperation({ description: 'Get a single transaction by ID' })
    async getChildren() {
        return await this.childrenService.getChildren();
    }

    @Get(`flask/child/needs-summary/:childId`)
    @ApiOperation({ description: 'Get a single child needs summary by ID' })
    async getChildNeedsSummary(@Req() req: Request, @Param('childId') childId: number) {
        const accessToken = req.headers["authorization"]
        // const template = {
        //     flaskChildId: needs[i].flaskChildId,
        //     flaskNeedId: needs[i].flaskNeedId,
        //     title: needs[i].title,
        //     affiliateLinkUrl: needs[i].affiliateLinkUrl,
        //     link: needs[i].link,
        //     category: needs[i].category,
        //     confirmUser: needs[i].flaskSupervisorId,
        //     flaskSupervisorId: needs[i].flaskSupervisorId,
        //     cost: needs[i].cost,
        //     created: needs[i].created && new Date(needs[i]?.created),
        //     createdById: needs[i].flaskSwId,
        //     deletedAt: needs[i].deletedAt && new Date(needs[i]?.deletedAt),
        //     description: needs[i].description, // { en: '' , fa: ''}
        //     descriptionTranslations: needs[i].descriptionTranslations, // { en: '' , fa: ''}
        //     titleTranslations: needs[i].titleTranslations,
        //     details: needs[i].details,
        //     isUrgent: needs[i].isUrgent,
        //     type: needs[i].type,
        //     typeName: needs[i].typeName,
        //     unpayable: needs[i].unpayable,
        //     unpayableFrom:
        //         needs[i].unpayableFrom && new Date(needs[i]?.unpayableFrom),
        //     imageUrl: needs[i].imageUrl,
        //     needRetailerImg: needs[i].needRetailerImg,
        // }
        return await this.childrenService.getChildNeedsSummeay(accessToken, childId);
    }


    // @Get(`child/done/:id`)
    // @ApiOperation({ description: 'Get child all done need' })
    // async getChildNeeds(@Param('childId', ParseIntPipe) childId: number) {
    //     const theChild = await this.childrenService.getChildById(childId);
    //     return theChild.needs;
    // }


    @Get(`child/needs/templates/:id`)
    @ApiOperation({ description: 'Get child all done need' })
    async createNeedsTemplates(@Req() req: Request, @Param('id', ParseIntPipe) childId: number) {
        const accessToken = req.headers["authorization"]
        const needs = await this.needService.getPreNeed(accessToken)
        const templates = []
        // for (let i = 0; i < needs.length; i++) {
        //     const template = {
        //         flaskChildId: needs[i].flaskChildId,
        //         flaskNeedId: needs[i].flaskNeedId,
        //         title: needs[i].title,
        //         affiliateLinkUrl: needs[i].affiliateLinkUrl,
        //         link: needs[i].link,
        //         category: needs[i].category,
        //         confirmUser: needs[i].flaskSupervisorId,
        //         flaskSupervisorId: needs[i].flaskSupervisorId,
        //         cost: needs[i].cost,
        //         created: needs[i].created && new Date(needs[i]?.created),
        //         createdById: needs[i].flaskSwId,
        //         deletedAt: needs[i].deletedAt && new Date(needs[i]?.deletedAt),
        //         description: needs[i].description, // { en: '' , fa: ''}
        //         descriptionTranslations: needs[i].descriptionTranslations, // { en: '' , fa: ''}
        //         titleTranslations: needs[i].titleTranslations,
        //         details: needs[i].details,
        //         isUrgent: needs[i].isUrgent,
        //         type: needs[i].type,
        //         typeName: needs[i].typeName,
        //         unpayable: needs[i].unpayable,
        //         unpayableFrom:
        //             needs[i].unpayableFrom && new Date(needs[i]?.unpayableFrom),
        //         imageUrl: needs[i].imageUrl,
        //         needRetailerImg: needs[i].needRetailerImg,
        //     }
        //     templates.push(template)
        // }
        // return templates;
    }

}

