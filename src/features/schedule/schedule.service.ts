import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { VirtualFamilyRole } from 'src/types/interfaces/interface';
import config from 'src/config';
import { FamilyService } from '../family/family.service';
import { AnalyticService } from '../analytic/analytic.service';
import { CampaignService } from '../campaign/campaign.service';
import { persianDay } from 'src/utils/helpers';
import { execute } from '@getvim/execute';

@Injectable()
export class ScheduleService {
  constructor(
    private campaignService: CampaignService,
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
  async handleCronOnce() {
    this.logger.debug(
      'Called only once after 15 seconds of the server initiation',
    );
    await this.campaignService.childrenWithNoNeed();
    this.completePays();
    this.rolesCount();
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT, {
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

  @Cron(CronExpression.EVERY_WEEK, {
    name: 'CompletePayments',
    timeZone: 'Asia/Tehran',
  })
  async handleWeeklyCron() {
    this.logger.debug(' Complete payments of families Called every Week');
    const data = config().dataCache.fetchFamilyAll();
    if (!data) {
      this.completePays();
    } else {
      this.logger.debug('Reading from cache');
    }
  }

  // ERROR [Scheduler] ServerError: Can't send mail - all recipients were rejected: 550 <nakama@say.company> No such user here
  @Cron('00 10 * * Thu', {
    name: 'MonthlyCampaigns try At 10:00 on Thursdays.', // we try every week and only send to those who did not receive (because their child have no needs, etc.)
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
      this.logger.debug(
        'Sending user Campaigns at 01:00 PM, only on Thursdays',
      );
      // await this.campaignService.sendUserMonthlyCampaigns();
    }
  }

  @Cron('30 8 * * Sat', {
    name: 'Reminders At 08:30 on Saturday.',
    timeZone: 'Asia/Tehran',
  })
  async handleReminderMailCron() {
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

  @Cron('00 10 * * *', {
    name: 'Backup.',
    timeZone: 'Asia/Tehran',
  })
  async handleBackupCron() {
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug('Backing up data base ...');

      // getting db connection parameters from environment file
      const username_flask = process.env.DB_FLASK_USER;
      const database_flask = process.env.DB_FLASK_NAME;
      const dbHost_flask = process.env.DB_FLASK_HOST;
      const dbPort_flask = process.env.DB_FLASK_PORT;

      const username_nest = process.env.DB_USER;
      const database_nest = process.env.DB_NAME;
      const dbPort_nest = 3000;

      // defining backup file name
      const date = new Date();
      const today = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const backupFileFlask = `../../backup/flask/pg-flask-backup-${today}.tar`;
      const backupFileNest = `../../backup/nest/pg-nest-backup-${today}.tar`;

      // flask
      const flaskPGBackup = () => {
        execute(
          `pg_dump -U ${username_flask} -h ${dbHost_flask} -p ${dbPort_flask} -f ${backupFileFlask} -F t -d ${database_flask}`,
        )
          .then(async () => {
            console.log(`Backup created successfully`);
          })
          .catch((err) => {
            console.log(err);
          });
      };

      //nest
      const nestPGBackup = () => {
        console.log(
          `pg_dump -U ${username_nest} -h ${dbHost_flask} -p ${dbPort_nest} -f ${backupFileNest} -F t -d ${database_nest}`,
        );

        execute(
          `pg_dump -U ${username_nest} -h ${dbHost_flask} -p ${dbPort_nest} -f ${backupFileNest} -F t -d ${database_nest}`,
        )
          .then(async () => {
            console.log(`Backup created successfully`);
          })
          .catch((err) => {
            console.log(err);
          });
      };

      // calling postgresql backup function
      // nestPGBackup();
      flaskPGBackup();
    }
  }
}
