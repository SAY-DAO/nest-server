import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { FamilyService } from './family.service';
import { FamilyController } from './family.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { User } from 'src/entities/flaskEntities/user.entity';
import { Family } from 'src/entities/flaskEntities/family.entity';
import { FamilyMiddleware } from './middlewares/family.middleware';

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
export class FamilyModule  implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FamilyMiddleware).forRoutes('family');
  }
}