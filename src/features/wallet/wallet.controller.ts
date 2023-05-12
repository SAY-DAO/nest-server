import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  Res,
  Session,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  SAYPlatformRoles,
  SwSignatureResult,
} from '../../types/interfaces/interface';
import {
  CreateSignatureDto,
  SwGenerateSignatureDto,
  VerifyWalletDto,
} from '../../types/dtos/CreateSignature.dto';
import { ValidateSignaturePipe } from './pipes/validate-wallet.pipe';
import { SignatureService } from './wallet.service';
import { SyncService } from '../sync/sync.service';
import { generateNonce, ErrorTypes, SiweMessage } from 'siwe';
import { WalletExceptionFilter } from 'src/filters/wallet-exception.filter';
import { AllExceptionsFilter } from 'src/filters/all-exception.filter';
import { IpfsService } from '../ipfs/ipfs.service';
import { WalletInterceptor } from './interceptors/wallet.interceptors';
import { UserService } from '../user/user.service';
import { convertFlaskToSayRoles } from 'src/utils/helpers';
import { NeedService } from '../need/need.service';
import {
  FamilyAPIApi,
  SocialWorkerAPIApi,
} from 'src/generated-sources/openapi';

@UseInterceptors(WalletInterceptor)
@ApiTags('Wallet')
@Controller('wallet')
export class SignatureController {
  constructor(
    private signatureService: SignatureService,
    private syncService: SyncService,
    private ipfsService: IpfsService,
    private userService: UserService,
    private needService: NeedService,
  ) { }

  @Get('nonce/:userId/:typeId')
  @ApiOperation({ description: 'Get SIWE nonce' })
  async getNonce(
    @Res() res,
    @Request() req,
    @Session() session: Record<string, any>,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('typeId', ParseIntPipe) typeId: number,
  ) {
    const accessToken = req.headers['authorization'];
    const role = convertFlaskToSayRoles(typeId);

    try {
      if (
        role === SAYPlatformRoles.SOCIAL_WORKER ||
        role === SAYPlatformRoles.AUDITOR ||
        role === SAYPlatformRoles.PURCHASER ||
        role === SAYPlatformRoles.NGO_SUPERVISOR
      ) {
        const flaskApi = new SocialWorkerAPIApi();
        const socialWorker = await flaskApi.apiV2SocialworkersIdGet(
          accessToken,
          userId,
        );

        if (socialWorker.id === userId) {
          if (!session.nonce) {
            session.nonce = generateNonce();
            session.save();
          }
          res.setHeader('Content-Type', 'application/json');
          res
            .status(200)
            .send({ nonce: session.nonce, expiry: session.cookie._expires });
        }
      }
      if (role === SAYPlatformRoles.FAMILY) {
        const flaskApi = new FamilyAPIApi();
        const familyMember = await flaskApi.apiV2FamilyFamilyIdfamilyIdGet(
          accessToken,
          userId,
        );
        if (familyMember.userId === userId) {
          if (!session.nonce) {
            session.nonce = generateNonce();
            session.save();
          }

          res.setHeader('Content-Type', 'application/json');
          res
            .status(200)
            .send({ nonce: session.nonce, expiry: session.cookie._expires });
        }
      }
    } catch (e) {
      req.session.destroy();
      throw new WalletExceptionFilter(e.status, e.message);
    }
  }

