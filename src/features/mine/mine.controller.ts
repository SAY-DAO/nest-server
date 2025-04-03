import {
  Controller,
  Get,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { MineService } from './mine.service';
import { ApiHeader, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { FamilyService } from '../family/family.service';
import {
  FlaskUserTypesEnum,
  SAY_DAPP_ID,
} from '../../types/interfaces/interface';
import { isAuthenticated } from '../../utils/auth';
import { NeedEntity } from '../../entities/need.entity';
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
