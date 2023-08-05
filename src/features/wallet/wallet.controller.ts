import {
  Body,
  Controller,
  Delete,
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
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  PanelContributors,
  SAYPlatformRoles,
  SwSignatureResult,
} from '../../types/interfaces/interface';
import {
  CreateSignatureDto,
  SwGenerateSignatureDto,
  VerifyWalletDto,
} from '../../types/dtos/CreateSignature.dto';
import { ValidateSignaturePipe } from './pipes/validate-wallet.pipe';
import { WalletService } from './wallet.service';
import { SyncService } from '../sync/sync.service';
import { generateNonce, ErrorTypes, SiweMessage } from 'siwe';
import { WalletExceptionFilter } from 'src/filters/wallet-exception.filter';
import { AllExceptionsFilter } from 'src/filters/all-exception.filter';
import { IpfsService } from '../ipfs/ipfs.service';
import { WalletInterceptor } from './interceptors/wallet.interceptors';
import { UserService } from '../user/user.service';
import {
  convertFlaskToSayPanelRoles,
  convertFlaskToSayRoles,
} from 'src/utils/helpers';
import { NeedService } from '../need/need.service';
import {
  FamilyAPIApi,
  SocialWorkerAPIApi,
} from 'src/generated-sources/openapi';
import { ObjectNotFound } from 'src/filters/notFound-expectation.filter';

