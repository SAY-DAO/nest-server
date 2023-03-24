import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { PaymentEntity } from '../../entities/payment.entity';
import { PaymentParams } from '../../types/parameters/PaymentParameters';
import { AllUserEntity, } from '../../entities/user.entity';
import { HeaderOptions } from 'src/types/interfaces/interface';
import {  PaymentAPIApi } from 'src/generated-sources/openapi';

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(PaymentEntity)
        private paymentRepository: Repository<PaymentEntity>,
    ) { }

    getPayments(): Promise<PaymentEntity[]> {
        return this.paymentRepository.find({});
    }

    getPaymentById(flaskId: number): Promise<PaymentEntity> {
        const user = this.paymentRepository.findOne({
            where: {
                flaskId: flaskId,
            },
        });
        return user;
    }

    createPayment(
        paymentDetails: PaymentParams,
        familyMember: AllUserEntity,
    ): Promise<PaymentEntity> {
        const newPayment = this.paymentRepository.create({
            ...paymentDetails,
            familyMember: familyMember,
        });
        return this.paymentRepository.save({ id: newPayment.id, ...newPayment });
    }

    updatePayment(
        paymentId: string,
        paymentDetails: PaymentParams,
        familyMember: AllUserEntity,
    ): Promise<UpdateResult> {
        return this.paymentRepository.update(paymentId, {
            ...paymentDetails,
            familyMember: familyMember,
        });
    }

    async getFlaskPayments(options: HeaderOptions, needId: number): Promise<any> {
        const publicApi = new PaymentAPIApi();
        const needPayments: Promise<any> = publicApi.apiV2PaymentAllGet(
            options.accessToken,
            needId,
        );
        return needPayments;
    }
}
