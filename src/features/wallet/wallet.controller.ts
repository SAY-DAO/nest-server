import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Request,
  Res,
  Session,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  AnnouncementEnum,
  AppContributors,
  FlaskUserTypesEnum,
  PanelContributors,
  SAYPlatformRoles,
  SUPER_ADMIN,
  SwSignatureResult,
  eEthereumNetworkChainId,
} from '../../types/interfaces/interface';
import {
  CreateSignatureDto,
  PrepareDappSignatureDto,
  PreparePanelSignatureDto,
  VerifySignatureDto,
  VerifyWalletDto,
} from '../../types/dtos/CreateSignature.dto';
import { ValidateSignaturePipe } from './pipes/validate-wallet.pipe';
import { WalletService } from './wallet.service';
import { SyncService } from '../sync/sync.service';
import { generateNonce, SiweErrorType, SiweMessage } from 'siwe';
import { WalletExceptionFilter } from 'src/filters/wallet-exception.filter';
import { IpfsService } from '../ipfs/ipfs.service';
import { WalletInterceptor } from './interceptors/wallet.interceptors';
import { UserService } from '../user/user.service';
import {
  convertFlaskToSayAppRoles,
  convertFlaskToSayPanelRoles,
  convertFlaskToSayRoles,
} from 'src/utils/helpers';
import { NeedService } from '../need/need.service';
import { SocialWorkerAPIApi, UserAPIApi } from 'src/generated-sources/openapi';
import { ServerError } from 'src/filters/server-exception.filter';
import { TicketService } from '../ticket/ticket.service';

