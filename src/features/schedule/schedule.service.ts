import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { VirtualFamilyRole } from '../../types/interfaces/interface';
import config from '../../config';
import { FamilyService } from '../family/family.service';
import { AnalyticService } from '../analytic/analytic.service';
import { CampaignService } from '../campaign/campaign.service';
import { persianDay } from '../../utils/helpers';
import { execute } from '@getvim/execute';
import { toJalaali } from 'jalaali-js';
import { DateTime } from 'luxon';
import { CheckPointService } from '../checkpoint/checkpoint.service';
import { AnalyticPublicService } from '../analytic/public.analytic.service';
import { CheckPointType } from 'src/types/interfaces/checkpoint-type.enum';
import { CreateCheckPointDto } from '../checkpoint/dto/create-checkpoint.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class ScheduleService {
  constructor(
    private campaignService: CampaignService,
    private familyService: FamilyService,
    private userService: UserService,
    private analyticService: AnalyticService,
    private readonly analyticPublicService: AnalyticPublicService,
    private checkPointService: CheckPointService,
  ) {}
  private readonly logger = new Logger(ScheduleService.name);

  // first store the list of needs paid by roles - then call these methods in cache this.roleScatteredData() this.theQuartile();
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
    // if (process.env.NODE_ENV === 'production') {
    // await this.campaignService.sendUserMonthlyCampaigns();
    // }
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

  // run daily at 00:05 Tehran time and only act if it's the 1st day of the Jalali month
  // @Timeout(5000)
  @Cron('0 5 0 * * *', {
    name: 'CompletePaymentsAtStartOfJalaliMonth',
    timeZone: 'Asia/Tehran',
  })
  async handleStartOfJalaliMonthCron() {
    try {
      // get precise time in Tehran
      const tehran = DateTime.now().setZone('Asia/Tehran');

      // convert to Jalali
      const { jy, jm, jd } = toJalaali(tehran.year, tehran.month, tehran.day);

      this.logger.warn(`Cron for check-points -> Jalali ${jy}/${jm}/${jd}`);

      // run only on the first day of Jalali month
      if (jd === 22) {
        this.logger.warn(
          `Beginning of Jalali month detected (${jy}/${jm}/01). Running completePays().`,
        );

        // make sure to await
        const sayUser = await this.userService.getUserByFlaskId(208);

        // construct DTO
        const dto: CreateCheckPointDto = {
          title: `Complete payments - ${jy}/${jm}/01`,
          description: `Auto-created checkpoint for start of Jalali month ${jy}/${jm}/01`,
          url: 'https://example.org/...',
          type: CheckPointType.SEASONAL_REPORT,
          // use full ISO timestamp (includes offset); IsDateString accepts ISO8601
          checkPointDate: tehran.startOf('day').toISO(),
        };
        const created = await this.checkPointService.createForBuilder(
          sayUser,
          dto,
        );
        this.logger.log(`Created checkpoint id=${created.id}`);
      } else {
        this.logger.warn('Not the first day of a Jalali month — skipping.');
      }
    } catch (err) {
      this.logger.error('Error in handleStartOfJalaliMonthCron', err as any);
    }
  }
}
