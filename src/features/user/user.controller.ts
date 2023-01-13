import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Query,
    Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NeedEntity } from '../../entities/need.entity';
import { FamilyEntity } from '../../entities/user.entity';
import { UserService } from './user.service';
import { NeedService } from '../need/need.service';
import { ObjectNotFound } from '../../filters/notFound-expectation.filter';
import { ChildrenService } from '../children/children.service';
import { childConfirmation, RolesEnum, childExistance } from 'src/types/interface';
import { getOrganizedNeeds } from 'src/helpers';
import { Children } from 'src/types/interfaces/Children';
import { NeedsData } from 'src/types/interfaces/Need';

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(
        private userService: UserService,
        private needService: NeedService,
        private childrenService: ChildrenService,
    ) { }

    @Get(`myPage/:typeId`)
    @ApiOperation({ description: 'Get user My page' })
    async fetchMyPage(
        @Req() req: Request,
        @Param('typeId', ParseIntPipe) userType: number,
        @Query('createdBy') createdBy: number,
        @Query('confirmedBy') confirmedBy: number,
        @Query('purchasedBy') purchasedBy: number,
        @Query('ngoId') ngoId: boolean,
    ) {
        console.log(createdBy, confirmedBy, purchasedBy, ngoId);
        const accessToken = req.headers['authorization'];
        const X_SKIP = req.headers['x-skip'];
        const X_TAKE = req.headers['x-take'];
        // needs
        let needsData: NeedsData;
        let allChildren: Children[]
        let totalChildrenCount: number
        try {
            if (createdBy) {
                needsData = await this.needService.getNeeds(
                    { accessToken, X_SKIP, X_TAKE },
                    { createdBy: Number(createdBy) },
                );
            } else if (confirmedBy) {
                needsData = await this.needService.getNeeds(
                    { accessToken, X_SKIP, X_TAKE },
                    { confirmedBy: Number(confirmedBy) },
                );
                console.log(needsData);
            } else if (purchasedBy) {
                needsData = await this.needService.getNeeds(
                    { accessToken, X_SKIP, X_TAKE },
                    { purchasedBy: Number(purchasedBy) },
                );
            } else if (ngoId) {
                needsData = await this.needService.getNeeds(
                    { accessToken, X_SKIP, X_TAKE },
                    { ngoId: Number(ngoId) },
                );
            }
        } catch (e) {
            throw new ObjectNotFound();
        }
        // children
        try {
            if (userType === RolesEnum.SUPER_ADMIN || userType === RolesEnum.ADMIN) {
                 const aliveGone = await this.childrenService.getAllChildren(
                    { accessToken },
                    { confirm: childConfirmation.BOTH, existenceStatus: childExistance.AliveGone },
                );
                const alivePresent = await this.childrenService.getAllChildren(
                    { accessToken },
                    { confirm: childConfirmation.BOTH, existenceStatus: childExistance.AlivePresent },
                );
                const dead = await this.childrenService.getAllChildren(
                    { accessToken },
                    { confirm: childConfirmation.BOTH, existenceStatus: childExistance.DEAD },
                );
                const tempGone = await this.childrenService.getAllChildren(
                    { accessToken },
                    { confirm: childConfirmation.BOTH, existenceStatus: childExistance.TempGone },
                );
                const array1 = aliveGone.children.concat(alivePresent.children);
                const array2 = array1.concat(dead.children);
                allChildren = array2.concat(tempGone.children);
                totalChildrenCount = aliveGone.totalCount + alivePresent.totalCount + dead.totalCount + tempGone.totalCount

            } else if (userType === RolesEnum.NGO_SUPERVISOR) {
                this.childrenService.getAllChildren(
                    { accessToken, X_SKIP, X_TAKE },
                    { confirm: 0 },
                );
            } else if (userType === RolesEnum.SOCIAL_WORKER) {
                this.childrenService.getAllChildren(
                    { accessToken, X_SKIP, X_TAKE },
                    { confirm: 0 },
                );
            }
        } catch (e) {
            console.log(e)
        }
        const organizedNeeds = getOrganizedNeeds(needsData);
        return { needs: organizedNeeds, childrenCount: totalChildrenCount };
    }
}
