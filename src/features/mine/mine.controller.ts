import { Controller, Get, Req, Param } from '@nestjs/common';
import { MineService } from './mine.service';
import { ObjectNotFound } from 'src/filters/notFound-expectation.filter';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { FamilyService } from '../family/family.service';

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
  ) {}

  @Get(`needs/paid`)
  @ApiOperation({
    description: 'Get all paid needs for family member',
  })
  async getPaidNeeds(@Req() req: Request) {
    const flaskUserId = req.headers['appFlaskUserId'];
    if (!flaskUserId) {
      throw new ObjectNotFound('We need the user ID!');
    }
    // const payments = await this.familyService.getFamilyPaidNeeds(
    //   Number(flaskUserId),
    // );

    const readyNeeds = await this.familyService.getFamilyReadyToSignNeeds(
      flaskUserId,
    );

    const signedNeeds = await this.familyService.getFamilySignedNeeds(
      flaskUserId,
    );

    return {
      signed: signedNeeds,
      readyNeedsList: readyNeeds.filter(
        (need) =>
          need.midjourneyImage !== null || // we need to use panel to assign midjourney images first
          (need.signatures &&
            need.signatures.find((s) => s.flaskUserId === Number(flaskUserId))),
      ),
    };
  }

  @Get(`signature/ready/:needId`)
  @ApiOperation({
    description: 'Get all signed needs for virtual family member',
  })
  async getReadyOneNeed(@Req() req: Request, @Param('needId') needId: string) {
    const flaskUserId = req.headers['appFlaskUserId'];

    if (!needId) {
      throw new ObjectNotFound('We need the needId!');
    }
    const theNeed = await this.familyService.getFamilyReadyToSignOneNeed(
      needId,
    );
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

    if (!theNeed.verifiedPayments.find((p) => p.flaskUserId === flaskUserId)) {
      throw new ObjectNotFound('This is not your need!');
    }
    return {
      ...theNeed,
      members,
    };
  }

  @Get('ecosystem/mineables')
  async getEcosystemMineables(@Req() req: Request) {
    const flaskUserId = req.headers['appFlaskUserId'];
    if (!flaskUserId) {
      throw new ObjectNotFound('We need the user ID!');
    }
    const mySignedNeeds = await this.mineService.getMySignedNeeds(flaskUserId);
    const myReadyToMine = await this.mineService.getMyReadyToMine(flaskUserId);
    const myMined = await this.mineService.getMyMinedNeeds(flaskUserId);

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
        waiting: mySignedNeeds - myReadyToMine.length,
        ready: myReadyToMine.length,
        mined: myMined,
        readyMintNeeds: myReadyToMine,
      },
    };
  }
}
