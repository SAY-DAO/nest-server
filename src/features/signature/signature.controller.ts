import { Body, Controller, Get, Post, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServerError } from '../../filters/server-exception.filter';
import { ContributorsEnum, RolesEnum, SwSignatureResult } from '../../types/interface';
import { SwCreateSwSignatureDto } from '../../types/dtos/CreateSignature.dto';
import { ValidateSignaturePipe } from './pipes/validate-signature.pipe';
import { SignatureService } from './signature.service';
import { NeedService } from '../need/need.service';
import { ChildrenService } from '../children/children.service';
import { NeedParams } from 'src/types/parameters/NeedParameters';
import { SocialWorkerEntity } from 'src/entities/user.entity';
import { NgoModel, SocialWorkerModel, } from 'src/generated-sources/openapi';
import { SocialWorkerParams } from 'src/types/parameters/UserParameters';
import { NgoService } from '../ngo/ngo.service';
import { NgoParams } from 'src/types/parameters/NgoParammeters';
import { NgoEntity } from 'src/entities/ngo.entity';
import { UserService } from '../user/user.service';

@ApiTags('Signatures')
@Controller('signatures')
export class SignatureController {
  constructor(private signatureService: SignatureService,
    private needService: NeedService,
    private childrenService: ChildrenService,
    private userService: UserService,
    private ngoService: NgoService,
  ) { }

  @Get(`all`)
  @ApiOperation({ description: 'Get a single transaction by ID' })
  async getTransaction() {
    return await this.signatureService.getSignatures();
  }

  @Post(`sw/generate`)
  @UsePipes(new ValidationPipe()) // validation for dto files
  async swSignTransaction(
    @Req() req: Request,
    @Body(ValidateSignaturePipe) request: SwCreateSwSignatureDto) {
    let transaction: SwSignatureResult;
    try {
      const accessToken = req.headers['authorization'];


      // NGO
      let theNgo: NgoModel | NgoEntity
      let ngoDetails: NgoParams
      theNgo = await this.ngoService.getNgo(request.socialWorker.ngoId)
      if (!theNgo) {
        theNgo = await this.ngoService.getFlaskNgo(accessToken, request.socialWorker.ngoId)
        ngoDetails = {
          flaskNgoId: theNgo.id,
          cityId: theNgo.cityId,
          name: theNgo.name,
          website: theNgo.website,
          postalAddress: theNgo.postalAddress,
          emailAddress: theNgo.emailAddress,
          phoneNumber: theNgo.phoneNumber,
          logoUrl: theNgo.logoUrl,
          registerDate: theNgo.registerDate && new Date(theNgo?.registerDate),
          updated: theNgo.updated && new Date(theNgo?.updated),
          isActive: theNgo.isActive,
          isDeleted: theNgo.isDeleted,
        }
        theNgo = await this.ngoService.createNgo(ngoDetails)
      }

      // Social worker
      let theSocialWorker: SocialWorkerEntity
      let swDetails: SocialWorkerParams
      theSocialWorker = await this.userService.getSw(request.socialWorker.id)
      if (!theSocialWorker) {
        const socialWorker = await this.userService.getFlaskSw(accessToken, request.socialWorker.id)
        swDetails = {
          flaskSwId: socialWorker.id,
          birthCertificateNumber: socialWorker.birthCertificateNumber,
          idCardUrl: socialWorker.idCardUrl,
          generatedCode: socialWorker.generatedCode,
          cityId: socialWorker.cityId,
          stateId: socialWorker.city.stateId,
          countryId: socialWorker.city.countryId,
          cityName: socialWorker.city.name,
          stateName: socialWorker.city.stateName,
          countryName: socialWorker.city.countryName,
          ngo: ngoDetails,
          role: ContributorsEnum.SOCIAL_WORKER
        }
        theSocialWorker = await this.userService.createSocialWorker(swDetails)
      }

      // Auditor
      let theAuditor: SocialWorkerModel | SocialWorkerEntity
      let auditorDetails: SocialWorkerParams
      theAuditor = await this.userService.getSw(request.socialWorker.id)
      if (!theAuditor) {
        const auditor = await this.userService.getFlaskSw(accessToken, request.socialWorker.id)
        auditorDetails = {
          flaskSwId: auditor.id,
          role: ContributorsEnum.AUDITOR
        }
        theAuditor = await this.userService.createSocialWorker(auditorDetails)
      }

      // Purchaser
      let thePurchaser: SocialWorkerEntity
      let purchaserDetails: SocialWorkerParams
      thePurchaser = await this.userService.getSw(request.socialWorker.id)
      if (!theAuditor) {
        const purchaser = await this.userService.getFlaskSw(accessToken, request.socialWorker.id)
        purchaserDetails = {
          flaskSwId: purchaser.id,
          role: ContributorsEnum.PURCHASER
        }
        thePurchaser = await this.userService.createSocialWorker(purchaserDetails)
      }


      const childDetails = {
        flaskChildId: request.child.id,
        sayName: request.child.sayName,
        firstName: request.child.firstName,
        lastName: request.child.lastName,
        birthDate: request.child.birthDate && new Date(request.child.birthDate),
        awakeAvatarUrl: request.child.awakeAvatarUrl,
      }
      const needDetails: NeedParams = {
        flaskNeedId: request.need.id,
        createdById: request.need.createdById,
        descriptionTranslations: { en: request.need.descriptionTranslations.en, fa: request.need.descriptionTranslations.fa },
        name: request.need.name,
        title: request.need.title,
        status: request.need.status,
        titleTranslations: { en: request.need.nameTranslations.en, fa: request.need.nameTranslations.fa },
        description: request.need.description,
        details: request.need.details,
        imageUrl: request.need.imageUrl,
        category: request.need.category,
        type: request.need.type,
        isUrgent: request.need.isUrgent,
        affiliateLinkUrl: request.need.affiliateLinkUrl,
        link: request.need.link,
        doingDuration: request.need.doingDuration,
        needRetailerImg: request.need.img,
        paid: request.need.paid,
        purchaseCost: request.need.purchaseCost,
        cost: request.need.cost,
        unpayable: request.need.unpayable,
        isDone: request.need.isDone,
        doneAt: request.need.doneAt,
        isDeleted: request.need.isDeleted,
        isConfirmed: request.need.isConfirmed,
        unpayableFrom: request.need.unpayableFrom,
        updated: request.need.updated,
        confirmDate: request.need.confirmDate,
        auditor: auditorDetails,
        deletedAt: request.need.deletedAt,
        bankTrackId: request.need.bankTrackId,
        receipts: request.need.receipts_,
        verifiedPayments: request.need.verifiedPayments,
        participants: request.need.participants,
        flaskNgoId: theNgo.flaskNgoId,
        flaskChildId: 0,
        created: undefined,
        purchaseDate: undefined,
        ngoDeliveryDate: undefined
      }
      const child = await this.childrenService.createChild(childDetails)
      const need = await this.needService.createNeed(child, theNgo, theSocialWorker, theAuditor, thePurchaser, needDetails)
      transaction = await this.signatureService.swSignTransaction(request.signerAddress, request.need, child);
      console.log(transaction)
    } catch (e) {
      console.log(e)
      throw new ServerError(e);
    }
    return transaction;
  }
}

