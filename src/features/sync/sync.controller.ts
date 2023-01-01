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
import { CreateNeedDto } from '../../types/dtos/CreateNeed.dto';
import { ValidateSyncMultiPipe } from './pipes/validate-sync-multi.pipe';
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


    @Post(`update/multi`)
    @UsePipes(new ValidationPipe()) // validation for dto files
    async SyncMulti(@Body(ValidateSyncMultiPipe) request: SyncRequestDto) {
        let childResult: ChildrenEntity;
        const newNeedResult = [];
        const newChildrenList = [];
        let thisChild: ChildrenEntity;


        // from dapp
        if (request.childId) {
            thisChild = await this.childrenService.getChildById(request.childId);
            if (!thisChild) {

                let theNgo = await this.ngoService.getNgo(
                    request.ngoId
                );
                //  if ngo does not exist create
                if (!theNgo) {
                    let newNgo: NgoParams;
                    try {
                        newNgo = {
                            flaskNgoId: request.ngoId,
                        };

                        theNgo = await this.ngoService.createNgo(newNgo);
                    } catch (e) {
                        throw new AllExceptionsFilter(e);
                    }
                }


                let socialWorker = await this.userService.getSocialWorker(
                    request.swId
                );
                //  if social worker does not exist create
                if (!socialWorker) {
                    let newSocialWorker: SocialWorkerParams;
                    try {
                        newSocialWorker = {
                            flaskSwId: request.swId,
                            ngo: theNgo
                        };

                        socialWorker = await this.userService.createSocialWorker(newSocialWorker);
                    } catch (e) {
                        throw new AllExceptionsFilter(e);
                    }
                }

                try {
                    await this.childrenService.createChild({ flaskChildId: request.childId, ngo: theNgo, socialWorker: socialWorker });
                } catch (e) {
                    throw new ServerError(e);
                }
            }
        }

        // from social worker panel
        if (request.childData) {
            for (let i = 0; i < request.childData.length; i++) {
                thisChild = await this.childrenService.getChildById(
                    request.childData[i].childId,
                );
                if (thisChild) {
                    console.log('foundOne');
                    continue;
                }

                let theNgo = await this.ngoService.getNgo(
                    request.childData[i].ngoId
                );
                //  if ngo does not exist create
                if (!theNgo) {
                    let newNgo: NgoParams;
                    try {
                        newNgo = {
                            flaskNgoId: request.childData[i].ngoId,
                        };

                        theNgo = await this.ngoService.createNgo(newNgo);
                    } catch (e) {
                        throw new AllExceptionsFilter(e);
                    }
                }

                let supervisor = await this.userService.getSocialWorker(
                    request.childData[i].confirmUser
                );
                //  if supervisor does not exist create
                if (!supervisor) {
                    let newSupervisor: SocialWorkerParams;
                    try {
                        newSupervisor = {
                            flaskSwId: request?.childData[i].confirmUser,
                            typeId: RolesEnum.SAY_SUPERVISOR,
                            ngo: theNgo
                        };

                        supervisor = await this.userService.createSocialWorker(newSupervisor);
                    } catch (e) {
                        throw new AllExceptionsFilter(e);
                    }
                }


                let socialWorker = await this.userService.getSocialWorker(
                    request.childData[i].flaskSwId
                );
                if (!socialWorker) {
                    let newSocialWorker: SocialWorkerParams;
                    try {
                        newSocialWorker = {
                            flaskSwId: request.childData[i].flaskSwId,
                            typeId: RolesEnum.SOCIAL_WORKER,
                            ngo: theNgo,
                        };

                        socialWorker = await this.userService.createSocialWorker(newSocialWorker);
                    } catch (e) {
                        throw new AllExceptionsFilter(e);
                    }
                }
                const child = {
                    flaskChildId: request.childData[i].childId,
                    avatarUrl: request.childData[i].avatarUrl,
                    awakeAvatarUrl: request.childData[i].awakeAvatarUrl,
                    bio: request.childData[i].bio,
                    bioSummary: request.childData[i].bioSummary,
                    bioSummaryTranslations: request.childData[i].bioSummaryTranslations,
                    bioTranslations: request.childData[i].bioTranslations,
                    birthDate: request.childData[i].birthDate && new Date(request.childData[i].birthDate),
                    birthPlace: request.childData[i].birthPlace,
                    city: request.childData[i].city,
                    confirmDate: request.childData[i].confirmDate && new Date(request.childData[i].confirmDate),
                    country: request.childData[i].country,
                    created: request.childData[i].created && new Date(request.childData[i].created),
                    doneNeedsCount: request.childData[i].doneNeedsCount,
                    education: request.childData[i].education,
                    existenceStatus: request.childData[i].existenceStatus,
                    familyCount: request.childData[i].familyCount,
                    generatedCode: request.childData[i].generatedCode,
                    housingStatus: request.childData[i].housingStatus,
                    ngo: theNgo,
                    supervisor: supervisor,
                    socialWorker: socialWorker,
                    flaskSupervisorId: request.needData[i]?.confirmUser,
                    flaskSwId: request.childData[i].flaskSwId,
                    isConfirmed: request.childData[i].isConfirmed,
                    isDeleted: request.childData[i].isDeleted,
                    isMigrated: request.childData[i].isMigrated,
                    isGone: request.childData[i].isGone,
                    migrateDate: request.childData[i].migrateDate && new Date(request.childData[i].migrateDate),
                    migratedId: request.childData[i].migratedId,
                    nationality: request.childData[i].nationality,
                    sayFamilyCount: request.childData[i].sayFamilyCount,
                    sayName: request.childData[i].sayName,
                    sayNameTranslations: request.childData[i].sayNameTranslations,
                    sleptAvatarUrl: request.childData[i].sleptAvatarUrl,
                    status: request.childData[i].status,
                    updated: request.childData[i].updated && new Date(request.childData[i].updated),
                    voiceUrl: request.childData[i].voiceUrl,
                };
                try {
                    await this.childrenService.createChild(child);
                } catch (e) {
                    throw new ServerError(e);
                }
                newChildrenList.push(child);
            }
        }

        if (request.needData) {
            let theChild: ChildrenEntity;
            for (let i = 0; i < request.needData.length; i++) {
                const participantList = [];
                const paymentList = [];
                const receiptList = [];

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
                let thisNeed: NeedEntity;
                try {
                    thisNeed = await this.needService.getNeedById(
                        request.needData[i].needId,
                    );
                } catch (e) {
                    throw new ServerError(e);
                }

                // 3- Payments / Participants
                if (request.needData[i].isDone) {
                    // Participants - from need summery api
                    for (let k = 0; k < request.needData[i]?.participants?.length; k++) {
                        let user = await this.userService.getFamily(
                            request.needData[i].participants[k].id_user
                        );
                        if (!user) {
                            let newUser: FamilyParams;
                            try {
                                newUser = {
                                    flaskUserId: request.needData[i].participants[k].id_user,
                                    avatarUrl: request.needData[i].participants[k].user_avatar,
                                };

                                user = await this.userService.createFamilyMember(newUser);
                            } catch (e) {
                                throw new AllExceptionsFilter(e);
                            }
                        }
                        participantList.push(user);
                    }
                    // payments - from done needs
                    for (let k = 0; k < request.needData[i]?.payments?.length; k++) {
                        let user = await this.userService.getFamily(
                            request.needData[i].payments[k].id_user
                        );
                        if (!user) {
                            let newUser: FamilyParams;
                            try {
                                newUser = {
                                    flaskUserId: request.needData[i].payments[k].id_user,
                                };

                                user = await this.userService.createFamilyMember(newUser);
                            } catch (e) {
                                throw new AllExceptionsFilter(e);
                            }
                        }

                        let payment = await this.paymentService.getPayment(
                            request.needData[i].payments[k].id,
                        );
                        if (!payment) {
                            let newPayment: PaymentParams;
                            console.log(
                                request.needData[i].payments[k].id,
                            )
                            try {
                                newPayment = {
                                    flaskUserId: request.needData[i].payments[k].id_user,
                                    bankAmount: request.needData[i].payments[k].bank_amount,
                                    cardNumber: request.needData[i].payments[k].card_no,
                                    cartPaymentId:
                                        request.needData[i].payments[k].cart_payment_id,
                                    created:
                                        request.needData[i].payments[k] &&
                                        new Date(request.needData[i].payments[k].created),
                                    creditAmount: request.needData[i].payments[k].credit_amount,
                                    description: request.needData[i].payments[k].desc,
                                    donationAmount:
                                        request.needData[i].payments[k].donation_amount,
                                    gatewayPaymentId:
                                        request.needData[i].payments[k].gateway_payment_id,
                                    gatewayTrackId:
                                        request.needData[i].payments[k].gateway_track_id,
                                    hashedCardNumber:
                                        request.needData[i].payments[k].hashed_card_no,
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
                                    user,

                                };
                                payment = await this.paymentService.createPayment(
                                    newPayment,
                                );
                            } catch (e) {
                                throw new AllExceptionsFilter(e);
                            }
                        }

                        paymentList.push(payment);
                    }
                    // Receipts - from panel reports
                    for (let k = 0; k < request.needData[i]?.receipts?.length; k++) {

                        let theNgo = await this.ngoService.getNgo(
                            request.childData[i].ngoId
                        );
                        //  if ngo does not exist create
                        if (!theNgo) {
                            let newNgo: NgoParams;
                            try {
                                newNgo = {
                                    flaskNgoId: request.childData[i].ngoId,
                                };

                                theNgo = await this.ngoService.createNgo(newNgo);
                            } catch (e) {
                                throw new AllExceptionsFilter(e);
                            }
                        }

                        let socialWorker = await this.userService.getSocialWorker(
                            request.needData[i]?.receipts[k].ownerId
                        );
                        if (!socialWorker) {
                            let newSocialWorker: SocialWorkerParams;
                            try {
                                newSocialWorker = {
                                    flaskSwId: request.needData[i]?.receipts[k].ownerId,
                                    ngo: theNgo,
                                };

                                socialWorker = await this.userService.createSocialWorker(newSocialWorker);
                            } catch (e) {
                                throw new AllExceptionsFilter(e);
                            }
                        }

                        let receipt = await this.receiptService.getReceipt(
                            request.needData[i]?.receipts[k].id,
                        );
                        if (!receipt) {
                            let newReceipt: ReceiptParams;
                            console.log(
                                request.needData[i]?.receipts[k].id,
                            )
                            try {
                                newReceipt = {
                                    title: request.needData[i]?.receipts[k].title,
                                    description: request.needData[i]?.receipts[k].description,
                                    attachment: request.needData[i]?.receipts[k].attachment,
                                    isPublic: request.needData[i]?.receipts[k].isPublic,
                                    code: request.needData[i]?.receipts[k].code,
                                    flaskSwId: request.needData[i]?.receipts[k].ownerId,
                                    socialWorker: socialWorker,
                                    child: theChild,
                                    needStatus: request.needData[i]?.receipts[k].needStatus,
                                    flaskReceiptId: request.needData[i]?.receipts[k].id,
                                    deleted: request.needData[i]?.receipts[k].deleted,
                                    flaskNeedId: request.needData[i]?.needId,
                                };
                                receipt = await this.receiptService.createReceipt(
                                    newReceipt,
                                );
                            } catch (e) {
                                throw new AllExceptionsFilter(e);
                            }
                        }

                        receiptList.push(receipt);
                    }

                }

                let theNgo = await this.ngoService.getNgo(
                    request.needData[i].ngoId
                );
                //  if ngo does not exist create
                if (!theNgo) {
                    let newNgo: NgoParams;
                    try {
                        newNgo = {
                            flaskNgoId: request.needData[i].ngoId,
                        };

                        theNgo = await this.ngoService.createNgo(newNgo);
                    } catch (e) {
                        throw new AllExceptionsFilter(e);
                    }
                }



                let supervisor = await this.userService.getSocialWorker(
                    request.needData[i]?.confirmUser
                );
                //  if supervisor does not exist create
                if (!supervisor) {
                    let newSupervisor: SocialWorkerParams;
                    try {
                        newSupervisor = {
                            flaskSwId: request.needData[i]?.confirmUser,
                            typeId: RolesEnum.SAY_SUPERVISOR,
                            ngo: theNgo
                        };

                        supervisor = await this.userService.createSocialWorker(newSupervisor);
                    } catch (e) {
                        throw new AllExceptionsFilter(e);
                    }
                }

                let socialWorker = await this.userService.getSocialWorker(
                    request.needData[i]?.createdById
                );
                //  if social worker does not exist create
                if (!socialWorker) {
                    let newSocialWorker: SocialWorkerParams;
                    try {
                        newSocialWorker = {
                            flaskSwId: request.needData[i]?.createdById,
                            typeId: RolesEnum.SOCIAL_WORKER,
                            ngo: theNgo,
                        };

                        socialWorker = await this.userService.createSocialWorker(newSocialWorker);
                    } catch (e) {
                        throw new AllExceptionsFilter(e);
                    }
                }

                // 4- if does not exist create
                // if not created save need
                if (!thisNeed) {
                    let need: NeedEntity;
                    let newNeed: NeedParams;

                    try {
                        newNeed = {
                            flaskNeedId: request.needData[i].needId,
                            flaskChildId: request.needData[i].childId || request.childId,
                            flaskNgoId: request.needData[i].ngoId || request.ngoId,
                            flaskSupervisorId: request.needData[i]?.confirmUser,
                            title: request.needData[i].title,
                            link: request.needData[i].link,
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
                            supervisor: supervisor,
                            cost: request.needData[i].cost,
                            created:
                                request.needData[i].created &&
                                new Date(request.needData[i]?.created),
                            socialWorker: socialWorker,
                            flaskSwId: request.needData[i]?.createdById,
                            deletedAt:
                                request.needData[i].deleted_at &&
                                new Date(request.needData[i]?.deleted_at),
                            description: request.needData[i].description, // { en: '' , fa: ''}
                            descriptionTranslations:
                                request.needData[i].descriptionTranslations, // { en: '' , fa: ''}
                            titleTranslations: request.needData[i].titleTranslations,
                            details: request.needData[i].details,
                            doingDuration: request.needData[i].doing_duration,
                            donated: request.needData[i].donated,
                            doneAt:
                                request.needData[i].doneAt &&
                                new Date(request.needData[i]?.doneAt),
                            expectedDeliveryDate:
                                request.needData[i].expectedDeliveryDate &&
                                new Date(request.needData[i]?.expectedDeliveryDate),
                            information: request.needData[i].information,
                            isConfirmed: request.needData[i].isConfirmed,
                            isDeleted: request.needData[i].isDeleted,
                            isDone: request.needData[i].isDone,
                            isReported: request.needData[i].isReported,
                            isUrgent: request.needData[i].isUrgent,
                            ngo: theNgo,
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
                            status: request.needData[i].status,
                            statusDescription: request.needData[i].statusDescription,
                            statusUpdatedAt:
                                request.needData[i].statusUpdatedAt &&
                                new Date(request.needData[i]?.statusUpdatedAt),
                            type:
                                request.needData[i].type === 0
                                    ? NeedTypeEnum.SERVICE
                                    : NeedTypeEnum.PRODUCT,
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
                                request.needData[i].updated &&
                                new Date(request.needData[i]?.updated),
                            imageUrl: request.needData[i].imageUrl,
                            needRetailerImg: request.needData[i].needRetailerImg,
                            progress: request.needData[i]?.progress,
                        };
                        need = await this.needService.createNeed(
                            theChild,
                            newNeed,
                            receiptList,
                            paymentList,
                            participantList,
                        );
                    } catch (e) {
                        // dapp api error when child is not created yet
                        throw new ServerError(e);
                    }
                    newNeedResult.push(need);
                }

                // 2-b if no Need update need
                if (thisNeed) {
                    let updatedNeed: UpdateResult;
                    let updateNeedDetails: NeedParams;
                    try {
                        updateNeedDetails = {
                            flaskNeedId: request.needData[i].needId,
                            flaskChildId: request.needData[i].childId,
                            flaskNgoId: request.needData[i].ngoId,
                            link: request.needData[i].link,
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
                            cost: request.needData[i].cost,
                            created:
                                request.needData[i].created &&
                                new Date(request.needData[i]?.created),
                            supervisor: supervisor,
                            socialWorker: socialWorker,
                            flaskSwId: request.needData[i]?.createdById,
                            flaskSupervisorId: request.needData[i]?.confirmUser,
                            deletedAt:
                                request.needData[i].deleted_at &&
                                new Date(request.needData[i]?.deleted_at),
                            description: request.needData[i].description, // { en: '' , fa: ''}
                            descriptionTranslations:
                                request.needData[i].descriptionTranslations, // { en: '' , fa: ''}
                            titleTranslations: request.needData[i].titleTranslations,
                            details: request.needData[i].details,
                            doingDuration: request.needData[i].doing_duration,
                            donated: request.needData[i].donated,
                            doneAt:
                                request.needData[i].doneAt &&
                                new Date(request.needData[i]?.doneAt),
                            expectedDeliveryDate:
                                request.needData[i].expectedDeliveryDate &&
                                new Date(request.needData[i]?.expectedDeliveryDate),
                            information: request.needData[i].information,
                            isConfirmed: request.needData[i].isConfirmed,
                            isDeleted: request.needData[i].isDeleted,
                            isDone: request.needData[i].isDone,
                            isReported: request.needData[i].isReported,
                            isUrgent: request.needData[i].isUrgent,
                            ngo: theNgo,
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
                            status: request.needData[i].status,
                            statusDescription: request.needData[i].statusDescription,
                            statusUpdatedAt:
                                request.needData[i].statusUpdatedAt &&
                                new Date(request.needData[i]?.statusUpdatedAt),
                            type:
                                request.needData[i].type === 0
                                    ? NeedTypeEnum.SERVICE
                                    : NeedTypeEnum.PRODUCT,
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
                                request.needData[i].updated &&
                                new Date(request.needData[i]?.updated),
                            imageUrl: request.needData[i].imageUrl,
                            needRetailerImg: request.needData[i].needRetailerImg,
                            progress: request.needData[i]?.progress,
                        };

                        updatedNeed = await this.needService.updateSyncNeed(
                            thisNeed,
                            updateNeedDetails,
                            receiptList,
                            paymentList,
                            participantList,
                        );
                        console.log(updatedNeed);
                    } catch (e) {
                        console.log(e);
                        throw new AllExceptionsFilter(e);
                    }

                    newNeedResult.push(updatedNeed);
                    continue;
                }
            }
        }

        const result = {
            nestChildrenResult: newChildrenList,
            nestNeedResult: newNeedResult,
            nestChildResult: childResult,
        };
        return result;
    }

    @Post(`update/one`)
    @UsePipes(new ValidationPipe()) // validation for dto files
    async SyncOne(@Body(ValidateSyncOnePipe) request: CreateNeedDto) {
        let childResult: ChildrenEntity;
        let newNeedResult: NeedEntity | UpdateResult;
        let newChildrenList: ChildrenEntity;
        let theChild: ChildrenEntity;
        const participantList = [];
        const paymentList = [];
        const receiptList = [];

        let theNgo = await this.ngoService.getNgo(
            request.ngoId
        );
        //  if ngo does not exist create
        if (!theNgo) {
            let newNgo: NgoParams;
            try {
                newNgo = {
                    flaskNgoId: request.ngoId,
                };

                theNgo = await this.ngoService.createNgo(newNgo);
            } catch (e) {
                throw new AllExceptionsFilter(e);
            }
        }

        // 1- Child
        try {
            theChild = await this.childrenService.getChildById(
                request.childId,
            );
        } catch (e) {
            throw new AllExceptionsFilter(e);
        }

        let supervisor = await this.userService.getSocialWorker(
            request.confirmUser
        );
        //  if supervisor does not exist create
        if (!supervisor) {
            let newSupervisor: SocialWorkerParams;
            try {
                newSupervisor = {
                    flaskSwId: request?.confirmUser,
                    typeId: RolesEnum.SAY_SUPERVISOR,
                    ngo: theNgo
                };

                supervisor = await this.userService.createSocialWorker(newSupervisor);
            } catch (e) {
                throw new AllExceptionsFilter(e);
            }
        }

        let socialWorker = await this.userService.getSocialWorker(
            request.createdById
        );
        //  if social worker does not exist create
        if (!socialWorker) {
            let newSocialWorker: SocialWorkerParams;
            try {
                newSocialWorker = {
                    flaskSwId: request?.createdById,
                    typeId: RolesEnum.SOCIAL_WORKER,
                    ngo: theNgo
                };

                socialWorker = await this.userService.createSocialWorker(newSocialWorker);
            } catch (e) {
                throw new AllExceptionsFilter(e);
            }
        }
        if (!theChild) {
            try {
                await this.childrenService.createChild({ flaskChildId: request.childId, flaskSupervisorId: request.confirmUser, socialWorker, supervisor, ngo: theNgo });
            } catch (e) {
                throw new ServerError(e);
            }
        }

        // 2- Check for Need
        let thisNeed: NeedEntity;
        try {
            thisNeed = await this.needService.getNeedById(
                request.needId,
            );
        } catch (e) {
            throw new ServerError(e);
        }

        // 3- Payments / Participants
        if (request.isDone) {
            // Participants - from Dapp need summery api
            for (let k = 0; k < request.participants?.length; k++) {
                let user = await this.userService.getFamily(
                    request.participants[k].id_user
                );
                if (!user) {
                    let newUser: FamilyParams;
                    try {
                        newUser = {
                            flaskUserId: request.participants[k].id_user,
                            avatarUrl: request.participants[k].user_avatar
                        };

                        user = await this.userService.createFamilyMember(newUser);
                    } catch (e) {
                        throw new AllExceptionsFilter(e);
                    }
                }
                participantList.push(user);
            }
            // Payments - from done needs
            for (let k = 0; k < request.payments?.length; k++) {
                let user = await this.userService.getFamily(
                    request.payments[k].id_user
                );
                if (!user) {
                    let newUser: FamilyParams;
                    try {
                        newUser = {
                            flaskUserId: request.payments[k].id_user
                        };

                        user = await this.userService.createFamilyMember(newUser);
                    } catch (e) {
                        throw new AllExceptionsFilter(e);
                    }
                }

                let payment = await this.paymentService.getPayment(
                    request.payments[k].id,
                );
                if (!payment) {
                    let newPayment: PaymentParams;
                    console.log(
                        request.payments[k].id,
                    )
                    try {
                        newPayment = {
                            flaskUserId: request.payments[k].id_user,
                            bankAmount: request.payments[k].bank_amount,
                            cardNumber: request.payments[k].card_no,
                            cartPaymentId:
                                request.payments[k].cart_payment_id,
                            created:
                                request.payments[k] &&
                                new Date(request.payments[k].created),
                            creditAmount: request.payments[k].credit_amount,
                            description: request.payments[k].desc,
                            donationAmount:
                                request.payments[k].donation_amount,
                            gatewayPaymentId:
                                request.payments[k].gateway_payment_id,
                            gatewayTrackId:
                                request.payments[k].gateway_track_id,
                            hashedCardNumber:
                                request.payments[k].hashed_card_no,
                            flaskPaymentId: request.payments[k].id,
                            flaskNeedId: request.payments[k].id_need,
                            link: request.payments[k].link,
                            needAmount: request.payments[k].need_amount,
                            orderId: request.payments[k].order_id,
                            totalAmount: request.payments[k].total_amount,
                            transactionDate:
                                request.payments[k] &&
                                new Date(request.payments[k].transaction_date),
                            updated:
                                request.payments[k] &&
                                new Date(request.payments[k].updated),
                            verified:
                                request.payments[k] &&
                                new Date(request.payments[k].verified),
                            user,
                        };
                        payment = await this.paymentService.createPayment(
                            newPayment,
                        );
                    } catch (e) {
                        throw new AllExceptionsFilter(e);
                    }
                }

                paymentList.push(payment);
            }



            // Receipts - from panel reports
            for (let k = 0; k < request.receipts?.length; k++) {
                let receipt = await this.receiptService.getReceipt(
                    request.receipts[k].id,
                );


                if (!receipt) {
                    let newReceipt: ReceiptParams;
                    try {
                        newReceipt = {
                            title: request.receipts[k].title,
                            description: request.receipts[k].description,
                            attachment: request.receipts[k].attachment,
                            isPublic: request.receipts[k].isPublic,
                            code: request.receipts[k].code,
                            flaskSwId: request.receipts[k].ownerId,
                            socialWorker: socialWorker,
                            child: theChild,
                            needStatus: request.receipts[k].needStatus,
                            flaskReceiptId: request.receipts[k].id,
                            deleted: request.receipts[k].deleted,
                            flaskNeedId: request.needId,
                        };
                        receipt = await this.receiptService.createReceipt(
                            newReceipt,
                        );
                    } catch (e) {
                        console.log(e)
                        throw new AllExceptionsFilter(e);
                    }
                }
                receiptList.push(receipt);
            }

            let theNgo = await this.ngoService.getNgo(
                request.ngoId
            );
            //  if ngo does not exist create
            if (!theNgo) {
                let newNgo: NgoParams;
                try {
                    newNgo = {
                        flaskNgoId: request?.ngoId,
                        socialWorker
                    };

                    theNgo = await this.ngoService.createNgo(newNgo);
                } catch (e) {
                    throw new AllExceptionsFilter(e);
                }
            }



            // 4- if does not exist create
            if (!thisNeed) {
                // if not created save need
                let need: NeedEntity;
                let newNeed: NeedParams;
                try {
                    newNeed = {
                        flaskNeedId: request.needId,
                        flaskChildId: request.childId,
                        flaskNgoId: request.ngoId,
                        title: request.title,
                        link: request.link,
                        affiliateLinkUrl: request.affiliateLinkUrl,
                        bankTrackId: request.bankTrackId,
                        category: request.category,
                        childGeneratedCode: request?.childGeneratedCode,
                        childSayName: request.childSayName,
                        childDeliveryDate:
                            request.childDeliveryDate &&
                            new Date(request.childDeliveryDate),
                        confirmDate:
                            request.confirmDate &&
                            new Date(request?.confirmDate),
                        cost: request.cost,
                        created:
                            request.created &&
                            new Date(request?.created),
                        supervisor: supervisor,
                        socialWorker: socialWorker,
                        flaskSupervisorId: request?.confirmUser,
                        flaskSwId: request?.createdById,
                        deletedAt:
                            request.deleted_at &&
                            new Date(request?.deleted_at),
                        description: request.description, // { en: '' , fa: ''}
                        descriptionTranslations:
                            request.descriptionTranslations, // { en: '' , fa: ''}
                        titleTranslations: request.titleTranslations,
                        details: request.details,
                        doingDuration: request.doing_duration,
                        donated: request.donated,
                        doneAt:
                            request.doneAt &&
                            new Date(request?.doneAt),
                        expectedDeliveryDate:
                            request.expectedDeliveryDate &&
                            new Date(request?.expectedDeliveryDate),
                        information: request.information,
                        isConfirmed: request.isConfirmed,
                        isDeleted: request.isDeleted,
                        isDone: request.isDone,
                        isReported: request.isReported,
                        isUrgent: request.isUrgent,
                        ngo: theNgo,
                        ngoAddress: request.ngoAddress,
                        ngoName: request.ngoName,
                        ngoDeliveryDate:
                            request.ngoDeliveryDate &&
                            new Date(request?.ngoDeliveryDate),
                        oncePurchased: request.oncePurchased,
                        paid: request.paid,
                        purchaseCost: request.purchaseCost,
                        purchaseDate:
                            request.purchaseDate &&
                            new Date(request?.purchaseDate),
                        receiptCount: request.receiptCount,
                        status: request.status,
                        statusDescription: request.statusDescription,
                        statusUpdatedAt:
                            request.statusUpdatedAt &&
                            new Date(request?.statusUpdatedAt),
                        type:
                            request.type === 0
                                ? NeedTypeEnum.SERVICE
                                : NeedTypeEnum.PRODUCT,
                        typeName: request.typeName,
                        unavailableFrom:
                            request.unavailableFrom &&
                            new Date(request?.unavailableFrom),
                        unconfirmedAt:
                            request.unconfirmedAt &&
                            new Date(request?.unconfirmedAt),
                        unpaidCost: request.unpaidCost,
                        unpayable: request.unpayable,
                        unpayableFrom:
                            request.unpayableFrom &&
                            new Date(request?.unpayableFrom),
                        updated:
                            request.updated &&
                            new Date(request?.updated),
                        imageUrl: request.imageUrl,
                        needRetailerImg: request.needRetailerImg,
                        progress: request?.progress,
                    };
                    need = await this.needService.createNeed(
                        theChild,
                        newNeed,
                        receiptList,
                        paymentList,
                        participantList,
                    );
                } catch (e) {
                    // dapp api error when child is not created yet
                    throw new ServerError(e);
                }
                newNeedResult = need;
            }

            // 2-b if no Need update need
            if (thisNeed) {
                let updatedNeed: UpdateResult;
                let updateNeedDetails: NeedParams;
                try {
                    updateNeedDetails = {
                        flaskNeedId: request.needId,
                        flaskChildId: request.childId,
                        flaskNgoId: request.ngoId,
                        title: request.title,
                        link: request.link,
                        affiliateLinkUrl: request.affiliateLinkUrl,
                        bankTrackId: request.bankTrackId,
                        category: request.category,
                        childGeneratedCode: request?.childGeneratedCode,
                        childSayName: request.childSayName,
                        childDeliveryDate:
                            request.childDeliveryDate &&
                            new Date(request.childDeliveryDate),
                        confirmDate:
                            request.confirmDate &&
                            new Date(request?.confirmDate),
                        supervisor: supervisor,
                        cost: request.cost,
                        created:
                            request.created &&
                            new Date(request?.created),
                        socialWorker: socialWorker,
                        flaskSwId: request?.createdById,
                        flaskSupervisorId: request?.confirmUser,
                        deletedAt:
                            request.deleted_at &&
                            new Date(request?.deleted_at),
                        description: request.description, // { en: '' , fa: ''}
                        descriptionTranslations:
                            request.descriptionTranslations, // { en: '' , fa: ''}
                        titleTranslations: request.titleTranslations,
                        details: request.details,
                        doingDuration: request.doing_duration,
                        donated: request.donated,
                        doneAt:
                            request.doneAt &&
                            new Date(request?.doneAt),
                        expectedDeliveryDate:
                            request.expectedDeliveryDate &&
                            new Date(request?.expectedDeliveryDate),
                        information: request.information,
                        isConfirmed: request.isConfirmed,
                        isDeleted: request.isDeleted,
                        isDone: request.isDone,
                        isReported: request.isReported,
                        isUrgent: request.isUrgent,
                        ngo: theNgo,
                        ngoAddress: request.ngoAddress,
                        ngoName: request.ngoName,
                        ngoDeliveryDate:
                            request.ngoDeliveryDate &&
                            new Date(request?.ngoDeliveryDate),
                        oncePurchased: request.oncePurchased,
                        paid: request.paid,
                        purchaseCost: request.purchaseCost,
                        purchaseDate:
                            request.purchaseDate &&
                            new Date(request?.purchaseDate),
                        receiptCount: request.receiptCount,
                        status: request.status,
                        statusDescription: request.statusDescription,
                        statusUpdatedAt:
                            request.statusUpdatedAt &&
                            new Date(request?.statusUpdatedAt),
                        type:
                            request.type === 0
                                ? NeedTypeEnum.SERVICE
                                : NeedTypeEnum.PRODUCT,
                        typeName: request.typeName,
                        unavailableFrom:
                            request.unavailableFrom &&
                            new Date(request?.unavailableFrom),
                        unconfirmedAt:
                            request.unconfirmedAt &&
                            new Date(request?.unconfirmedAt),
                        unpaidCost: request.unpaidCost,
                        unpayable: request.unpayable,
                        unpayableFrom:
                            request.unpayableFrom &&
                            new Date(request?.unpayableFrom),
                        updated:
                            request.updated &&
                            new Date(request?.updated),
                        imageUrl: request.imageUrl,
                        needRetailerImg: request.needRetailerImg,
                        progress: request?.progress,
                    };

                    updatedNeed = await this.needService.updateSyncNeed(
                        thisNeed,
                        updateNeedDetails,
                        receiptList,
                        paymentList,
                        participantList,
                    );
                    console.log(updatedNeed);
                } catch (e) {
                    console.log(e);
                    throw new AllExceptionsFilter(e);
                }

                newNeedResult = updatedNeed;
            }
        }

        const result = {
            nestChildrenResult: newChildrenList,
            nestNeedResult: newNeedResult,
            nestChildResult: childResult,
        };
        return result;
    }
}
