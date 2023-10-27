import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ServerError } from 'src/filters/server-exception.filter';
import { ChildrenService } from '../children/children.service';
import { NeedService } from '../need/need.service';
import { prepareUrl } from 'src/utils/helpers';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private needService: NeedService,
    private userService: UserService,
    private childrenService: ChildrenService,
  ) {}

  async sendUserSummaries() {
    let sayName1: string;
    let avatar1: string;
    let childId1: number;
    let needId11: number;
    let needName11: string;
    let needImage11: string;
    let needPrice11: number;
    let needId12: number;
    let needName12: string;
    let needImage12: string;
    let needPrice12: number;
    let needId13: number;
    let needName13: string;
    let needImage13: string;
    let needPrice13: number;
    let sayName2: string;
    let avatar2: string;
    let childId2: number;
    let needId21: number;
    let needName21: string;
    let needImage21: string;
    let needPrice21: number;
    let needId22: number;
    let needName22: string;
    let needImage22: string;
    let needPrice22: number;
    let needId23: number;
    let needName23: string;
    let needImage23: string;
    let needPrice23: number;
    let sayName3: string;
    let avatar3: string;
    let childId3: number;
    let needId31: number;
    let needName31: string;
    let needImage31: string;
    let needPrice31: number;
    let needId32: number;
    let needName32: string;
    let needImage32: string;
    let needPrice32: number;
    let needId33: number;
    let needName33: string;
    let needImage33: string;
    let needPrice33: number;
    const users = await this.userService.getFlaskUsers();
    try {
      const ehsan = users.find((u) => u.userName === 'ehsan');
      const children = await this.childrenService.getMyChildren(ehsan.id);

      let counter = 1;
      for await (const child of children) {
        const childNeeds = await this.needService.getFlaskChildNeeds(child.id);
        // Child One
        if (counter === 1) {
          sayName1 = child.sayname_translations.fa;
          avatar1 = prepareUrl(child.awakeAvatarUrl);;
          childId1 = child.id;
          for (let i = 0; i < 3; i++) {
            if (childNeeds[0] && i === 0) {
              needId11 = childNeeds[i].id;
              needName11 = childNeeds[i].name_translations.fa;
              needImage11 = childNeeds[i].img;
              needPrice11 = childNeeds[i]._cost;
            }
            if (childNeeds[1] && i === 1) {
              needId12 = childNeeds[i].id;
              needName12 = childNeeds[i].name_translations.fa;
              needImage12 = childNeeds[i].img;
              needPrice12 = childNeeds[i]._cost;
            }
            if (childNeeds[2] && i === 2) {
              needId13 = childNeeds[i].id;
              needName13 = childNeeds[i].name_translations.fa;
              needImage13 = childNeeds[i].img;
              needPrice13 = childNeeds[i]._cost;
            }
          }
        // Child Two
        } else if (counter === 2) {
          sayName2 = child.sayname_translations.fa;
          avatar2 = prepareUrl(child.awakeAvatarUrl);;
          childId2 = child.id;
          for (let i = 0; i < 3; i++) {
            if (childNeeds[0] && i === 0) {
              needId21 = childNeeds[i].id;
              needName21 = childNeeds[i].name_translations.fa;
              needImage21 = childNeeds[i].img;
              needPrice21 = childNeeds[i]._cost;
            }
            if (childNeeds[1] && i === 1) {
              needId22 = childNeeds[i].id;
              needName22 = childNeeds[i].name_translations.fa;
              needImage22 = childNeeds[i].img;
              needPrice22 = childNeeds[i]._cost;
            }
            if (childNeeds[2] && i === 2) {
              needId23 = childNeeds[i].id;
              needName23 = childNeeds[i].name_translations.fa;
              needImage23 = childNeeds[i].img;
              needPrice23 = childNeeds[i]._cost;
            }
          }
        // Child Three
        } else if (counter === 3) {
          sayName3 = child.sayname_translations.fa;
          avatar3 = prepareUrl(child.awakeAvatarUrl);
          childId3 = child.id;
          for (let i = 0; i < 3; i++) {
            if (childNeeds[0] && i === 0) {
              needId31 = childNeeds[i].id;
              needName31 = childNeeds[i].name_translations.fa;
              needImage31 = childNeeds[i].img;
              needPrice31 = childNeeds[i]._cost;
            }
            if (childNeeds[1] && i === 1) {
              needId32 = childNeeds[i].id;
              needName32 = childNeeds[i].name_translations.fa;
              needImage32 = childNeeds[i].img;
              needPrice32 = childNeeds[i]._cost;
            }
            if (childNeeds[2] && i === 2) {
              needId33 = childNeeds[i].id;
              needName33 = childNeeds[i].name_translations.fa;
              needImage33 = childNeeds[i].img;
              needPrice33 = childNeeds[i]._cost;
            }
          }
        }
        counter++;
      }
      console.log(childId1);
      console.log(childId3);
      console.log(childId2);
      
      await this.mailerService.sendMail({
        to: ehsan.emailAddress,
        // from: '"Support Team" <support@example.com>', // override default from
        subject: 'نیازهای این ماه کودکان شما',
        template: './monthlySummary', // `.hbs` extension is appended automatically
        context: {
          name: ehsan.firstName || ehsan.userName,
          sayName1,
          avatar1,
          childId1,
          needId11,
          needName11,
          needImage11,
          needPrice11,
          needId12,
          needName12,
          needImage12,
          needPrice12,
          needId13,
          needName13,
          needImage13,
          needPrice13,

          sayName2,
          avatar2,
          childId2,
          needId21,
          needName21,
          needImage21,
          needPrice21,
          needId22,
          needName22,
          needImage22,
          needPrice22,
          needId33,
          needName33,
          needImage33,
          needPrice33,

          sayName3,
          avatar3,
          childId3,
          needId31,
          needName31,
          needImage31,
          needPrice31,
          needId32,
          needName32,
          needImage32,
          needPrice32,
          needId23,
          needName23,
          needImage23,
          needPrice23,
        },
      });
    } catch (e) {
      throw new ServerError('Cold not send email!');
    }
  }
}
