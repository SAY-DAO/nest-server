import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { AuthenticationService } from './auth.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([]),
        ScheduleModule.forRoot(),
        HttpModule,
    ],
    controllers: [],
    providers: [AuthenticationService],
})

export class AuthenticationModule { }

