import { Module } from '@nestjs/common';
import { FamilyService } from './family.service';
import { FamilyController } from './family.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { User } from 'src/entities/flaskEntities/user.entity';
import { Family } from 'src/entities/flaskEntities/family.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Need,
        Family,
        User
      ],
      'flaskPostgres',
    ),

  ],
  controllers: [FamilyController],
  providers: [FamilyService],
})
export class FamilyModule {}
