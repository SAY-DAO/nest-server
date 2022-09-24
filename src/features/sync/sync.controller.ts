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
import { ObjectNotFound } from '../../filters/notFound-expectation.filter';
import { PaymentService } from '../payment/payment.service';
import { CreateNeedDto } from 'src/types/dtos/CreateNeed.dto';
import { NeedParameters } from 'src/types/parameters/NeedParameters';

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
    @UsePipes(new ValidationPipe())
    async updateServer(@Body(ValidateSyncRequestPipe) request: SyncRequestDto) {
        let childResult: ChildrenEntity;
        let newNeedResult: NeedEntity[]
        const newChildrenList = []

        // from dapp
        if (request.childId) {
            childResult = await this.childrenService.createChild({
                childId: request.childId,
            });
        }

        // from social worker panel
        if (request.childData) {
            let thisChild: ChildrenEntity;
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
            const list = [];
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

                if (request.needData[i].isDone) {
                    // 2- Participants - from need summery api
                    for (let k = 0; k < request.needData[i]?.participants?.length; k++) {
                        let user = await this.userService.getUser(
                            request.needData[i].participants[k].id_user,
                        );
                        if (!user) {
                            const requestToInterface = {
                                userId: request.needData[i].participants[k].id_user,
                                avatarUrl: request.needData[i].participants[k].user_avatar,
                            };
                            try {
                                user = await this.userService.createUser(requestToInterface);
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
                            const requestToInterface = {
                                userId: request.needData[i].payments[k].id_user,
                            };
                            try {
                                user = await this.userService.createUser(requestToInterface);
                            } catch (e) {
                                throw new AllExceptionsFilter(e);
                            }
                        }
                        if (!user) {
                            throw new ObjectNotFound(
                                `User ${request.needData[i].payments[k].id_user} was not found!`,
                            );
                        }
                        let payment = await this.paymentService.getPayment(
                            request.needData[i].payments[k].id,
                        );
                        if (!payment) {
                            const requestToInterface2 = {
                                id_user: request.needData[i].payments[k].id_user,
                                bank_amount: request.needData[i].payments[k].bank_amount,
                                card_no: request.needData[i].payments[k].card_no,
                                cart_payment_id: request.needData[i].payments[k].cart_payment_id,
                                created:
                                    request.needData[i].payments[k] &&
                                    new Date(request.needData[i].payments[k].created),
                                credit_amount: request.needData[i].payments[k].credit_amount,
                                desc: request.needData[i].payments[k].desc,
                                donation_amount: request.needData[i].payments[k].donation_amount,
                                gateway_payment_id:
                                    request.needData[i].payments[k].gateway_payment_id,
                                gateway_track_id:
                                    request.needData[i].payments[k].gateway_track_id,
                                hashed_card_no: request.needData[i].payments[k].hashed_card_no,
                                id: request.needData[i].payments[k].id,
                                id_need: request.needData[i].payments[k].id_need,
                                link: request.needData[i].payments[k].link,
                                need_amount: request.needData[i].payments[k].need_amount,
                                order_id: request.needData[i].payments[k].order_id,
                                total_amount: request.needData[i].payments[k].total_amount,
                                transaction_date:
                                    request.needData[i].payments[k] &&
                                    new Date(request.needData[i].payments[k].transaction_date),
                                updated:
                                    request.needData[i].payments[k] &&
                                    new Date(request.needData[i].payments[k].updated),
                                verified:
                                    request.needData[i].payments[k] &&
                                    new Date(request.needData[i].payments[k].verified),
                            };
                            try {
                                payment = await this.paymentService.createPayment(
                                    requestToInterface2,
                                );
                            } catch (e) {
                                throw new AllExceptionsFilter(e);
                            }
                        }

                        paymentList.push(payment);
                    }
                }

                // 4- Need
                let thisNeed: NeedEntity
                try {
                    thisNeed = await this.needService.getNeedById(request.needData[i].needId);
                } catch (e) {
                    throw new ServerError(e);
                }

                // if already created update
                if (thisNeed) {
                    let updatedNeed: NeedEntity
                    try {
                        updatedNeed = await this.needService.updateSyncedNeed(
                            thisNeed,
                            participantList,
                            paymentList,
                        );
                    } catch (e) {
                        throw new AllExceptionsFilter(e);
                    }

                    list.push(updatedNeed);
                    continue;
                }

                // 5- Save
                // if not created save need
                let need: NeedEntity
                let newNeed: NeedParameters
                try {
                    newNeed = {
                        childId: request.needData[i].childId,
                        needId: request.needData[i].needId,
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
                        doing_duration: request.needData[i].doing_duration,
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
                        type: request.needData[i].type,
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
                    newNeed.payments = paymentList;
                    newNeed.participants = participantList;
                    need = await this.needService.createNeed(theChild,
                        newNeed
                    );
                } catch (e) {
                    // dapp api error when child is not created yet
                    throw new ServerError(e);
                }
                newNeedResult.push(need)

            }

        }


        const result = { 'nestChildrenResult': newChildrenList, 'nestNeedResult': newNeedResult, "nestChildResult": childResult }
        return result
    }
}