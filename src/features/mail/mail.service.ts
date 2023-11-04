import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ServerError } from 'src/filters/server-exception.filter';
import { ChildrenService } from '../children/children.service';
import { NeedService } from '../need/need.service';
import { prepareUrl, shuffleArray } from 'src/utils/helpers';
import { WalletService } from '../wallet/wallet.service';
import {
  ChildExistence,
  NeedTypeEnum,
  PaymentStatusEnum,
} from 'src/types/interfaces/interface';
import { MineService } from '../mine/mine.service';
import { FamilyService } from '../family/family.service';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private needService: NeedService,
    private userService: UserService,
    private familyService: FamilyService,
    private childrenService: ChildrenService,
  ) {}

  async sendUserSummaries() {
    const users = await this.userService.getFlaskUsers();
    try {
      // for await (const user of shuffleArray(users)) {
      const user = users.find((u) => u.userName === 'ehsan');
      let nestUser = await this.userService.getFamilyByFlaskId(user.id);
      if (!nestUser) {
        nestUser = await this.userService.createFamily(user.id);
      }
      const myChildren = [];
      if (nestUser.monthlyEmail) {
        const readyToSignNeeds = (
          await this.familyService.getFamilyReadyToSignNeeds(user.id)
        ).filter((n) => n.midjourneyImage);

        const children = (
          await this.childrenService.getMyChildren(user.id)
        ).filter((c) => c.existence_status === ChildExistence.AlivePresent);
        console.log(children.length);

        for await (const child of shuffleArray(children)) {
          if (myChildren.length < 3) {
            const childUnpaidNeeds =
              await this.needService.getFlaskChildUnpaidNeeds(child.id);
            const shuffledNeeds = shuffleArray(childUnpaidNeeds);
            const partialPayment = shuffledNeeds.find(
              (n) => n.status === PaymentStatusEnum.PARTIAL_PAY,
            );
            const noPayments = shuffledNeeds.filter(
              (n) => n.status === PaymentStatusEnum.NOT_PAID,
            );
            if (partialPayment || noPayments[0]) {
              const theChild = {
                id: child.id,
                sayName: child.sayname_translations.fa,
                avatar: prepareUrl(child.awakeAvatarUrl),
                unPaidNeeds: (partialPayment
                  ? [partialPayment, noPayments[0]]
                  : noPayments[1]
                  ? [noPayments[0], noPayments[1]]
                  : [noPayments[0]]
                ).map((n) => {
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

              myChildren.push(theChild);
            } else {
              continue;
            }
          }
        }

        // await this.mailerService.sendMail({
        //   to: user.emailAddress,
        //   // from: '"Support Team" <support@example.com>', // override default from
        //   subject: 'نیازهای این ماه کودکان شما',
        //   template: './monthlySummary', // `.hbs` extension is appended automatically
        //   context: {
        //     readyToSignNeeds,
        //     myChildren,
        //   },
        // });
      }
      console.log('here');
      console.log(user.id);
      
      console.log(myChildren.length);
      console.log(nestUser.monthlyEmail);
      
      console.log('-----------------');
      // }
    } catch (e) {
      console.log(e);
      throw new ServerError('Cold not send email!');
    }
  }
}
