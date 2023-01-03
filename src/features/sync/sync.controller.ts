import {
    Body,
    Controller,
    Post,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChildrenService } from '../children/children.service';
import { NeedService } from '../need/need.service';
import { SyncRequestDto } from '../../types/dtos/SyncRequest.dto';
import { ChildrenEntity } from '../../entities/children.entity';
import { NeedEntity } from '../../entities/need.entity';
import { AuthGuard } from './guards/auth.guard';
import { ServerError } from '../../filters/server-exception.filter';
import { AllExceptionsFilter } from '../../filters/all-exception.filter';
import { ObjectForbidden } from '../../filters/forbidden-exception.filter';
import { UserService } from '../user/user.service';
import { PaymentService } from '../payment/payment.service';
import { UpdateResult } from 'typeorm';
import { NeedParams } from '../../types/parameters/NeedParameters';
import { SocialWorkerParams, FamilyParams } from '../../types/parameters/UserParameters';
import { PaymentParams } from '../../types/parameters/PaymentParameters';
import { NeedTypeEnum, RolesEnum } from '../../types/interface';
import { NeedDto } from '../../types/dtos/CreateNeed.dto';
import { ValidateSyncOnePipe } from './pipes/validate-sync-one.pipe';
import { ReceiptService } from '../receipt/receipt.service';
import { ReceiptParams } from '../../types/parameters/ReceiptParameter';
import { NgoService } from '../ngo/ngo.service';
import { NgoParams } from 'src/types/parameters/NgoParammeters';
@ApiTags('Sync')
@Controller('sync')
@UseGuards(AuthGuard)
export class SyncController {
    // panel usage
    constructor(
        private needService: NeedService,
        private childrenService: ChildrenService,
        private userService: UserService,
        private ngoService: NgoService,
        private paymentService: PaymentService,
        private receiptService: ReceiptService,
    ) { }

    @Post('update/latest')
    @UsePipes(new ValidationPipe())
    async fetchLatest() {
        return await this.needService.getLastNeed()
    }





}
