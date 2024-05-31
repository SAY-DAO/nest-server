import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ServerError } from 'src/filters/server-exception.filter';
import { ChildrenService } from '../children/children.service';
import { NeedService } from '../need/need.service';
import {
  isUnpayable,
  fetchCampaignCode,
  persianMonthStringFarsi,
  prepareUrl,
  removeDuplicates,
  shuffleArray,
  sleep,
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
import { isURL } from 'class-validator';
import { UrlEntity } from 'src/entities/url.entity';
import { nanoid } from 'nanoid';
import { ShortenURLDto } from 'src/types/dtos/url.dto';
import MelipayamakApi from 'melipayamak';
import {
  PaginateQuery,
  Paginated,
  paginate as nestPaginate,
} from 'nestjs-paginate';

@Injectable()
export class CampaignService {
  constructor(
    @InjectRepository(CampaignEntity)
    private campaignRepository: Repository<CampaignEntity>,
    @InjectRepository(UrlEntity)
    private urlRepository: Repository<UrlEntity>,
    private needService: NeedService,
    private userService: UserService,
    private familyService: FamilyService,
    private mailerService: MailerService,
    private childrenService: ChildrenService,
  ) {}
  private readonly logger = new Logger(CampaignService.name);
  smsApi = new MelipayamakApi(process.env.SMS_USER, process.env.SMS_PASSWORD);
  smsRest = this.smsApi.sms();

  async handleEmailCampaign(
    campaignEmailCode: string,
    tittle: string,
    emailCampaign: CampaignEntity,
    emailReceivers: any[],
  ) {
    if (!emailCampaign && emailReceivers && emailReceivers[0]) {
      await this.createCampaign(
        campaignEmailCode,
        CampaignNameEnum.MONTHLY_CAMPAIGNS,
        CampaignTypeEnum.EMAIL,
        tittle,
        emailReceivers,
      );
      this.logger.log(`EMAIL: Campaign Created - ${campaignEmailCode}`);
    }

    if (emailCampaign && emailReceivers && emailReceivers[0]) {
      await this.updateCampaignUsers(
        emailCampaign,
        emailCampaign.receivers,
        emailReceivers,
      );
      this.logger.log(`EMAIL: Campaign Updated - ${campaignEmailCode}`);
    }
  }

  async handleSmsCampaign(
    campaignSmsCode: string,
    tittle: string,
    smsCampaign: CampaignEntity,
    smsReceivers: any[],
  ) {
    if (!smsCampaign && smsReceivers && smsReceivers[0]) {
      await this.createCampaign(
        campaignSmsCode,
        CampaignNameEnum.MONTHLY_CAMPAIGNS,
        CampaignTypeEnum.SMS,
        tittle,
        smsReceivers,
      );
      this.logger.log(`SMS: Campaign Created - ${campaignSmsCode}`);
    }

    if (smsCampaign && smsReceivers[0]) {
      await this.updateCampaignUsers(
        smsCampaign,
        smsCampaign.receivers,
        smsReceivers,
      );
      this.logger.log(`SMS: Campaign Updated - ${campaignSmsCode}`);
    }
  }

  async childrenWithNoNeed() {
    this.logger.log(`Updating children with no needs.`);
    const children = await this.childrenService.getFlaskActiveChildren();
    const list = [];
    for await (const child of children) {
      const childUnpaidNeeds = await this.needService.getFlaskChildUnpaidNeeds(
        child.id,
      );
      const childUnconfirmedNeeds =
        await this.needService.getFlaskChildUnconfirmedNeeds(child.id);
      const allUnpaidNeeds = childUnpaidNeeds.concat(childUnconfirmedNeeds);

      if (!allUnpaidNeeds || !allUnpaidNeeds[0]) {
        list.push({
          swId: child.id_social_worker,
          child,
        });
      }
    }
    // save in cache for admin dashboard
    config().dataCache.updateChildrenNoNeeds(list.length);
    this.logger.log(`Updated children with no need.`);
    return list;
  }

  async getCampaigns(
    options: PaginateQuery,
  ): Promise<Paginated<CampaignEntity>> {
    const queryBuilder = this.campaignRepository
      .createQueryBuilder('campaign')
      .leftJoin('campaign.receivers', 'receiver')
      .select(['campaign', 'receiver.id']);

    return await nestPaginate<CampaignEntity>(options, queryBuilder, {
      sortableColumns: ['id'],
      defaultSortBy: [['createdAt', 'DESC']],
      nullSort: 'last',
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

  getCampaignByCampaignCode(
    campaignCode: string,
    type: CampaignTypeEnum,
  ): Promise<CampaignEntity> {
    const need = this.campaignRepository.findOne({
      where: {
        campaignCode,
        type,
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
    const title = `${preChild.sayName.fa} تأیید شد`;

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

  async sendSwChildNoNeedReminder() {
    const list = await this.childrenWithNoNeed();
    const swIds = removeDuplicates(list.map((e) => e.swId));
    try {
      for await (const id of swIds) {
        const selected = list.filter((e) => e.swId === id);
        const socialWorker = await this.userService.getFlaskSw(Number(id));
        const swChildren = selected.map((s) => s.child);
        this.logger.warn(
          `Emailing: Social worker ${socialWorker.id} of children with no need!`,
        );
        await this.mailerService.sendMail({
          from: '"NGOs" <ngo@saydao.org>', // override default from
          to: socialWorker.email,
          bcc: process.env.SAY_ADMIN_EMAIL,
          subject: `${swChildren.length} کودک بدون نیاز ثبت شده`,
          template: './swRemindNoNeeds', // `.hbs` extension is appended automatically
          context: {
            children: swChildren,
            userName: socialWorker.firstName
              ? socialWorker.firstName
              : socialWorker.userName,
          },
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  async sendUserMonthlyCampaigns() {
    try {
      // campaign codes
      const campaignEmailCode = fetchCampaignCode(
        CampaignNameEnum.MONTHLY_CAMPAIGNS,
        CampaignTypeEnum.EMAIL,
      );
      const campaignSmsCode = fetchCampaignCode(
        CampaignNameEnum.MONTHLY_CAMPAIGNS,
        CampaignTypeEnum.SMS,
      );

      const emailCampaign = await this.getCampaignByCampaignCode(
        campaignEmailCode,
        CampaignTypeEnum.EMAIL,
      );
      const smsCampaign = await this.getCampaignByCampaignCode(
        campaignSmsCode,
        CampaignTypeEnum.SMS,
      );

      // Notify admin if running out of sms credit
      const credit = await this.smsRest.getCredit();
      if (Number(credit.Value) < 150) {
        const to = process.env.SAY_ADMIN_SMS;
        const from = process.env.SMS_FROM;
        const text = `سلام،\nتعداد پیامک شما رو به پایان است. \n با احترام \n SAY \n لغو۱۱`;
        await this.smsRest.send(to, from, text);
        throw new ForbiddenException('We need to charge the sms provider');
      }

      // 0 -setup
      const persianStringMonth = persianMonthStringFarsi(new Date());
      if (!persianStringMonth) {
        throw new ServerError('We need the month string');
      }
      const tittle = `نیازهای ${persianStringMonth} ماه کودکان شما`;

      const flaskUsers = await this.userService.getFlaskUsers();
      const shuffledUsers = shuffleArray(flaskUsers);

      let alreadyReceivedEmailCount = 0;
      let alreadyReceivedSmsCount = 0;
      let skippedUsersNoChildren = 0;
      let skippedUsersNoUnpaid = 0;
      let turnedOffCount = 0;
      let emailReceiversTotal = 0;
      let smsReceiversTotal = 0;

      // const testUsers = [
      //   await this.userService.getFlaskUser(12687),
      //   await this.userService.getFlaskUser(115),
      // ];
      // shuffledUsers = testUsers;
      // if (shuffledUsers.length > 2) {
      //   return;
      // }

      // 1- loop shuffled users
      for await (const flaskUser of shuffledUsers) {
        const eligibleChildren = [];
        let nestUser = await this.userService.getFamilyByFlaskId(flaskUser.id);
        if (!nestUser) {
          nestUser = await this.userService.createFamily(flaskUser.id);
        }
        // 2- eligible to receive?
        if (!nestUser.monthlyCampaign) {
          turnedOffCount++;
          continue;
        }
        if (emailCampaign) {
          const alreadyReceivedEmail = emailCampaign.receivers.find(
            (r) => r.flaskUserId === flaskUser.id,
          );
          if (alreadyReceivedEmail) {
            this.logger.warn(`Already Received Email: ${nestUser.flaskUserId}`);
            alreadyReceivedEmailCount++;
            continue;
          }
        }

        if (smsCampaign) {
          const alreadyReceivedSms = smsCampaign.receivers.find(
            (r) => r.flaskUserId === flaskUser.id,
          );
          if (alreadyReceivedSms) {
            this.logger.warn(`Already Received Sms: ${nestUser.flaskUserId}`);
            alreadyReceivedSmsCount++;
            continue;
          }
        }

        // 3- get user children & shuffle
        const userChildren = (
          await this.childrenService.getMyChildren(flaskUser.id)
        ).filter((c) => c.existence_status === ChildExistence.AlivePresent);

        // 4- send campaign users with no children
        if (!userChildren || !userChildren[0]) {
          if (flaskUser.is_email_verified) {
            try {
              this.logger.warn(
                `Sending expand family Email to: ${flaskUser.emailAddress}`,
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
              await this.handleEmailCampaign(
                campaignEmailCode,
                tittle,
                emailCampaign,
                [nestUser],
              );
            } catch (e) {
              console.log(e);
              continue;
            }
          }

          if (flaskUser.is_phonenumber_verified) {
            const to = flaskUser.phone_number;
            const from = process.env.SMS_FROM;
            const shortNeedUrl = await this.shortenUrl({
              longUrl: `https://dapp.saydao.org/main/search?utm_source=monthly_campaign&utm_medium=${CampaignTypeEnum.SMS}&utm_campaign=${CampaignNameEnum.MONTHLY_CAMPAIGNS}&utm_id=${campaignSmsCode}`,
            });
            this.logger.warn(`Sending expand family SMS to: ${to}`);

            const text = `سلام ${
              flaskUser.firstName ? flaskUser.firstName : flaskUser.userName
            }، شما در حال حاضر سرپرستی هیچ کودکی را ندارید، برای گسترش خانواده مجازی‌تان: ${shortNeedUrl} \n لغو۱۱`;
            const result = await this.smsRest.send(to, from, text);
            console.log('result');
            console.log(result);
            console.log('result');
            sleep(50000);
          }
          await this.handleSmsCampaign(campaignSmsCode, tittle, smsCampaign, [
            nestUser,
          ]);
          skippedUsersNoChildren++;
          continue;
        }

        let counter = 1;
        // 5- loop shuffled children
        for await (const child of shuffleArray(userChildren)) {
          if (counter <= 3) {
            const childUnpaidNeeds = (
              await this.needService.getFlaskChildUnpaidNeeds(child.id)
            ).filter((n) => !isUnpayable(n));
            if (!childUnpaidNeeds || !childUnpaidNeeds[0]) {
              // we separately email social workers
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
                    n.type === NeedTypeEnum.PRODUCT && n.img
                      ? n.img
                      : prepareUrl(n.imageUrl),
                };
              }),
            };
            eligibleChildren.push(theChild);
          }
        }
        if (!eligibleChildren || !eligibleChildren[0]) {
          skippedUsersNoUnpaid++;
          continue;
        }

        // 7 - Send Campaign
        if (flaskUser.is_email_verified) {
          const googleCampaignBuilder = String(
            `?utm_source=monthly_campaign&utm_medium=${CampaignTypeEnum.EMAIL}&utm_campaign=${CampaignNameEnum.MONTHLY_CAMPAIGNS}&utm_id=${campaignEmailCode}`,
          );

          const readyToSignNeeds = (
            await this.familyService.getFamilyReadyToSignNeeds(flaskUser.id)
          ).filter((n) => n.midjourneyImage);
          try {
            this.logger.warn(
              `Sending campaign Email to: ${flaskUser.emailAddress}`,
            );

            await this.mailerService.sendMail({
              to: flaskUser.emailAddress,
              subject: `نیازهای ${persianStringMonth} ماه کودکان شما`,
              template: './monthlyCampaign', // `.hbs` extension is appended automatically
              context: {
                myChildren: eligibleChildren,
                readyToSignNeeds,
                googleCampaignBuilder,
              },
            });
          } catch (e) {
            console.log(e);
            continue;
          }

          await this.handleEmailCampaign(
            campaignEmailCode,
            tittle,
            emailCampaign,
            [nestUser],
          );
          this.logger.log(`Email Sent to User: ${nestUser.flaskUserId}`);
          emailReceiversTotal++;
        }

        if (flaskUser.is_phonenumber_verified) {
          const to = flaskUser.phone_number;
          const from = process.env.SMS_FROM;
          const shortNeedUrl = await this.shortenUrl({
            longUrl: `https://dapp.saydao.org/child/${eligibleChildren[0].id}/needs/${eligibleChildren[0].unPaidNeeds[0].id}?utm_source=monthly_campaign&utm_medium=${CampaignTypeEnum.SMS}&utm_campaign=${CampaignNameEnum.MONTHLY_CAMPAIGNS}&utm_id=${campaignSmsCode}`,
          });
          this.logger.warn(`Sending campaign SMS to: ${to}`);

          const text = `سلام ${
            flaskUser.firstName ? flaskUser.firstName : flaskUser.userName
          }،\n از آخرین نیازهای کودک شما، ${
            eligibleChildren[0].sayName
          }: ${shortNeedUrl} لغو۱۱`;

          const result = await this.smsRest.send(to, from, text);
          console.log('result');
          console.log(result);
          console.log('result');
          sleep(50000);

          await this.handleSmsCampaign(campaignSmsCode, tittle, smsCampaign, [
            nestUser,
          ]);

          this.logger.log(`SMS Sent to User: ${nestUser.flaskUserId}`);

          smsReceiversTotal++;
        }
      }

      this.logger.warn(
        `Did Not reach: ${skippedUsersNoUnpaid} users did not have unpaidNeeds`,
      );
      this.logger.warn(
        `Did Not reach: ${skippedUsersNoChildren} users did not have an active child`,
      );
      this.logger.warn(
        `Did Not reach: ${alreadyReceivedEmailCount} users have already received Email`,
      );
      this.logger.warn(
        `Did Not reach: ${alreadyReceivedSmsCount} users have already received Sms`,
      );
      this.logger.warn(
        `Did Not reach: ${turnedOffCount} users have turned off monthly campaign`,
      );
      this.logger.log(
        `All done for this month. - ${tittle} - SMS:${smsReceiversTotal} - Email:${emailReceiversTotal} - Out of ${flaskUsers.length}`,
      );
    } catch (e) {
      console.log(e);

      throw new ServerError(e.message, e.status);
    }
  }

  async shortenUrl(url: ShortenURLDto) {
    const { longUrl } = url;
    //checks if longUrl is a valid URL
    if (!isURL(longUrl)) {
      throw new BadRequestException('String Must be a Valid URL');
    }
    const urlCode = nanoid(10);
    const baseURL = 'https://nest.saydao.org/api/dao/campaign';
    try {
      // check if the URL has already been shortened
      let url = await this.urlRepository.findOneBy({ longUrl });
      // return it if it exists
      if (url) return url.shortUrl;

      // if it doesn't exist, shorten it
      const shortUrl = `${baseURL}/${urlCode}`;

      //add the new record to the database
      url = this.urlRepository.create({
        urlCode,
        longUrl,
        shortUrl,
      });

      this.urlRepository.save(url);
      return url.shortUrl;
    } catch (e) {
      throw new UnprocessableEntityException('Server Error');
    }
  }

  async redirect(urlCode: string) {
    try {
      const url = await this.urlRepository.findOneBy({ urlCode });
      if (url) return url;
    } catch (e) {
      throw new NotFoundException('Resource Not Found');
    }
  }
}
