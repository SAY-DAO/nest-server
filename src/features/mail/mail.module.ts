import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContributorEntity } from 'src/entities/contributor.entity';
import { AllUserEntity } from 'src/entities/user.entity';
import { EthereumAccountEntity } from 'src/entities/ethereum.account.entity';
import { SocialWorker, User } from 'src/entities/flaskEntities/user.entity';
import { NeedService } from '../need/need.service';
import { ChildrenService } from '../children/children.service';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { NeedEntity } from 'src/entities/need.entity';
import { VariableEntity } from 'src/entities/variable.entity';
import { ChildrenEntity } from 'src/entities/children.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';
import { ChildrenPreRegisterEntity } from 'src/entities/childrenPreRegister.entity';

@Global() // 👈 global module
@Module({
  imports: [
    MailerModule.forRootAsync({
      // imports: [ConfigModule], // import module if not enabled globally
      useFactory: async (config: ConfigService) => ({
        // transport: config.get("MAIL_TRANSPORT"),
        // or
        transport: {
          host: config.get('MAIL_HOST'),
          secure: false,
          auth: {
            user: config.get('MAIL_FROM'),
            pass: config.get('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"No Reply" <${config.get('MAIL_FROM')}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature(
      [SocialWorker, User, Need, Child],
      'flaskPostgres',
    ),
    TypeOrmModule.forFeature([
      NeedEntity,
      VariableEntity,
      ChildrenEntity,
      ContributorEntity,
      AllUserEntity,
      EthereumAccountEntity,
      ChildrenPreRegisterEntity
    ]),
  ],
  providers: [MailService, UserService, NeedService, ChildrenService],
  exports: [MailService],
})
export class MailModule {}