  @Post(`verify/:userId/:typeId`)
  @ApiOperation({ description: 'Verify SIWE' })
  async verifySiwe(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('typeId', ParseIntPipe) typeId: number,
    @Session() session,
    @Request() req,
    @Body(ValidateSignaturePipe) body: VerifyWalletDto,
  ) {
    try {
      if (!body.message) {
        throw new WalletExceptionFilter(
          422,
          'Expected prepareMessage object as body.',
        );
      }

      const message = new SiweMessage(body.message);
      console.log(session);

      const fields = await message.validate(body.signature);
      if (fields.nonce !== session.nonce) {
        throw new WalletExceptionFilter(422, `Invalid nonce.`);
      }
      session.siwe = fields;
      session.siwe.flaskUserId = userId;
      session.siwe.flaskTypeId = typeId;
      // session.cookie._expires = new Date(fields.expirationTime);
      // session.clear();
      session.save();
      const role = convertFlaskToSayRoles(typeId);

      if (
        role === SAYPlatformRoles.SOCIAL_WORKER ||
        role === SAYPlatformRoles.AUDITOR ||
        role === SAYPlatformRoles.PURCHASER ||
        role === SAYPlatformRoles.NGO_SUPERVISOR
      ) {
        let nestContributor = await this.userService.getContributorByFlaskId(
          userId,
        );

        if (!nestContributor) {
          const flaskCaller = await this.userService.getFlaskSocialWorker(
            userId,
          );
          console.log(
            '\x1b[36m%s\x1b[0m',
            'Syncing NGO and Caller ...\n' + flaskCaller.id,
          );
          const CallerNgo = await this.syncService.syncContributorNgo(
            flaskCaller,
          );
          console.log(
            '\x1b[36m%s\x1b[0m',
            'Synced NGO and Caller ...\n' + flaskCaller.id,
          );

          const {
            id: callerFlaskId,
            ngo_id: callerFlaskNgoId,
            ...callerOtherParams
          } = flaskCaller;

          const callerDetails = {
            ...callerOtherParams,
            typeId: flaskCaller.type_id,
            firstName: flaskCaller.firstName,
            lastName: flaskCaller.lastName,
            avatarUrl: flaskCaller.avatar_url,
            flaskId: callerFlaskId,
            flaskNgoId: callerFlaskNgoId,
            birthDate:
              flaskCaller.birth_date && new Date(flaskCaller.birth_date),
            role: convertFlaskToSayRoles(flaskCaller.type_id),
          };
          console.log('\x1b[36m%s\x1b[0m', 'Creating a user ...\n');
          nestContributor = await this.userService.createContributor(
            callerDetails,
            CallerNgo,
          );
          console.log('\x1b[36m%s\x1b[0m', 'Created a user ...\n');
        }
        if (nestContributor && !nestContributor.wallet) {
          await this.userService.createUserWallet(
            body.message.address,
            body.message.chainId,
            nestContributor,
          );
        }
        return session.nonce;
      }
    } catch (e) {
      session.siwe = null;
      session.nonce = null;
      req.session.destroy();

      switch (e) {
        case ErrorTypes.EXPIRED_MESSAGE: {
          session.save();
          throw new WalletExceptionFilter(e.status, e.message);
        }
        case ErrorTypes.INVALID_SIGNATURE: {
          session.save();
          throw new WalletExceptionFilter(e.status, e.message);
        }
        default: {
          session.save();
          throw new WalletExceptionFilter(e.status, e.message);
        }
      }
    }
  }

  @Get(`personal_information`)
  @ApiOperation({ description: 'Get SIWE personal data' })
  async getPersonalInformation(@Session() session: Record<string, any>) {
    if (!session.siwe) {
      throw new WalletExceptionFilter(401, 'You have to first sign_in');
    }
    return session.siwe;
  }

  @Get(`all`)
  @ApiOperation({ description: 'Get all signatures' })
  async getTransaction(@Session() session: Record<string, any>) {
    if (!session.siwe) {
      throw new WalletExceptionFilter(401, 'You have to first sign_in');
    }
    return await this.signatureService.getSignatures();
  }

  @Post(`signature/prepare`)
  @UsePipes(new ValidationPipe()) // validation for dto files
  async prepareSignature(
    @Body(ValidateSignaturePipe) body: SwGenerateSignatureDto,
    @Session() session: Record<string, any>,
  ) {
    if (!session.siwe) {
      throw new WalletExceptionFilter(401, 'You have to first sign_in');
    }
    let transaction: SwSignatureResult;
    try {
      const flaskUserId = session.siwe.flaskUserId;

      const flaskNeed = await this.needService.getFlaskNeed(body.flaskNeedId);
      const { need, child } = await this.syncService.syncNeed(
        flaskNeed,
        flaskNeed.child_id,
        session.siwe.flaskUserId,
        body.receipts,
        body.payments,
        body.statuses,
      );
      console.log('\x1b[36m%s\x1b[0m', 'Preparing signature data ...\n');

      transaction = await this.signatureService.prepareSignature(
        session.siwe.address,
        need,
        child,
        flaskUserId,
      );
      return transaction;
    } catch (e) {
      console.log(e);
      throw new AllExceptionsFilter(e);
    }
  }

