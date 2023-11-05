import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ServerError } from 'src/filters/server-exception.filter';
import { ChildrenService } from '../children/children.service';
import { NeedService } from '../need/need.service';
import {
  persianMonth,
  persianMonthString,
  prepareUrl,
  shuffleArray,
  sortNeeds,
} from 'src/utils/helpers';
import {
  CampaignEnum,
  CampaignTypeEnum,
  ChildExistence,
  NeedTypeEnum,
  PaymentStatusEnum,
} from 'src/types/interfaces/interface';
import { FamilyService } from '../family/family.service';
import { CampaignEntity } from 'src/entities/campaign.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NeedEntity } from 'src/entities/need.entity';
import { SignatureEntity } from 'src/entities/signature.entity';
import { AllUserEntity } from 'src/entities/user.entity';

@Injectable()
export class MailService {
  constructor(
    @InjectRepository(CampaignEntity)
    private campaignRepository: Repository<CampaignEntity>,
    private needService: NeedService,
    private userService: UserService,
    private familyService: FamilyService,
    private childrenService: ChildrenService,
  ) {}

  getCampaigns(): Promise<CampaignEntity[]> {
    return this.campaignRepository.find();
  }
  getCampaignsByFlaskNeedId(flaskId: number): Promise<CampaignEntity[]> {
    const need = this.campaignRepository.find({
      where: {
        contentNeeds: {
          flaskId,
        },
      },
    });
    return need;
  }

  getCampaignById(id: string): Promise<CampaignEntity> {
    const need = this.campaignRepository.findOne({
      where: {
        id,
      },
    });
    return need;
  }

  createCampaign(
    campaignNumber: number,
    campaign: CampaignEnum,
    type: CampaignTypeEnum,
    title: string,
    needs: NeedEntity[],
    signatures: SignatureEntity[],
    users: AllUserEntity[],
  ) {
    const newCampaign = this.campaignRepository.create({
      campaignNumber,
      campaign,
      title,
      type,
    });
    newCampaign.contentNeeds = needs;
    newCampaign.contentSignatures = signatures;
    newCampaign.receivers = users;
    return this.campaignRepository.save(newCampaign);
  }

  async sendUserSummaries() {
    const users = await this.userService.getFlaskUsers();
    try {
      const d = new Date();
      const pm = persianMonthString(d);
      const month =
        pm === 'Farvardin'
          ? 'فروردین'
          : pm === 'Ordibehesht'
          ? 'اردیبهست'
          : pm === 'Khordad'
          ? 'خرداد'
          : pm === 'Tir'
          ? 'تیر'
          : pm === 'Mordad'
          ? 'مرداد'
          : pm === 'Shahrivar'
          ? 'شهریور'
          : pm === 'Mehr'
          ? 'مهر'
          : pm === 'Aban'
          ? 'آبان'
          : pm === 'Azar'
          ? 'آذر'
          : pm === 'Dey'
          ? 'دی'
          : pm === 'Bahman'
          ? 'بهمن'
          : pm === 'Esfand'
          ? 'اسفند'
          : null;

      if (!month) {
        throw new ServerError('We need the month string');
      }

      const tittle = `نیازهای ${month} ماه کودکان شما`;

      const today = new Date();
      const englishMonth = today.getMonth();
      const englishYear = today.getFullYear();
      const campaignNumber = Number(`${englishMonth}${englishYear}`);
      const receivers = [];
      const contentNeeds = [];
      const contentSignatures = [];
      for await (const user of shuffleArray(
        users.filter((u) => u.userName === 'ehsan'),
      )) {
        let nestUser = await this.userService.getFamilyByFlaskId(user.id);
        if (!nestUser) {
          nestUser = await this.userService.createFamily(user.id);
        }
        const myChildren = [];
        if (
          nestUser.monthlyEmail ||
          nestUser.campaigns.find((c) => c.campaignNumber === campaignNumber)
        ) {
          // 1 - get children who are presents
          const children = (
            await this.childrenService.getMyChildren(user.id)
          ).filter((c) => c.existence_status === ChildExistence.AlivePresent);

          // shuffle children and get needs per child
          for await (const child of shuffleArray(children)) {
            if (myChildren.length < 3) {
              const childUnpaidNeeds =
                await this.needService.getFlaskChildUnpaidNeeds(child.id);

              const shuffledNeeds = shuffleArray(childUnpaidNeeds);

              // prioritize partial paid needs and take the first two need
              const organizedNeeds = shuffledNeeds
                .sort((a, b) => b.status - a.status)
                .slice(0, 2);
              console.log(child.id + '--------- Child--------');
              shuffledNeeds.forEach((n) => console.log(n.status));
              console.log('-----------------');
              organizedNeeds.forEach((n) => console.log(n.status));

              // const noPayments = shuffledNeeds.filter(
              //   (n) => n.status === PaymentStatusEnum.NOT_PAID,
              // );
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
              contentNeeds.push([...organizedNeeds]);
              myChildren.push(theChild);
            }
          }
          const readyToSignNeeds = (
            await this.familyService.getFamilyReadyToSignNeeds(user.id)
          ).filter((n) => n.midjourneyImage);

          // await this.mailerService.sendMail({
          // to: user.emailAddress,
          // from: '"Support Team" <support@example.com>', // override default from
          // subject: `نیازهای ${month} ماه کودکان شما`,
          // template: './monthlySummary', // `.hbs` extension is appended automatically
          // context: {
          //   myChildren,
          //   readyToSignNeeds,
          // },
          // });
          contentSignatures.push(readyToSignNeeds);
          receivers.push(nestUser);
        } else {
          continue;
        }
      }
      await this.createCampaign(
        campaignNumber,
        CampaignEnum.MONTHLY_SUMMARIES,
        CampaignTypeEnum.EMAIL,
        tittle,
        contentNeeds,
        contentSignatures,
        receivers,
      );
    } catch (e) {
      console.log(e);
      throw new ServerError('Cold not send email!');
    }
  }
}
