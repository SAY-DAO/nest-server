import { Module } from '@nestjs/common';
import { AnalyticService } from './analytic.service';
import { AnalyticController } from './analytic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { Child } from 'src/entities/flaskEntities/child.entity';
import { Payment } from 'src/entities/flaskEntities/payment.entity';
import { User } from 'src/entities/flaskEntities/user.entity';
import { UserFamily } from 'src/entities/flaskEntities/userFamily.entity';
import { Family } from 'src/entities/flaskEntities/family.entity';
import { NGO } from 'src/entities/flaskEntities/ngo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Need, Child, NGO, Payment, Family, UserFamily], 'flaskPostgres'),

  ],
  controllers: [AnalyticController],
  providers: [AnalyticService]
})
export class AnalyticModule { }
