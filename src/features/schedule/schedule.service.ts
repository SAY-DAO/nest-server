import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { NeedService } from '../need/need.service';
import { VirtualFamilyRole } from 'src/types/interfaces/interface';
import { calculateRolesPayments } from 'src/utils/helpers';
import config from 'src/config';
@Injectable()
export class ScheduleService {
  constructor(private needService: NeedService) {}
  private readonly logger = new Logger(ScheduleService.name);

  async helper() {
    const father = await this.needService.getFamilyRoleDelivered(
      VirtualFamilyRole.FATHER,
      0,
    );
    const mother = await this.needService.getFamilyRoleDelivered(
      VirtualFamilyRole.MOTHER,
      0,
    );
    const amoo = await this.needService.getFamilyRoleDelivered(
      VirtualFamilyRole.AMOO,
      0,
    );
    const khaleh = await this.needService.getFamilyRoleDelivered(
      VirtualFamilyRole.KHALEH,
      0,
    );
    const daei = await this.needService.getFamilyRoleDelivered(
      VirtualFamilyRole.DAEI,
      0,
    );
    const amme = await this.needService.getFamilyRoleDelivered(
      VirtualFamilyRole.AMME,
      0,
    );

    const fathersFinal = calculateRolesPayments(
      father,
      VirtualFamilyRole.FATHER,
    );
    const mothersFinal = calculateRolesPayments(
      mother,
      VirtualFamilyRole.MOTHER,
    );
    const amoosFinal = calculateRolesPayments(amoo, VirtualFamilyRole.AMOO);
    const daeisFinal = calculateRolesPayments(daei, VirtualFamilyRole.DAEI);
    const khalehsFinal = calculateRolesPayments(
      khaleh,
      VirtualFamilyRole.KHALEH,
    );
    const ammesFinal = calculateRolesPayments(amme, VirtualFamilyRole.AMME);

    console.log(
      father[1] + mother[1] + amoo[1] + khaleh[1] + daei[1] + amme[1],
    );

    console.log('---- counters ----');
    console.log('father: ' + father[1]);
    console.log('mother: ' + mother[1]);
    console.log('amoo: ' + amoo[1]);
    console.log('khaleh: ' + khaleh[1]);
    console.log('daei: ' + daei[1]);
    console.log('amme: ' + amme[1]);

    config().dataCache.store({
      fathersAvg: fathersFinal.roleAvg,
      mothersAvg: mothersFinal.roleAvg,
      amoosAvg: amoosFinal.roleAvg,
      daeisAvg: daeisFinal.roleAvg,
      khalehsAvg: khalehsFinal.roleAvg,
      ammesAvg: ammesFinal.roleAvg,
      fatherData: father[0],
      motherData: mother[0],
      amooData: amoo[0],
      khalehData: khaleh[0],
      daeiData: daei[0],
      ammeData: amme[0],
    });
  }

  @Timeout(2000)
  @Cron(CronExpression.EVERY_SECOND)
  async handleCronOnce() {
    this.logger.debug(
      'Called only once after 10 seconds of the server initiation',
    );
    console.log(new Date(new Date(1690848000000)));
    this.helper();
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
