import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { VirtualFamilyRole } from '../../types/interfaces/interface';
import config from '../../config';
import { FamilyService } from '../family/family.service';
import { AnalyticService } from '../analytic/analytic.service';
import { CampaignService } from '../campaign/campaign.service';
import { persianDay } from '../../utils/helpers';
import { AnalyticPublicService } from '../analytic/public.analytic.service';
import { UserService } from '../user/user.service';
import { ChildrenService } from '../children/children.service';

@Injectable()
export class ScheduleService {
  constructor(
    private campaignService: CampaignService,
    private familyService: FamilyService,
    private childService: ChildrenService,
    private userService: UserService,
    private analyticService: AnalyticService,
    private readonly analyticPublicService: AnalyticPublicService,
  ) {}
  private readonly logger = new Logger(ScheduleService.name);

  // first store the list of needs paid by roles - then call these methods in cache this.roleScatteredData() this.theQuartile();
  async completePays() {
    const father = await this.familyService.getDoneNeedsByFamilyRole(
      VirtualFamilyRole.FATHER,
      0,
    );
    const mother = await this.familyService.getDoneNeedsByFamilyRole(
      VirtualFamilyRole.MOTHER,
      0,
    );
    const amoo = await this.familyService.getDoneNeedsByFamilyRole(
      VirtualFamilyRole.AMOO,
      0,
    );
    const khaleh = await this.familyService.getDoneNeedsByFamilyRole(
      VirtualFamilyRole.KHALEH,
      0,
    );
    const daei = await this.familyService.getDoneNeedsByFamilyRole(
      VirtualFamilyRole.DAEI,
      0,
    );
    const amme = await this.familyService.getDoneNeedsByFamilyRole(
      VirtualFamilyRole.AMME,
      0,
    );

    const say = await this.familyService.getDoneNeedsByFamilyRole(
      VirtualFamilyRole.SAY,
      0,
    );

    const nakama = await this.familyService.getDoneNeedsByFamilyRole(
      VirtualFamilyRole.NAKAMA,
      0,
    );

    const others = await this.familyService.getDoneNeedsByFamilyRole(
      VirtualFamilyRole.OTHERS,
      0,
    );

    const tot =
      father[1] +
      mother[1] +
      amoo[1] +
      khaleh[1] +
      daei[1] +
      amme[1] +
      say[1] +
      nakama[1] +
      others[1];

    const combinedArray = [
      ...father[0],
      ...mother[0],
      ...amoo[0],
      ...khaleh[0],
      ...daei[0],
      ...amme[0],
      ...say[0],
      ...nakama[0],
      ...others[0],
    ];
    // Create a Set to store unique ids
    const uniqueIds = new Set();

    // Iterate over the list and add each id to the Set
    combinedArray.forEach((item) => uniqueIds.add(item.id));

    // The size of the Set gives the count of unique ids
    const uniqueCount = uniqueIds.size;

    console.log(`Total paid need ids count: ${tot}`);
    console.log(`Unique paid need ids count: ${uniqueCount}`);

    config().dataCache.storeFamilyData({
      fathersData: father[0],
      mothersData: mother[0],
      amoosData: amoo[0],
      khalehsData: khaleh[0],
      daeisData: daei[0],
      ammesData: amme[0],
      sayData: say[0],
      nakamaData: nakama[0],
      othersData: others[0],
    });
  }

  async rolesCount() {
    // total count (e.g how many fathers in our ecosystem)
    const fathers = await this.familyService.countActiveFamilyByRole(
      VirtualFamilyRole.FATHER,
    );
    const mothers = await this.familyService.countActiveFamilyByRole(
      VirtualFamilyRole.MOTHER,
    );
    const amoos = await this.familyService.countActiveFamilyByRole(
      VirtualFamilyRole.AMOO,
    );
    const khalehs = await this.familyService.countActiveFamilyByRole(
      VirtualFamilyRole.KHALEH,
    );
    const daeis = await this.familyService.countActiveFamilyByRole(
      VirtualFamilyRole.DAEI,
    );
    const ammes = await this.familyService.countActiveFamilyByRole(
      VirtualFamilyRole.AMME,
    );
    const say = await this.familyService.countActiveFamilyByRole(
      VirtualFamilyRole.SAY,
    );
    const others = await this.familyService.countActiveFamilyByRole(
      VirtualFamilyRole.OTHERS,
    );
    const nakama = await this.familyService.countActiveFamilyByRole(
      VirtualFamilyRole.NAKAMA,
    );

    config().dataCache.storeRolesCount({
      activeFathersCount: fathers,
      activeMothersCount: mothers,
      activeAmoosCount: amoos,
      activeKhalehsCount: khalehs,
      activeDaeisCount: daeis,
      activeAmmesCount: ammes,
      sayCount: say,
      othersCount: others,
      nakamaCount: nakama,
    });
  }

  onApplicationBootstrap() {
    setTimeout(async () => {
      this.logger.debug('Runs once after startup');
      await this.campaignService.childrenWithNoNeed();
      await this.rolesCount();
      await this.completePays();
    }, 5000);
  }

  @Cron(CronExpression.EVERY_WEEK, {
    name: 'ActiveFamilies',
    timeZone: 'Asia/Tehran',
  })
  async handleMonthlyCron() {
    this.logger.debug(
      'Active Families (One and Three months report) Called every Month',
    );
    // how many amoos? ammes?
    this.rolesCount();
    // active families
    let actives = config().dataCache.fetchActiveFamilies();
    if (!actives) {
      actives = await this.analyticService.getChildrenFamilyAnalytic();
      config().dataCache.storeActiveFamilies(actives);
    } else {
      this.logger.debug('Reading from cache');
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM, {
    name: 'CompletePayments',
    timeZone: 'Asia/Tehran',
  })
  async handleWeeklyCron() {
    this.logger.debug(' Complete payments of families Called every Week');
    this.completePays();
  }

  // ERROR [Scheduler] ServerError: Can't send mail - all recipients were rejected: 550 <nakama@say.company> No such user here
  @Cron('30 08 * * Mon', {
    name: 'MonthlyCampaigns try At 08:30 on Monday.', // we try every week and only send to those who did not receive (because their child have no needs, etc.)
    timeZone: 'Asia/Tehran',
  })
  async handleMonthlyCampaignsCron() {
    const farsiDay = persianDay(new Date());
    if (farsiDay > 20) {
      this.logger.warn(
        `We are near the end of this month let's skip one more week`,
      );
      return;
    }
    // ############## BE CAREFUL #################
    if (process.env.NODE_ENV === 'production') {
      // await this.campaignService.sendUserMonthlyCampaigns();
    }
  }

  @Cron('30 8 * * Sat', {
    name: 'Reminders At 08:30 on Saturday.',
    timeZone: 'Asia/Tehran',
  })
  async handleChildNoNeedReminderMailCron() {
    if (process.env.NODE_ENV === 'production') {
      this.logger.debug('Sending Reminder to Social workers');
      await this.campaignService.sendSwChildNoNeedReminder();
    }
  }

  @Cron('50 9 * * Wed', {
    name: 'Reminders to announce arrivals At 9:50 on Wednesday.',
    timeZone: 'Asia/Tehran',
  })
  async handleAnnounceArrivalCron() {
    if (process.env.NODE_ENV === 'production') {
      this.logger.debug(
        'Sending Reminder to Social workers to announce arrivals',
      );
      await this.campaignService.sendSwAnnounceReminder();
    }
  }
}
