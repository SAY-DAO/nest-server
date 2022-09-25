import { Body, Controller, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChildrenService } from '../children/children.service';
import { NeedService } from '../need/need.service';
import { SyncRequestDto } from '../../types/dtos/SyncRequest.dto';
import { ChildrenEntity } from '../../entities/children.entity';
import { NeedEntity } from '../../entities/need.entity';
import { ValidateSyncRequestPipe } from './pipes/validate-sync-request.pipe';
import { AuthGuard } from './guards/auth.guard';
import { ServerError } from '../../filters/server-exception.filter';
import { AllExceptionsFilter } from '../../filters/all-exception.filter';
import { ObjectForbidden } from '../../filters/forbidden-exception.filter';
import { UserService } from '../user/user.service';
import { PaymentService } from '../payment/payment.service';
import { UpdateResult } from 'typeorm';
import { NeedParams } from '../../types/parameters/NeedParameters';
import { UserParams } from '../../types/parameters/UserParameters';
import { PaymentParams } from '../../types/parameters/PaymentParams';
import { ProviderType } from '../../types/interface';
@ApiTags('Sync')
@Controller('sync')
@UseGuards(AuthGuard)
export class SyncController { // panel usage
    constructor(private needService: NeedService,
        private childrenService: ChildrenService,
        private userService: UserService,
        private paymentService: PaymentService,
    ) { }

