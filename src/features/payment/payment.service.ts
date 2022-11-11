import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntity } from '../../entities/payment.entity';
import { PaymentParams } from '../../types/parameters/PaymentParameters';
import { FamilyEntity } from '../../entities/user.entity';

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(PaymentEntity)
        private paymentRepository: Repository<PaymentEntity>,

    ) { }

    getPayments(): Promise<PaymentEntity[]> {
        return this.paymentRepository.find({
        });
    }


    getPayment(payment_id: number): Promise<PaymentEntity> {
        const user = this.paymentRepository.findOne({
            where: {
                flaskPaymentId: payment_id,
            },
        });
        return user;
    }

    createPayment(paymentDetails: PaymentParams): Promise<PaymentEntity> {
        const newPayment = this.paymentRepository.create({
            ...paymentDetails,
        });
        return this.paymentRepository.save(newPayment);
    }
}
