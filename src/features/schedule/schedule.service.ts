import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { VirtualFamilyRole } from 'src/types/interfaces/interface';
import config from 'src/config';
import { FamilyService } from '../family/family.service';

@Injectable()
export class ScheduleService {
  constructor(private familyService: FamilyService) {}
  private readonly logger = new Logger(ScheduleService.name);

  async helper() {
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

  @Timeout(2000)
  @Cron(CronExpression.EVERY_SECOND)
  async handleCronOnce() {
    this.logger.debug(
      'Called only once after 10 seconds of the server initiation',
    );
    this.helper();
    this.rolesCount();
  }

  @Cron(CronExpression.EVERY_WEEK)
  async handleCron() {
    this.logger.debug('Called every Week');
    const data = config().dataCache.fetchFamilyAll();
    if (!data) {
      this.helper();
    } else {
      this.logger.debug('Reading from cache');
      console.log(data);
    }
  }
}