    @Post(`update`)
    @UsePipes(new ValidationPipe()) // validation for dto files
    async updateServer(@Body(ValidateSyncRequestPipe) request: SyncRequestDto) {
        let childResult: ChildrenEntity;
        const newNeedResult = []
        const newChildrenList = []
        let thisChild: ChildrenEntity;

        // from dapp
        if (request.childId) {
            thisChild = await this.childrenService.getChildById(request.childId);
            if (!thisChild) {
                try {
                    await this.childrenService.createChild({ childId: request.childId, })
                } catch (e) {
                    throw new ServerError(e);
                }
            }

        }

        // from social worker panel
        if (request.childData) {
            for (let i = 0; i < request.childData.length; i++) {
                thisChild = await this.childrenService.getChildById(request.childData[i].childId);
                if (thisChild) {
                    console.log('foundOne')
                    continue;
                }
                const child = {
                    childId: request.childData[i].childId,
                    avatarUrl: request.childData[i].avatarUrl,
                    awakeAvatarUrl: request.childData[i].awakeAvatarUrl,
                    bio: request.childData[i].bio,
                    bioSummary: request.childData[i].bioSummary,
                    bioSummaryTranslations: request.childData[i].bioSummaryTranslations,
                    bioTranslations: request.childData[i].bioTranslations,
                    birthDate: new Date(request.childData[i].birthDate),
                    birthPlace: request.childData[i].birthPlace,
                    city: request.childData[i].city,
                    confirmDate: new Date(request.childData[i].confirmDate),
                    confirmUser: request.childData[i].confirmUser,
                    country: request.childData[i].country,
                    created: new Date(request.childData[i].created),
                    doneNeedsCount: request.childData[i].doneNeedsCount,
                    education: request.childData[i].education,
                    existenceStatus: request.childData[i].existence_status,
                    familyCount: request.childData[i].familyCount,
                    generatedCode: request.childData[i].generatedCode,
                    housingStatus: request.childData[i].housingStatus,
                    ngoId: request.childData[i].ngoId,
                    idSocialWorker: request.childData[i].idSocialWorker,
                    isConfirmed: request.childData[i].isConfirmed,
                    isDeleted: request.childData[i].isDeleted,
                    isMigrated: request.childData[i].isMigrated,
                    isGone: request.childData[i].isGone,
                    migrateDate: new Date(request.childData[i].migrateDate),
                    migratedId: request.childData[i].migratedId,
                    nationality: request.childData[i].nationality,
                    sayFamilyCount: request.childData[i].sayFamilyCount,
                    sayName: request.childData[i].sayName,
                    sayNameTranslations: request.childData[i].sayNameTranslations,
                    sleptAvatarUrl: request.childData[i].sleptAvatarUrl,
                    status: request.childData[i].status,
                    updated: new Date(request.childData[i].updated),
                    voiceUrl: request.childData[i].voiceUrl,
                };
                try {
                    await this.childrenService.createChild(child)
                } catch (e) {
                    throw new ServerError(e);
                }
                newChildrenList.push(child)
            }
        }


        if (request.needData) {
            let theChild: ChildrenEntity;
            for (let i = 0; i < request.needData.length; i++) {
                const participantList = [];
                const paymentList = [];

                // 1- Child
                try {
                    theChild = await this.childrenService.getChildById(
                        request.needData[i].childId,
                    );
                } catch (e) {
                    throw new AllExceptionsFilter(e);
                }

                if (!theChild) {
                    // when child is not created yet
                    throw new ObjectForbidden(
                        `Child ${request.childId} should be fetched from panel!`,
                    );
                }

                // 2- Check for Need
                let thisNeed: NeedEntity
                try {
                    thisNeed = await this.needService.getNeedById(request.needData[i].needId);
                } catch (e) {
                    throw new ServerError(e);
                }

                // 3- if does not exist create
                if (!thisNeed) {
                    // 5- Save participant / Payments
                    // if not created save need
                    let need: NeedEntity
                    let newNeed: NeedParams
                    try {
                        newNeed = {
                            flaskNeedId: request.needData[i].needId,
                            flaskChildId: request.needData[i].childId || request.childId,
                            title: request.needData[i].title,
                            affiliateLinkUrl: request.needData[i].affiliateLinkUrl,
                            bankTrackId: request.needData[i].bankTrackId,
                            category: request.needData[i].category,
                            childGeneratedCode: request.needData[i]?.childGeneratedCode,
                            childSayName: request.needData[i].childSayName,
                            childDeliveryDate:
                                request.needData[i].childDeliveryDate &&
                                new Date(request.needData[i].childDeliveryDate),
                            confirmDate:
                                request.needData[i].confirmDate &&
                                new Date(request.needData[i]?.confirmDate),
                            confirmUser: request.needData[i].confirmUser,
                            cost: request.needData[i].cost,
                            created:
                                request.needData[i].created && new Date(request.needData[i]?.created),
                            createdById: request.needData[i].createdById,
                            deletedAt:
                                request.needData[i].deleted_at &&
                                new Date(request.needData[i]?.deleted_at),
                            description: request.needData[i].description, // { en: '' , fa: ''}
                            descriptionTranslations: request.needData[i].descriptionTranslations, // { en: '' , fa: ''}
                            titleTranslations: request.needData[i].titleTranslations,
                            details: request.needData[i].details,
                            doingDuration: request.needData[i].doing_duration,
                            donated: request.needData[i].donated,
                            doneAt:
                                request.needData[i].doneAt && new Date(request.needData[i]?.doneAt),
                            expectedDeliveryDate:
                                request.needData[i].expectedDeliveryDate &&
                                new Date(request.needData[i]?.expectedDeliveryDate),
                            information: request.needData[i].information,
                            isConfirmed: request.needData[i].isConfirmed,
                            isDeleted: request.needData[i].isDeleted,
                            isDone: request.needData[i].isDone,
                            isReported: request.needData[i].isReported,
                            isUrgent: request.needData[i].isUrgent,
                            ngoId: request.needData[i].ngoId,
                            ngoAddress: request.needData[i].ngoAddress,
                            ngoName: request.needData[i].ngoName,
                            ngoDeliveryDate:
                                request.needData[i].ngoDeliveryDate &&
                                new Date(request.needData[i]?.ngoDeliveryDate),
                            oncePurchased: request.needData[i].oncePurchased,
                            paid: request.needData[i].paid,
                            purchaseCost: request.needData[i].purchaseCost,
                            purchaseDate:
                                request.needData[i].purchaseDate &&
                                new Date(request.needData[i]?.purchaseDate),
                            receiptCount: request.needData[i].receiptCount,
                            receipts: request.needData[i].receipts,
                            status: request.needData[i].status,
                            statusDescription: request.needData[i].statusDescription,
                            statusUpdatedAt:
                                request.needData[i].statusUpdatedAt &&
                                new Date(request.needData[i]?.statusUpdatedAt),
                            type: request.needData[i].type === 0 ? ProviderType.SERVICE : ProviderType.PRODUCT,
                            typeName: request.needData[i].typeName,
                            unavailableFrom:
                                request.needData[i].unavailableFrom &&
                                new Date(request.needData[i]?.unavailableFrom),
                            unconfirmedAt:
                                request.needData[i].unconfirmedAt &&
                                new Date(request.needData[i]?.unconfirmedAt),
                            unpaidCost: request.needData[i].unpaidCost,
                            unpayable: request.needData[i].unpayable,
                            unpayableFrom:
                                request.needData[i].unpayableFrom &&
                                new Date(request.needData[i]?.unpayableFrom),
                            updated:
                                request.needData[i].updated && new Date(request.needData[i]?.updated),
                            imageUrl: request.needData[i].imageUrl,
                            needRetailerImg: request.needData[i].needRetailerImg,
                            progress: request.needData[i]?.progress,
                        };
                        console.log(newNeed)

                        need = await this.needService.createNeed(theChild,
                            newNeed
                        );

                    } catch (e) {
                        // dapp api error when child is not created yet
                        throw new ServerError(e);
                    }
                    newNeedResult.push(need)
                }

                // 4- Payments / Participants
                if (request.needData[i].isDone) {
                    // 2- Participants - from need summery api
                    for (let k = 0; k < request.needData[i]?.participants?.length; k++) {
                        let user = await this.userService.getUser(
                            request.needData[i].participants[k].id_user,
                        );
                        if (!user) {
                            let newUser: UserParams
                            try {
                                newUser = {
                                    userId: request.needData[i].participants[k].id_user,
                                    avatarUrl: request.needData[i].participants[k].user_avatar
                                }

                                user = await this.userService.createUser(newUser);
                            } catch (e) {
                                throw new AllExceptionsFilter(e);
                            }
                        }
                        participantList.push(user);
                    }
                    // 3- payments - from done needs
                    for (let k = 0; k < request.needData[i]?.payments?.length; k++) {
                        let user = await this.userService.getUser(
                            request.needData[i].payments[k].id_user,
                        );
                        if (!user) {
                            let newUser: UserParams
                            try {
                                newUser = {
                                    userId: request.needData[i].payments[k].id_user,
                                }

                                user = await this.userService.createUser(newUser);
                            } catch (e) {
                                throw new AllExceptionsFilter(e);
                            }
                        }

                        let payment = await this.paymentService.getPayment(
                            request.needData[i].payments[k].id,
                        );
                        if (!payment) {
                            let newPayment: PaymentParams;
                            try {
                                newPayment = {
                                    userId: request.needData[i].payments[k].id_user,
                                    bankAmount: request.needData[i].payments[k].bank_amount,
                                    cardNumber: request.needData[i].payments[k].card_no,
                                    cartPaymentId: request.needData[i].payments[k].cart_payment_id,
                                    created:
                                        request.needData[i].payments[k] &&
                                        new Date(request.needData[i].payments[k].created),
                                    creditAmount: request.needData[i].payments[k].credit_amount,
                                    description: request.needData[i].payments[k].desc,
                                    donationAmount: request.needData[i].payments[k].donation_amount,
                                    gatewayPaymentId:
                                        request.needData[i].payments[k].gateway_payment_id,
                                    gatewayTrackId:
                                        request.needData[i].payments[k].gateway_track_id,
                                    hashedCardNumber: request.needData[i].payments[k].hashed_card_no,
                                    flaskPaymentId: request.needData[i].payments[k].id,
                                    flaskNeedId: request.needData[i].payments[k].id_need,
                                    link: request.needData[i].payments[k].link,
                                    needAmount: request.needData[i].payments[k].need_amount,
                                    orderId: request.needData[i].payments[k].order_id,
                                    totalAmount: request.needData[i].payments[k].total_amount,
                                    transactionDate:
                                        request.needData[i].payments[k] &&
                                        new Date(request.needData[i].payments[k].transaction_date),
                                    updated:
                                        request.needData[i].payments[k] &&
                                        new Date(request.needData[i].payments[k].updated),
                                    verified:
                                        request.needData[i].payments[k] &&
                                        new Date(request.needData[i].payments[k].verified),
                                };
                                payment = await this.paymentService.createPayment(
                                    user,
                                    newPayment,
                                );
                            } catch (e) {
                                throw new AllExceptionsFilter(e);
                            }
                        }

                        paymentList.push(payment);
                    }
                }

                // 2-b if no Need update need
                if (thisNeed) {
                    let updatedNeed: UpdateResult
                    let updateNeedDetails: NeedParams
                    try {
                        updateNeedDetails = {
                            flaskNeedId: request.needData[i].needId,
                            flaskChildId: request.needData[i].childId,
                            title: request.needData[i].title,
                            affiliateLinkUrl: request.needData[i].affiliateLinkUrl,
                            bankTrackId: request.needData[i].bankTrackId,
                            category: request.needData[i].category,
                            childGeneratedCode: request.needData[i]?.childGeneratedCode,
                            childSayName: request.needData[i].childSayName,
                            childDeliveryDate:
                                request.needData[i].childDeliveryDate &&
                                new Date(request.needData[i].childDeliveryDate),
                            confirmDate:
                                request.needData[i].confirmDate &&
                                new Date(request.needData[i]?.confirmDate),
                            confirmUser: request.needData[i].confirmUser,
                            cost: request.needData[i].cost,
                            created:
                                request.needData[i].created && new Date(request.needData[i]?.created),
                            createdById: request.needData[i].createdById,
                            deletedAt:
                                request.needData[i].deleted_at &&
                                new Date(request.needData[i]?.deleted_at),
                            description: request.needData[i].description, // { en: '' , fa: ''}
                            descriptionTranslations: request.needData[i].descriptionTranslations, // { en: '' , fa: ''}
                            titleTranslations: request.needData[i].titleTranslations,
                            details: request.needData[i].details,
                            doingDuration: request.needData[i].doing_duration,
                            donated: request.needData[i].donated,
                            doneAt:
                                request.needData[i].doneAt && new Date(request.needData[i]?.doneAt),
                            expectedDeliveryDate:
                                request.needData[i].expectedDeliveryDate &&
                                new Date(request.needData[i]?.expectedDeliveryDate),
                            information: request.needData[i].information,
                            isConfirmed: request.needData[i].isConfirmed,
                            isDeleted: request.needData[i].isDeleted,
                            isDone: request.needData[i].isDone,
                            isReported: request.needData[i].isReported,
                            isUrgent: request.needData[i].isUrgent,
                            ngoId: request.needData[i].ngoId,
                            ngoAddress: request.needData[i].ngoAddress,
                            ngoName: request.needData[i].ngoName,
                            ngoDeliveryDate:
                                request.needData[i].ngoDeliveryDate &&
                                new Date(request.needData[i]?.ngoDeliveryDate),
                            oncePurchased: request.needData[i].oncePurchased,
                            paid: request.needData[i].paid,
                            purchaseCost: request.needData[i].purchaseCost,
                            purchaseDate:
                                request.needData[i].purchaseDate &&
                                new Date(request.needData[i]?.purchaseDate),
                            receiptCount: request.needData[i].receiptCount,
                            receipts: request.needData[i].receipts,
                            status: request.needData[i].status,
                            statusDescription: request.needData[i].statusDescription,
                            statusUpdatedAt:
                                request.needData[i].statusUpdatedAt &&
                                new Date(request.needData[i]?.statusUpdatedAt),
                            type: request.needData[i].type === 0 ? ProviderType.SERVICE : ProviderType.PRODUCT,
                            typeName: request.needData[i].typeName,
                            unavailableFrom:
                                request.needData[i].unavailableFrom &&
                                new Date(request.needData[i]?.unavailableFrom),
                            unconfirmedAt:
                                request.needData[i].unconfirmedAt &&
                                new Date(request.needData[i]?.unconfirmedAt),
                            unpaidCost: request.needData[i].unpaidCost,
                            unpayable: request.needData[i].unpayable,
                            unpayableFrom:
                                request.needData[i].unpayableFrom &&
                                new Date(request.needData[i]?.unpayableFrom),
                            updated:
                                request.needData[i].updated && new Date(request.needData[i]?.updated),
                            imageUrl: request.needData[i].imageUrl,
                            needRetailerImg: request.needData[i].needRetailerImg,
                            progress: request.needData[i]?.progress,
                        };

                        updatedNeed = await this.needService.updateSyncNeed(
                            thisNeed,
                            updateNeedDetails,
                            paymentList,
                            participantList
                        );
                        console.log(updatedNeed)
                    } catch (e) {
                        console.log(e)
                        throw new AllExceptionsFilter(e);
                    }

                    newNeedResult.push(updatedNeed);
                    continue;
                }



            }

        }


        const result = { 'nestChildrenResult': newChildrenList, 'nestNeedResult': newNeedResult, "nestChildResult": childResult }
        return result
    }
}