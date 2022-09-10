import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntity } from '../../entities/payment.entity';
import { NeedService } from '../need/need.service';

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(PaymentEntity)
        private paymentRepository: Repository<PaymentEntity>,
        private needService: NeedService,
    ) { }

    async getPayments(): Promise<PaymentEntity[]> {
        return await this.paymentRepository.find();
    }


    async getPayment(payment_id: number): Promise<PaymentEntity> {
        const user = await this.paymentRepository.findOne({
            where: {
                payment_id: payment_id,
            },
        });
        return user;
    }

    // async createPayment(request: BankPaymentRequest): Promise<PaymentEntity> {
    //     const theNeed = this.needService.GetNeedById(request.id_need)
    //     const theUser = this.needService.GetNeedById(request.userId)
    //     const saved = await this.paymentRepository.save({
    //         card_number: request.card_no,
    //         cart_payment_id: request.cart_payment_id,
    //         created: request.created,
    //         credit_amount: request.credit_amount,
    //         description: request.desc,
    //         donation_amount: request.donation_amount,
    //         gateway_payment_id: request.gateway_payment_id,
    //         gateway_track_id: request.gateway_track_id,
    //         hashed_card_no: request.hashed_card_no,
    //         payment_id: request.id,
    //         need: theNeed,
    //         user: theUser,
    //         link: request.link,
    //         bank_amount: request.need_amount,
    //         order_id: request.order_id,
    //         total_amount: request.total_amount,
    //         transaction_date: request.transaction_date,
    //         updated: request.updated,
    //         verified: request.verified,
    //     });
    //     return saved;
    // }
}
