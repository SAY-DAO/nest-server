import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ServerError } from 'src/filters/server-exception.filter';
import { ChildrenService } from '../children/children.service';
import { NeedService } from '../need/need.service';
import {
  fetchCampaginCode as fetchCampaignCode,
  persianMonthStringFarsi,
  prepareUrl,
  removeDuplicates,
  shuffleArray,
} from 'src/utils/helpers';
import {
  CampaignNameEnum,
  CampaignTypeEnum,
  ChildExistence,
  NeedTypeEnum,
  PanelContributors,
} from 'src/types/interfaces/interface';
import { FamilyService } from '../family/family.service';
import { CampaignEntity } from 'src/entities/campaign.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AllUserEntity } from 'src/entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import config from 'src/config';
import { ChildrenPreRegisterEntity } from 'src/entities/childrenPreRegister.entity';

@Injectable()
export class CampaignService {
  constructor(
    @InjectRepository(CampaignEntity)
    private campaignRepository: Repository<CampaignEntity>,
    private needService: NeedService,
    private userService: UserService,
    private familyService: FamilyService,
    private mailerService: MailerService,
    private childrenService: ChildrenService,
  ) { }
  private readonly logger = new Logger(CampaignService.name);

  getCampaigns(): Promise<CampaignEntity[]> {
    return this.campaignRepository.find({
      relations: {
        receivers: true,
      },
    });
  }

  getCampaignById(id: string): Promise<CampaignEntity> {
    const need = this.campaignRepository.findOne({
      where: {
        id,
      },
    });
    return need;
  }

  getCampaignByCampaignCode(campaignCode: string): Promise<CampaignEntity> {
    const need = this.campaignRepository.findOne({
      where: {
        campaignCode,
      },
    });
    return need;
  }

  createCampaign(
    campaignCode: string,
    campaignName: CampaignNameEnum,
    type: CampaignTypeEnum,
    title: string,
    users: AllUserEntity[],
  ) {
    const newCampaign = this.campaignRepository.create({
      campaignCode,
      campaignName: campaignName,
      title,
      type,
    });

    newCampaign.receivers = users;
    return this.campaignRepository.save(newCampaign);
  }

  async updateCampaignUsers(
    campaign: CampaignEntity,
    currentReceivers: AllUserEntity[],
    users: AllUserEntity[],
  ): Promise<CampaignEntity> {
    const newReceivers = currentReceivers
      ? [...currentReceivers, ...users]
      : [...users];
    campaign.receivers = newReceivers;
    return this.campaignRepository.save(campaign);
  }

  async sendSwChildConfirmation(
    swId: number,
    preChild: ChildrenPreRegisterEntity,
  ) {
    const socialWorker = await this.userService.getContributorByFlaskId(
      swId,
      PanelContributors.SOCIAL_WORKER,
    );
    const email = (await this.userService.getFlaskSw(swId)).email;

    const campaignCode = fetchCampaignCode(
      CampaignNameEnum.CHILD_CONFIRMATION,
      CampaignTypeEnum.EMAIL,
    );
    const campaign = this.getCampaignByCampaignCode(campaignCode);
    if (campaign) {
      const title = `${preChild.sayName.fa} تأیید شد`;
      await this.createCampaign(
        campaignCode,
        CampaignNameEnum.CHILD_CONFIRMATION,
        CampaignTypeEnum.EMAIL,
        title,
        [socialWorker],
      );
      this.logger.warn(
        `Emailing: Social worker ${socialWorker.flaskUserId} for new child Confirm!`,
      );

      await this.mailerService.sendMail({
        from: '"NGOs" <ngo@saydao.org>', // override default from
        to: email,
        bcc: process.env.SAY_ADMIN_EMAIL,
        subject: title,
        template: './swConfirmedChild', // `.hbs` extension is appended automatically
        context: {
          avatarAwake: preChild.awakeUrl,
          sayName: preChild.sayName.fa,
          firstName: preChild.firstName.fa,
          lastName: preChild.lastName.fa,
          userName: socialWorker.firstName
            ? socialWorker.firstName
            : socialWorker.userName,
        },
      });
    }
  }

  async sendSwMonthlyReminder() {
    const children = await this.childrenService.getFlaskActiveChildren();
    const list = [];
    for await (const child of children) {
      const childUnpaidNeeds = await this.needService.getFlaskChildUnpaidNeeds(
        child.id,
      );
      const childUnconfirmedNeeds =
        await this.needService.getFlaskChildUnconfirmedNeeds(child.id);
      const allNeeds = childUnpaidNeeds.concat(childUnconfirmedNeeds);

      if (!allNeeds || !allNeeds[0]) {
        list.push({
          swId: child.id_social_worker,
          child,
        });
      }
    }
    config().dataCache.updateChildrenNoNeeds(list.length);

    const swIds = removeDuplicates(list.map((e) => e.swId));
    for (let i = 0; i < swIds.length; i++) {
      const selected = list.filter((e) => e.swId === swIds[i]);
      const socialWorker = await this.userService.getFlaskSw(Number(swIds[i]));
      const swChildren = selected.map((s) => s.child);
      this.logger.warn(
        `Emailing: Social worker ${socialWorker.id} of children with no need!`,
      );

      await this.mailerService.sendMail({
        from: '"NGOs" <ngo@saydao.org>', // override default from
        to: socialWorker.email,
        bcc: process.env.SAY_ADMIN_EMAIL,
        subject: `${swChildren.length} کودک بدون نیاز ثبت شده`,
        template: './monthlyReminder', // `.hbs` extension is appended automatically
        context: {
          children: swChildren,
          userName: socialWorker.firstName
            ? socialWorker.firstName
            : socialWorker.userName,
        },
      });
    }
  }