  @Post(`signature/create/:signature`)
  @ApiOperation({ description: 'Get all signatures' })
  async createSignature(
    @Param('signature') signature: string,
    @Body(ValidateSignaturePipe) body: CreateSignatureDto,
    @Session() session: Record<string, any>,
  ) {
    if (!session.siwe) {
      throw new WalletExceptionFilter(401, 'You have to first sign_in');
    }
    try {
      const flaskUserId = session.siwe.flaskUserId;
      const need = await this.needService.getNeedByFlaskId(body.flaskNeedId);
      const needSignatures = await this.signatureService.getNeedSignatures(
        body.flaskNeedId,
      );
      const initialSignature = needSignatures.find(
        (s) => s.flaskUserId === need.socialWorker.contributor.flaskId,
      );
      const theSignature = needSignatures.find((s) => s.hash === signature);

      if (!theSignature && need) {
        // social worker
        if (!initialSignature && need.socialWorker.contributor.flaskId === Number(flaskUserId) && body.sayRole === SAYPlatformRoles.SOCIAL_WORKER) {
          console.log(
            '\x1b[36m%s\x1b[0m',
            'Creating Social Worker Signature ...',
          );
          const initialSignature = await this.signatureService.createSignature(
            signature,
            body.flaskNeedId,
            SAYPlatformRoles.SOCIAL_WORKER,
            flaskUserId,
          );
          return { signature: initialSignature };
        }
        if (initialSignature && initialSignature.flaskUserId === need.socialWorker.contributor.flaskId) {
          // auditor
          if (need.auditor.contributor.flaskId === Number(flaskUserId) && body.sayRole === SAYPlatformRoles.AUDITOR) {
            console.log('\x1b[36m%s\x1b[0m', 'Uploading to IPFS ...');
            const ipfs = await this.ipfsService.handleIpfs(
              signature,
              SAYPlatformRoles.AUDITOR,
              flaskUserId,
              need,
            );
            console.log(
              '\x1b[36m%s\x1b[0m',
              'Creating Social Worker Signature ...',
            );
            const auditorSignature = await this.signatureService.createSignature(
              signature,
              body.flaskNeedId,
              SAYPlatformRoles.AUDITOR,
              flaskUserId,
            );
            return { ipfs, signature: auditorSignature };
          }
          // purchaser
          if (need.purchaser.contributor.flaskId === Number(flaskUserId) && body.sayRole === SAYPlatformRoles.PURCHASER) {
            console.log('\x1b[36m%s\x1b[0m', 'Creating Purchaser Signature ...');
            const purchaserSignature =
              await this.signatureService.createSignature(
                signature,
                body.flaskNeedId,
                SAYPlatformRoles.PURCHASER,
                flaskUserId,
              );
            return { signature: purchaserSignature };
          }
          // family
          else if (need.verifiedPayments.find(p => p.id_user === flaskUserId) && body.sayRole === SAYPlatformRoles.FAMILY) {
            console.log(
              '\x1b[36m%s\x1b[0m',
              'Creating Virtual Family Signatures ...',
            );
            const familySignature = await this.signatureService.createSignature(
              signature,
              body.flaskNeedId,
              SAYPlatformRoles.FAMILY,
              flaskUserId,
            );
            return { signature: familySignature };
          }
          else {
            throw new WalletExceptionFilter(
              403,
              'could not find your role in this need !',
            );
          }
        } else {
          throw new WalletExceptionFilter(
            401,
            'Social worker signature is needed.',
          );
        }
      } else {
        throw new WalletExceptionFilter(403, 'Bad request!');
      }
    } catch (e) {
      const theSignature = await this.getSignature(signature);
      if (theSignature) {
        await this.signatureService.deleteOne(theSignature);
      }
      throw new WalletExceptionFilter(e.status, e.message);
    }
  }

  @Get(`signature/:signature`)
  @ApiOperation({ description: 'Get all signatures' })
  async getSignature(@Param('signature') signature: string) {
    return await this.signatureService.getSignature(signature);
  }
}
