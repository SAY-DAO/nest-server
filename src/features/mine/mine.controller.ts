import {
  Controller,
  Get,
  Req,
  Param,
  ForbiddenException,
} from '@nestjs/common';
import { MineService } from './mine.service';
import { ObjectNotFound } from 'src/filters/notFound-expectation.filter';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { FamilyService } from '../family/family.service';
import {
  FlaskUserTypesEnum,
  SAY_DAPP_ID,
} from 'src/types/interfaces/interface';
import { isAuthenticated } from 'src/utils/auth';
import { NeedEntity } from 'src/entities/need.entity';
import { NeedService } from '../need/need.service';

@ApiTags('Mines')
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskId',
  description: 'to use cache and flask authentication',
  required: true,
})
@Controller('mine')
export class MineController {
  constructor(
    private readonly mineService: MineService,
    private readonly familyService: FamilyService,
    private readonly needService: NeedService,
  ) { }

  @Get(`needs/paid`)
  @ApiOperation({
    description: 'Get all paid needs for family member',
  })
  async getPaidNeeds(@Req() req: Request) {
    const dappFlaskUserId = req.headers['dappFlaskUserId'];
    if (!isAuthenticated(dappFlaskUserId, FlaskUserTypesEnum.FAMILY)) {
      throw new ForbiddenException('You Are not authorized');
    }

    const readyNeeds = await this.familyService.getFamilyReadyToSignNeeds(
      dappFlaskUserId,
    );

    const signedNeedsCount = await this.familyService.countFamilySignedNeeds(
      dappFlaskUserId,
    );

    return {
      signed: signedNeedsCount,
      readyNeedsList: readyNeeds.filter(
        (need) =>
          need.midjourneyImage !== null || // we need to use panel to assign midjourney images first
          (need.signatures &&
            need.signatures.find(
              (s) => s.flaskUserId === Number(dappFlaskUserId),
            )),
      ),
    };
  }

  @Get(`signature/ready/:needId`)
  @ApiOperation({
    description: 'Get all signed needs for virtual family member',
  })
  async getReadyOneNeed(@Req() req: Request, @Param('needId') needId: string) {
    const dappFlaskUserId = req.headers['dappFlaskUserId'];
    if (!isAuthenticated(dappFlaskUserId, FlaskUserTypesEnum.FAMILY)) {
      throw new ForbiddenException('You Are not authorized');
    }

    if (!needId) {
      throw new ObjectNotFound('We need the needId!');
    }
    const theNeed = await this.familyService.getFamilyReadyToSignOneNeed(
      needId,
    );

    if (
      !theNeed ||
      !theNeed.verifiedPayments.find(
        (p) => p.flaskUserId === Number(dappFlaskUserId) && p.verified,
      )
    ) {
      throw new ObjectNotFound('Could not match this need to you!');
    }
    if (
      !theNeed.signatures.find(
        (s) => s.flaskUserId === theNeed.socialWorker.flaskUserId,
      )
    ) {
      throw new ObjectNotFound(
        'This need does not have the social worker signature!',
      );
    }
    const members = await this.familyService.getChildFamilyMembers(
      theNeed.child.flaskId,
      theNeed.verifiedPayments.map((p) => p.flaskUserId),
    );

    return {
      ...theNeed,
      members,
    };
  }

  @Get('ecosystem/mineables')
  async getEcosystemMineables(@Req() req: Request) {
    const dappFlaskUserId = req.headers['dappFlaskUserId'];
    if (!isAuthenticated(dappFlaskUserId, FlaskUserTypesEnum.FAMILY)) {
      throw new ForbiddenException('You Are not authorized');
    }
    // 1 - get my signed needs
    const mySignedNeeds = await this.mineService.getMySignedNeeds(
      dappFlaskUserId,
    );
    let correctedNeeds: NeedEntity[];
    for await (const need of mySignedNeeds) {
      // 2 - if other payments check if payer has signed as well
      const othersPayment = need.verifiedPayments.filter(
        (p) =>
          p.needAmount > 0 &&
          p.verified &&
          p.flaskUserId !== SAY_DAPP_ID &&
          p.flaskUserId !== dappFlaskUserId,
      );

      if (othersPayment && othersPayment.length > 0) {
        const theNeed = await this.needService.getNeedById(need.id);
        correctedNeeds = mySignedNeeds.filter(
          (n) =>
            n.verifiedPayments.filter(
              (p) =>
                p.needAmount > 0 && p.verified && p.flaskUserId !== SAY_DAPP_ID,
            ).length ===
            theNeed.signatures.length - 1,
        );
      } else {
        correctedNeeds = mySignedNeeds;
      }
    }
    const myReadyToMine = await this.mineService.getMyReadyToMine(
      dappFlaskUserId,
    );
    const myMined = await this.mineService.getMyMinedNeeds(dappFlaskUserId);

    const paidNeeds = await this.mineService.getEcosystemPaidNeeds();
    const readyToMine = await this.mineService.getEcosystemReadyToMine();
    const mined = await this.mineService.getEcosystemMinedNeeds();
    return {
      ecosystem: {
        waiting: paidNeeds - readyToMine.length,
        ready: readyToMine.length,
        mined,
        readyMintNeeds: readyToMine,
      },
      theUser: {
        waiting: correctedNeeds ? correctedNeeds.length : 0,
        ready: myReadyToMine.length,
        mined: myMined,
        readyMintNeeds: myReadyToMine,
      },
    };
  }
}
