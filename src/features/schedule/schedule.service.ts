import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { VirtualFamilyRole } from 'src/types/interfaces/interface';
import config from 'src/config';
import { FamilyService } from '../family/family.service';
import { AnalyticService } from '../analytic/analytic.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ScheduleService {
  constructor(
    private mailService: MailService,
    private familyService: FamilyService,
    private analyticService: AnalyticService,
  ) {}
  private readonly logger = new Logger(ScheduleService.name);

  async completePays() {
    const father = await this.familyService.getFamilyRoleCompletePay(
      VirtualFamilyRole.FATHER,
      0,
    );
    const mother = await this.familyService.getFamilyRoleCompletePay(
      VirtualFamilyRole.MOTHER,
      0,
    );
    const amoo = await this.familyService.getFamilyRoleCompletePay(
      VirtualFamilyRole.AMOO,
      0,
    );
    const khaleh = await this.familyService.getFamilyRoleCompletePay(
      VirtualFamilyRole.KHALEH,
      0,
    );
    const daei = await this.familyService.getFamilyRoleCompletePay(
      VirtualFamilyRole.DAEI,
      0,
    );
    const amme = await this.familyService.getFamilyRoleCompletePay(
      VirtualFamilyRole.AMME,
      0,
    );

    config().dataCache.storeFamilyData({
      fathersData: father[0],
      mothersData: mother[0],
      amoosData: amoo[0],
      khalehsData: khaleh[0],
      daeisData: daei[0],
      ammesData: amme[0],
    });
  }

  async rolesCount() {
    // total count (e.g how many fathers in our ecosystem)
    const fathersCount = await this.familyService.getFamilyRolesCount(
      VirtualFamilyRole.FATHER,
    );
    const mothersCount = await this.familyService.getFamilyRolesCount(
      VirtualFamilyRole.MOTHER,
    );
    const amoosCount = await this.familyService.getFamilyRolesCount(
      VirtualFamilyRole.AMOO,
    );
    const khalehsCount = await this.familyService.getFamilyRolesCount(
      VirtualFamilyRole.KHALEH,
    );
    const daeisCount = await this.familyService.getFamilyRolesCount(
      VirtualFamilyRole.DAEI,
    );
    const ammesCount = await this.familyService.getFamilyRolesCount(
      VirtualFamilyRole.AMME,
    );

    config().dataCache.storeRolesCount({
      fathersCount,
      mothersCount,
      amoosCount,
      khalehsCount,
      daeisCount,
      ammesCount,
    });
  }

  @Timeout(15000)
  // @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCronOnce() {
    this.logger.debug(
      'Called only once after 15 seconds of the server initiation',
    );
    this.completePays();
    this.rolesCount();
  }

  @Cron(CronExpression.EVERY_WEEK)
  async handleWeeklyCron() {
    this.logger.debug('Called every Week');
    const data = config().dataCache.fetchFamilyAll();
    if (!data) {
      this.completePays();
    } else {
      this.logger.debug('Reading from cache');
    }
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleMonthlyCron() {
    this.logger.debug('Called every Month');

    // active families
    let actives = config().dataCache.fetchActiveFamilies();
    if (!actives) {
      actives = await this.analyticService.getChildrenFamilyAnalytic();
      config().dataCache.storeActiveFamilies(actives);
    } else {
      this.logger.debug('Reading from cache');
    }
  }

  @Timeout(5000)
  // @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_NOON)
  async handleSummaryMailCron() {
    this.logger.debug('Mailing User summaries');
    // await this.mailService.sendUserSummaries();
  }
}