@UseInterceptors(WalletInterceptor)
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskId',
  description: 'to use cache and flask authentication',
  required: true,
})
@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  private readonly logger = new Logger(WalletController.name);

  constructor(
    private walletService: WalletService,
    private syncService: SyncService,
    private ipfsService: IpfsService,
    private userService: UserService,
    private needService: NeedService,
    private ticketService: TicketService,
  ) {}

  @Get('nonce/:userId/:typeId')
  @ApiOperation({ description: 'Get SIWE nonce' })
  async getNonce(
    @Res() res,
    @Request() req,
    @Session() session: Record<string, any>,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('typeId', ParseIntPipe) typeId: SAYPlatformRoles,
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
        const flaskApi = new UserAPIApi();
        const familyMember = await flaskApi.apiV2UserUserIduserIdGet(
          accessToken,
          'me',
        );
        if (familyMember.id === userId) {
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
      throw new ServerError(e);
    }
  }

  @Post(`verify/:userId/:typeId`)
  @ApiOperation({ description: 'Verify SIWE' })
  async verifySiwe(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('typeId', ParseIntPipe) typeId: FlaskUserTypesEnum,
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
            userName: flaskCaller.userName,
          };
          console.log('\x1b[36m%s\x1b[0m', 'Creating a user ...\n');
          nestContributor = await this.userService.createContributor(
            callerDetails,
            CallerNgo,
          );
          console.log('\x1b[36m%s\x1b[0m', 'Created a user ...\n');
        }

        if (
          nestContributor &&
          (nestContributor.wallets.length === 0 ||
            !nestContributor.wallets.find(
              (w) => w.address === body.message.address,
            ))
        ) {
          await this.userService.createUserWallet(
            body.message.address,
            body.message.chainId,
            nestContributor,
          );
        }
        return session.nonce;
      }

      const appRole = convertFlaskToSayAppRoles(typeId);
      if (
        appRole === AppContributors.FAMILY ||
        appRole === AppContributors.RELATIVE
      ) {
      }
    } catch (e) {
      session.siwe = null;
      session.nonce = null;
      req.session.destroy();

      switch (e) {
        case SiweErrorType.EXPIRED_MESSAGE: {
          session.save();
          throw new WalletExceptionFilter(e.status, e.message);
        }
        case SiweErrorType.INVALID_SIGNATURE: {
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

  @Post(`signature/panel/prepare`)
  @UsePipes(new ValidationPipe()) // validation for dto files
  async preparePanelSignature(
    @Body(ValidateSignaturePipe) body: PreparePanelSignatureDto,
    @Session() session: Record<string, any>,
  ) {
    if (body.chainId !== eEthereumNetworkChainId.mainnet) {
      throw new ServerError('Please connect to Mainnet!', 500);
    }
    if (!session.siwe) {
      throw new WalletExceptionFilter(401, 'You have to first sign_in');
    }

    let transaction: SwSignatureResult;
    try {
      const flaskUserId = session.siwe.flaskUserId;
      const userTickets = await this.ticketService.getUserTickets(flaskUserId);
      let counter = 0;

      const purchasedNeeds = await this.needService.getPurchasedNeedsCount(
        flaskUserId,
      );
      purchasedNeeds.forEach((need) => {
        if (
          userTickets.find(
            (t) =>
              t.need.flaskId === need.id &&
              t.ticketHistories.find(
                (h) => h.announcement == AnnouncementEnum.ARRIVED_AT_NGO,
              ),
          )
        ) {
          counter++;
        }
      });

      // if (counter - body.arrivedColumnNumber !== 0) {
      //   throw new WalletExceptionFilter(
      //     418,
      //     'You have to announce arrivals first!',
      //   );
      // }
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
      throw new ServerError(e);
    }
  }

  @Post(`signature/dapp/prepare`)
  @UsePipes(new ValidationPipe()) // validation for dto files
  async prepareDappSignature(
    @Body(ValidateSignaturePipe) body: PrepareDappSignatureDto,
    @Session() session: Record<string, any>,
  ) {
    if (body.chainId !== eEthereumNetworkChainId.mainnet) {
      throw new ServerError('Please connect to Mainnet!', 500);
    }
    console.log(session);

    if (!session.siwe) {
      throw new WalletExceptionFilter(401, 'You have to first sign_in');
    }

    let transaction: SwSignatureResult;
    try {
      const flaskUserId = session.siwe.flaskUserId;
      const need = await this.needService.getNeedById(body.needId);

      const socialWorker = need.signatures.find(
        (s) => s.flaskUserId === need.socialWorker.flaskUserId,
      );

      if (!socialWorker) {
        throw new WalletExceptionFilter(
          403,
          'Hmmm, could not find social worker',
        );
      }

      console.log('\x1b[36m%s\x1b[0m', 'Preparing signature data ...\n');

      transaction = await this.walletService.prepareSignature(
        session.siwe.address,
        need,
        need.child,
        flaskUserId,
      );
      return transaction;
    } catch (e) {
      throw new ServerError(e);
    }
  }

  @Post(`signature/create/:signature`)
  @ApiOperation({ description: 'Create a signature db' })
  async createSignature(
    @Param('signature') signature: string,
    @Body(ValidateSignaturePipe) body: CreateSignatureDto,
    @Session() session: Record<string, any>,
  ) {
    if (!session.siwe) {
      throw new WalletExceptionFilter(401, 'You have to first sign_in');
    }
    this.logger.log('Initiating signature creation');

    try {
      const sessionFlaskUserId = session.siwe.flaskUserId;
      const need = await this.needService.getNeedByFlaskId(body.flaskNeedId);

      const foundSwId = need.socialWorker.flaskUserId;
      const foundAuditorId = need.auditor.flaskUserId;
      const foundPurchaserId = need.purchaser.flaskUserId;
      const foundPayments = need.verifiedPayments.length > 0;

      if (
        !foundSwId ||
        !foundPayments ||
        !foundAuditorId ||
        !foundPurchaserId
      ) {
        throw new WalletExceptionFilter(
          400,
          'At least one of the roles are missing here!',
        );
      }
      if (!need) {
        throw new NotFoundException(404, 'Need was not found!');
      }

      if (body.sayRoles) {
        if (
          !need.signatures[0] &&
          body.sayRoles.includes(SAYPlatformRoles.SOCIAL_WORKER)
        ) {
          this.logger.log('This is a social worker signature creation');
          if (foundSwId !== Number(sessionFlaskUserId)) {
            throw new WalletExceptionFilter(
              403,
              'Could not match the social worker!',
            );
          }

          console.log(
            '\x1b[36m%s\x1b[0m',
            'Creating Social Worker Signature ...',
          );
          const initialSignature = await this.walletService.createSignature(
            signature,
            need.flaskId,
            SAYPlatformRoles.SOCIAL_WORKER,
            sessionFlaskUserId,
            body.verifyVoucherAddress,
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
            userName: need.socialWorker.userName,
          };
          await this.userService.updateContributor(
            need.socialWorker.id,
            swDetails,
          );

          return { signature: initialSignature };
        } else if (
          !need.signatures &&
          !body.sayRoles.includes(SAYPlatformRoles.SOCIAL_WORKER)
        ) {
          throw new WalletExceptionFilter(
            403,
            'This need is not signed by social worker!',
          );
        } else {
          const initialSignature = need.signatures.find(
            (s) =>
              s.flaskUserId ===
              need.socialWorker.contributions.find(
                (c) => c.flaskUserId == need.socialWorker.flaskUserId,
              ).flaskUserId,
          );
          if (initialSignature && initialSignature.flaskUserId === foundSwId) {
            if (body.sayRoles.includes(SAYPlatformRoles.FAMILY)) {
              this.logger.log('This is the family signature creation');
              const foundFamily = need.verifiedPayments.find(
                (p) => p.flaskUserId === Number(sessionFlaskUserId),
              );

              const foundFamilyId = foundFamily
                ? foundFamily.flaskUserId
                : null;
              console.log(need);
              console.log(sessionFlaskUserId);

              if (foundFamilyId !== Number(sessionFlaskUserId)) {
                throw new WalletExceptionFilter(
                  403,
                  'Could not match the family!',
                );
              }

              console.log(
                '\x1b[36m%s\x1b[0m',
                'Creating Virtual Family Signatures ...',
              );
              const familySignature = await this.walletService.createSignature(
                signature,
                body.flaskNeedId,
                SAYPlatformRoles.FAMILY,
                sessionFlaskUserId,
                body.verifyVoucherAddress,
              );
              return { signature: familySignature };
            } else if (body.sayRoles.includes(SAYPlatformRoles.AUDITOR)) {
              this.logger.log('This is the auditor signature creation');
              const auditorSignature = need.signatures.find(
                (s) =>
                  s.flaskUserId ===
                  need.auditor.contributions.find(
                    (c) => c.flaskUserId == need.auditor.flaskUserId,
                  ).flaskUserId,
              );

              if (!auditorSignature) {
                const familySignature = need.signatures.find((s) =>
                  need.verifiedPayments.find(
                    (p) => p.familyMember.flaskUserId == s.flaskUserId,
                  ),
                );
                if (
                  foundAuditorId !== Number(sessionFlaskUserId) ||
                  !familySignature
                ) {
                  throw new WalletExceptionFilter(
                    403,
                    'We need the family signature!',
                  );
                }
                console.log('\x1b[36m%s\x1b[0m', 'Uploading to IPFS ...');
                const ipfs = await this.ipfsService.handleIpfs(signature, need);

                console.log(
                  '\x1b[36m%s\x1b[0m',
                  'Creating Auditor Signature ...',
                );
                const auditorSignature =
                  await this.walletService.createSignature(
                    signature,
                    need.flaskId,
                    SAYPlatformRoles.AUDITOR,
                    sessionFlaskUserId,
                    body.verifyVoucherAddress,
                  );

                const auditorDetails = {
                  firstName: need.auditor.firstName,
                  lastName: need.auditor.lastName,
                  avatarUrl: need.auditor.avatarUrl,
                  flaskUserId: need.auditor.contributions.find(
                    (c) => c.flaskUserId == need.auditor.flaskUserId,
                  ).flaskUserId,
                  birthDate:
                    need.auditor.birthDate && new Date(need.auditor.birthDate),
                  panelRole: need.auditor.contributions.find(
                    (c) => c.flaskUserId == need.auditor.flaskUserId,
                  ).panelRole,
                  need,
                  userName: need.auditor.userName,
                };
                await this.userService.updateContributor(
                  need.auditor.id,
                  auditorDetails,
                );
                return { ipfs, signature: auditorSignature };
              } else if (auditorSignature) {
                throw new WalletExceptionFilter(
                  403,
                  'Auditor has already signed!',
                );
              }
            } else if (body.sayRoles.includes(SAYPlatformRoles.PURCHASER)) {
              this.logger.log('This is the purchaser signature creation');
              const familySignature = need.signatures.find((s) =>
                need.verifiedPayments.find(
                  (p) => p.familyMember.flaskUserId == s.flaskUserId,
                ),
              );
              const auditorSignature = need.signatures.find(
                (s) =>
                  s.flaskUserId ===
                  need.auditor.contributions.find(
                    (c) => c.flaskUserId == need.auditor.flaskUserId,
                  ).flaskUserId,
              );
              const purchaserSignature = need.signatures.find(
                (s) =>
                  s.flaskUserId ===
                  need.purchaser.contributions.find(
                    (c) => c.flaskUserId == need.purchaser.flaskUserId,
                  ).flaskUserId,
              );

              if (!purchaserSignature) {
                if (
                  foundPurchaserId !== Number(sessionFlaskUserId) ||
                  !auditorSignature ||
                  !familySignature
                ) {
                  throw new WalletExceptionFilter(
                    403,
                    'Could not match one of signers!',
                  );
                }

                console.log(
                  '\x1b[36m%s\x1b[0m',
                  'Creating Purchaser Signature ...',
                );
                const purchaserSignature =
                  await this.walletService.createSignature(
                    signature,
                    need.flaskId,
                    SAYPlatformRoles.PURCHASER,
                    sessionFlaskUserId,
                    body.verifyVoucherAddress,
                  );

                const purchaserDetails = {
                  firstName: need.purchaser.firstName,
                  lastName: need.purchaser.lastName,
                  avatarUrl: need.purchaser.avatarUrl,
                  flaskUserId: need.purchaser.contributions.find(
                    (c) => c.flaskUserId == need.purchaser.flaskUserId,
                  ).flaskUserId,
                  birthDate:
                    need.purchaser.birthDate &&
                    new Date(need.purchaser.birthDate),
                  panelRole: need.purchaser.contributions.find(
                    (c) => c.flaskUserId == need.purchaser.flaskUserId,
                  ).panelRole,
                  need,
                  userName: need.purchaser.userName,
                };
                await this.userService.updateContributor(
                  need.purchaser.id,
                  purchaserDetails,
                );
                return { signature: purchaserSignature };
              } else if (purchaserSignature) {
                throw new WalletExceptionFilter(
                  403,
                  'Purchaser has already signed!',
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
              403,
              'could not find initial signature !',
            );
          }
        }
      } else {
        throw new WalletExceptionFilter(403, 'Bad request!');
      }
    } catch (e) {
      const theSignature = await this.walletService.getSignature(signature);
      if (theSignature) {
        await this.walletService.deleteOne(theSignature);
      }
      throw new WalletExceptionFilter(e.status, e.message);
    }
  }

  @Get(`signature/:signature`)
  @ApiOperation({ description: 'Get a signature' })
  async getSignature(
    @Session() session: Record<string, any>,
    @Param('signature') signature: string,
  ) {
    if (!session.siwe) {
      throw new WalletExceptionFilter(401, 'You have to first sign_in');
    }
    return await this.walletService.getSignature(signature);
  }

  @Get(`all/signatures`)
  @ApiOperation({ description: 'Get all signatures' })
  async getSignatures(@Req() req: Request) {
    const flaskPanelUserId = Number(req.headers['panelFlaskUserId']);
    const flaskPanelTypeId = Number(req.headers['panelFlaskTypeId']);

    if (
      (flaskPanelTypeId !== FlaskUserTypesEnum.ADMIN &&
        flaskPanelTypeId !== FlaskUserTypesEnum.SUPER_ADMIN) ||
      !flaskPanelUserId
    ) {
      throw new WalletExceptionFilter(401, 'You are not the admin');
    }

    return await this.walletService.getSignatures();
  }

  @Get(`signatures/:flaskUserId`)
  @ApiOperation({ description: 'Get contributors signatures' })
  async getContributorSignatures(
    @Req() req: Request,
    @Param('flaskUserId') flaskUserId: number,
  ) {
    const panelUserId = Number(req.headers['panelFlaskUserId']);
    if (panelUserId !== Number(flaskUserId)) {
      throw new WalletExceptionFilter(401, 'You only can get your signatures');
    }
    return await this.walletService.getUserSignatures(panelUserId);
  }

  @Delete(`signature/:signature`)
  @ApiOperation({ description: 'Delete a signatures' })
  async deleteSignature(
    @Session() session: Record<string, any>,
    @Param('signature') signature: string,
  ) {
    if (!session.siwe) {
      throw new WalletExceptionFilter(401, 'You have to first sign_in');
    }
    if (
      session.siwe.flaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN &&
      session.siwe.flaskUserId !== SUPER_ADMIN
    ) {
      throw new WalletExceptionFilter(401, 'You Are not the Super admin');
    }
    const theSignature = await this.walletService.getSignature(signature);
    return await this.walletService.deleteOne(theSignature.id);
  }

  @Post(`signature/verify`)
  @UsePipes(new ValidationPipe()) // validation for dto files
  async verifySignature(
    @Body(ValidateSignaturePipe) body: VerifySignatureDto,
    @Session() session: Record<string, any>,
  ) {
    if (body.chainId !== eEthereumNetworkChainId.mainnet) {
      throw new ServerError('Please connect to Mainnet!', 500);
    }
    if (!session.siwe) {
      throw new WalletExceptionFilter(401, 'You have to first sign_in');
    }

    let transaction: SwSignatureResult;
    try {
      const need = await this.needService.getNeedByFlaskId(body.flaskNeedId);

      console.log('\x1b[36m%s\x1b[0m', 'Preparing signature data ...\n');

      transaction = await this.walletService.prepareSignature(
        session.siwe.address,
        need,
        need.child,
        need.socialWorker.flaskUserId,
      );
      return transaction;
    } catch (e) {
      throw new ServerError(e);
    }
  }
}