@UseInterceptors(WalletInterceptor)
@ApiTags('Wallet')
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskSwId',
  description: 'to use cache and flask authentication',
  required: true,
})
@Controller('wallet')
export class SignatureController {
  constructor(
    private walletService: WalletService,
    private syncService: SyncService,
    private ipfsService: IpfsService,
    private userService: UserService,
    private needService: NeedService,
  ) {}

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
      const panelRole = convertFlaskToSayPanelRoles(typeId);
      if (
        panelRole === PanelContributors.SOCIAL_WORKER ||
        panelRole === PanelContributors.AUDITOR ||
        panelRole === PanelContributors.PURCHASER ||
        panelRole === PanelContributors.NGO_SUPERVISOR
      ) {
        let nestContributor = await this.userService.getContributorByFlaskId(
          userId,
          panelRole,
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
            flaskUserId: callerFlaskId,
            flaskNgoId: callerFlaskNgoId,
            birthDate:
              flaskCaller.birth_date && new Date(flaskCaller.birth_date),
            panelRole: convertFlaskToSayPanelRoles(flaskCaller.type_id),
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
  async getSignatures() {
    return await this.walletService.getSignatures();
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

      transaction = await this.walletService.prepareSignature(
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
  @ApiOperation({ description: 'Create a signature' })
  async createSignature(
    @Param('signature') signature: string,
    @Body(ValidateSignaturePipe) body: CreateSignatureDto,
    @Session() session: Record<string, any>,
  ) {
    if (!session.siwe) {
      throw new WalletExceptionFilter(401, 'You have to first sign_in');
    }
    try {
      const sessionFlaskUserId = session.siwe.flaskUserId;
      const need = await this.needService.getNeedByFlaskId(body.flaskNeedId);
      const needSignatures = await this.walletService.getNeedSignatures(
        body.flaskNeedId,
      );

      const theSignature = needSignatures.find((s) => s.hash === signature);

      if (!theSignature && need) {
        const initialSignature = needSignatures.find(
          (s) =>
            s.flaskUserId ===
            need.socialWorker.contributions.find(
              (c) => c.flaskUserId == need.socialWorker.flaskUserId,
            ).flaskUserId,
        );
        // social worker
        if (
          !initialSignature &&
          need.socialWorker.contributions.find(
            (c) => c.flaskUserId == need.socialWorker.flaskUserId,
          ).flaskUserId === Number(sessionFlaskUserId) &&
          body.sayRole === SAYPlatformRoles.SOCIAL_WORKER
        ) {
          console.log(
            '\x1b[36m%s\x1b[0m',
            'Creating Social Worker Signature ...',
          );
          const initialSignature = await this.walletService.createSignature(
            signature,
            need.flaskId,
            SAYPlatformRoles.SOCIAL_WORKER,
            sessionFlaskUserId,
          );

          const swDetails = {
            firstName: need.socialWorker.firstName,
            lastName: need.socialWorker.lastName,
            avatarUrl: need.socialWorker.avatarUrl,
            flaskUserId: need.socialWorker.contributions.find(
              (c) => c.flaskUserId == need.socialWorker.flaskUserId,
            ).flaskUserId,
            birthDate:
              need.socialWorker.birthDate &&
              new Date(need.socialWorker.birthDate),
            panelRole: need.socialWorker.contributions.find(
              (c) => c.flaskUserId == need.socialWorker.flaskUserId,
            ).panelRole,
            need,
          };
          await this.userService.updateContributor(
            need.socialWorker.id,
            swDetails,
          );

          return { signature: initialSignature };
        }
        if (
          initialSignature &&
          initialSignature.flaskUserId ===
            need.socialWorker.contributions.find(
              (c) => c.flaskUserId == need.socialWorker.flaskUserId,
            ).flaskUserId
        ) {
          console.log(initialSignature.flaskUserId);
          console.log(need.auditor.flaskUserId);
          console.log(
            need.auditor.contributions.find(
              (c) => c.flaskUserId == need.auditor.flaskUserId,
            ).flaskUserId,
          );

          // auditor
          if (
            need.auditor.contributions.find(
              (c) => c.flaskUserId == need.auditor.flaskUserId,
            ).flaskUserId === Number(sessionFlaskUserId) &&
            body.sayRole === SAYPlatformRoles.AUDITOR
          ) {
            console.log('\x1b[36m%s\x1b[0m', 'Uploading to IPFS ...');
            const ipfs = await this.ipfsService.handleIpfs(
              signature,
              SAYPlatformRoles.AUDITOR,
              sessionFlaskUserId,
              need,
            );
            console.log('\x1b[36m%s\x1b[0m', 'Creating Auditor Signature ...');
            const auditorSignature = await this.walletService.createSignature(
              signature,
              need.flaskId,
              SAYPlatformRoles.AUDITOR,
              sessionFlaskUserId,
            );

            const auditorDetails = {
              firstName: need.auditor.firstName,
              lastName: need.auditor.lastName,
              avatarUrl: need.auditor.avatarUrl,
              flaskUserId: need.auditor.contributions.find(
                (c) => c.flaskUserId == need.auditor.flaskUserId,
              ).flaskUserId,
              birthDate:
                need.auditor.birthDate && new Date(need.socialWorker.birthDate),
              panelRole: need.auditor.contributions.find(
                (c) => c.flaskUserId == need.auditor.flaskUserId,
              ).panelRole,
              need,
            };
            await this.userService.updateContributor(
              need.auditor.id,
              auditorDetails,
            );
            return { ipfs, signature: auditorSignature };
          }
          // purchaser
          if (
            need.purchaser.contributions.find(
              (c) => c.flaskUserId == need.purchaser.flaskUserId,
            ).flaskUserId === Number(sessionFlaskUserId) &&
            body.sayRole === SAYPlatformRoles.PURCHASER
          ) {
            console.log(
              '\x1b[36m%s\x1b[0m',
              'Creating Purchaser Signature ...',
            );
            const purchaserSignature = await this.walletService.createSignature(
              signature,
              need.flaskId,
              SAYPlatformRoles.PURCHASER,
              sessionFlaskUserId,
            );
            return { signature: purchaserSignature };
          }
          // family
          else if (
            need.verifiedPayments.find(
              (p) => p.flaskUserId === Number(sessionFlaskUserId),
            ) &&
            body.sayRole === SAYPlatformRoles.FAMILY
          ) {
            // family need the auditor signature
            if (
              need.signatures.find(
                (s) => s.role === SAYPlatformRoles.AUDITOR,
              ) &&
              need.ipfs
            ) {
              console.log(
                '\x1b[36m%s\x1b[0m',
                'Creating Virtual Family Signatures ...',
              );
              const familySignature = await this.walletService.createSignature(
                signature,
                body.flaskNeedId,
                SAYPlatformRoles.FAMILY,
                sessionFlaskUserId,
              );
              return { signature: familySignature };
            } else {
              throw new WalletExceptionFilter(
                403,
                'This need is not signed by auditor!',
              );
            }
          } else {
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
        await this.walletService.deleteOne(theSignature);
      }
      throw new WalletExceptionFilter(e.status, e.message);
    }
  }

  @Get(`signature/:signature`)
  @ApiOperation({ description: 'Get all signature' })
  async getSignature(@Param('signature') signature: string) {
    return await this.walletService.getSignature(signature);
  }

  @Get(`signatures/:flaskUserId`)
  @ApiOperation({ description: 'Get contributors signatures' })
  async getContributorSignatures(@Param('flaskUserId') flaskUserId: number) {
    return await this.walletService.getUserSignatures(flaskUserId);
  }

  @Get(`signatures/ready/:flaskUserId`)
  @ApiOperation({ description: 'Get virtual family member signatures' })
  async getFamilyMemberSignatures(@Param('flaskUserId') flaskUserId: number) {
    return await this.walletService.getUserSignatures(flaskUserId);
  }
  @Delete(`signature/:signature`)
  @ApiOperation({ description: 'Delete a signatures' })
  async deleteSignature(@Param('signature') signature: string) {
    const theSignature = await this.walletService.getSignature(signature);
    return await this.walletService.deleteOne(theSignature.id);
  }

  @Get(`family/signatures/ready/:userId`)
  @ApiOperation({
    description: 'Get all signed needs for virtual family member',
  })
  async getReadyNeeds(@Param('userId') userId: number) {
    if (!userId) {
      throw new ObjectNotFound('We need the user ID!');
    }
    return await this.walletService.getFamilyReadyToSignNeeds(Number(userId));
  }
}