  async sendUserMonthlySummaries() {
    try {
      const today = new Date();
      const campaignCode = fetchCampaignCode(
        CampaignNameEnum.MONTHLY_SUMMARIES,
        CampaignTypeEnum.EMAIL,
      );
      const persianMonth = persianMonthStringFarsi(today);
      if (!persianMonth) {
        throw new ServerError('We need the month string');
      }
      const tittle = `نیازهای ${persianMonth} ماه کودکان شما`;

      const receivers = [];
      const users = await this.userService.getFlaskUsers();
      const shuffledUsers = shuffleArray(
        users.filter((u) => u.userName === 'ehsan'),
      );
      const campaign = await this.getCampaignByCampaignCode(campaignCode);
      // 1- loop shuffled users
      for await (const flaskUser of shuffledUsers) {
        if (flaskUser.emailAddress) {
          let nestUser = await this.userService.getFamilyByFlaskId(
            flaskUser.id,
          );
          // 2- eligible to receive?
          if (!nestUser) {
            nestUser = await this.userService.createFamily(flaskUser.id);
          }
          if (campaign) {
            const alreadyReceived = campaign.receivers.find(
              (r) => r.flaskUserId === flaskUser.id,
            );
            if (!alreadyReceived) {
              this.logger.log(
                `Skipping: User ${nestUser.flaskUserId} has already received this email - ${campaignCode}`,
              );
              continue;
            }
          }

          if (!nestUser.monthlyEmail) {
            this.logger.debug(
              `Skipping: User ${nestUser.flaskUserId} has turned off monthly summaries - ${campaignCode}`,
            );
            continue;
          }
          // 3- get user children & shuffle
          const children = (
            await this.childrenService.getMyChildren(flaskUser.id)
          ).filter((c) => c.existence_status === ChildExistence.AlivePresent);

          // 4- send mail users with no children
          if (children || !children[0]) {
            this.logger.warn(
              `Emailing: User ${nestUser.flaskUserId} because has no children! - ${campaignCode}`,
            );
            await this.mailerService.sendMail({
              to: flaskUser.emailAddress,
              subject: `گسترش خانواده مجازی`,
              template: './expandFamilyNoChild', // `.hbs` extension is appended automatically
              context: {
                userName: flaskUser.firstName
                  ? flaskUser.firstName
                  : flaskUser.userName,
              },
            });
            receivers.push(nestUser);
            continue;
          }

          const userChildren = [];
          let counter = 1;
          // 5- loop shuffled children
          for await (const child of shuffleArray(children)) {
            if (counter <= 3) {
              const childUnpaidNeeds =
                await this.needService.getFlaskChildUnpaidNeeds(child.id);
              if (!childUnpaidNeeds || !childUnpaidNeeds[0]) {
                // we separately email social workers
                this.logger.debug(
                  `Skipping: Child ${child.id} has no unpaid needs - ${campaignCode}`,
                );
                continue;
              }
              counter++;

              // 6- shuffle children needs and create an object - prioritize partial paid needs
              const TAKE = 2;
              const shuffledNeeds = shuffleArray(childUnpaidNeeds);
              const organizedNeeds = shuffledNeeds
                .sort((a, b) => b.status - a.status)
                .slice(0, TAKE);

              const theChild = {
                id: child.id,
                sayName: child.sayname_translations.fa,
                avatar: prepareUrl(child.awakeAvatarUrl),
                unPaidNeeds: organizedNeeds.map((n) => {
                  return {
                    id: n.id,
                    name: n.name_translations.fa,
                    price: n._cost.toLocaleString(),
                    image:
                      n.type === NeedTypeEnum.PRODUCT
                        ? n.img
                        : prepareUrl(n.imageUrl),
                  };
                }),
              };
              userChildren.push(theChild);
            }
          }
          if (!userChildren || !userChildren[0]) {
            this.logger.warn(
              `Skipping: User ${nestUser.flaskUserId}'s children have no unpaidNeeds! - ${campaignCode}`,
            );
            continue;
          }

          const readyToSignNeeds = (
            await this.familyService.getFamilyReadyToSignNeeds(flaskUser.id)
          ).filter((n) => n.midjourneyImage);

          this.logger.warn(
            `Emailing: User ${nestUser.flaskUserId} the Campaign! - ${campaignCode}`,
          );
          await this.mailerService.sendMail({
            to: flaskUser.emailAddress,
            subject: `نیازهای ${persianMonth} ماه کودکان شما`,
            template: './monthlyCampaign', // `.hbs` extension is appended automatically
            context: {
              myChildren: userChildren,
              readyToSignNeeds,
            },
          });
          receivers.push(nestUser);
          this.logger.debug(`Email Sent to User: ${nestUser.flaskUserId}`);
        }
      }

      if (!campaign) {
        await this.createCampaign(
          campaignCode,
          CampaignNameEnum.MONTHLY_SUMMARIES,
          CampaignTypeEnum.EMAIL,
          tittle,
          receivers,
        );
        this.logger.log(`Campaign Created - ${campaignCode}`);
      } else if (campaign && receivers[0]) {
        this.logger.log(`Campaign Updating - ${campaignCode}`);
        await this.updateCampaignUsers(campaign, campaign.receivers, receivers);
        this.logger.log(`Campaign Updated - ${campaignCode}`);
      } else {
        this.logger.debug(`No email was sent - ${campaignCode}`);
      }
    } catch (e) {
      console.log(e);
      throw new ServerError('Cold not send email!');
    }
  }
}
