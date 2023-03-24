import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  Session,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwSignatureResult } from '../../types/interfaces/interface';
import { CreateSignatureDto, SwGenerateSignatureDto, VerifyWalletDto } from '../../types/dtos/CreateSignature.dto';
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


@ApiTags('Wallet')
@Controller('wallet')
export class SignatureController {
  constructor(
    private signatureService: SignatureService,
    private syncService: SyncService,
    private ipfsService: IpfsService,
    private userService: UserService,
  ) { }

  @Get(`nonce`)
  @ApiOperation({ description: 'Get Siwe nonce' })
  async getNonce(@Res() res, @Session() session: Record<string, any>) {
    if (!session.nonce) {
      session.nonce = generateNonce();
      session.save();
    }
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', true);

    res
      .status(200)
      .send({ nonce: session.nonce, expiry: session.cookie._expires });
  }

  @Post(`verify/:flaskUserId`)
  @ApiOperation({ description: 'Verify a signature' })
  async verifySiwe(
    @Req() req: Request,
    @Param('flaskUserId') flaskUserId: number,
    @Session() session,
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
      console.log(session)

      if (fields.nonce !== session.nonce) {
        throw new WalletExceptionFilter(422, `Invalid nonce.`);
      }
      session.siwe = fields;
      console.log(body)
      // session.cookie._expires = new Date(fields.expirationTime);
      session.save();

      let nestContributor = await this.userService.getContributorByFlaskId(flaskUserId);
      console.log(fields)

      if (!nestContributor) {
        const flaskCaller = await this.userService.getFlaskSocialWorker(
          flaskUserId,
        );
        console.log('\x1b[36m%s\x1b[0m', 'Syncing NGO and Caller ...\n' + flaskCaller.id);
        const CallerNgo = await this.syncService.syncContributorNgo(flaskCaller)
        console.log('\x1b[36m%s\x1b[0m', 'Synced NGO and Caller ...\n' + flaskCaller.id);

        const {
          id: callerFlaskId,
          ngo_id: callerFlaskNgoId,
          ...callerOtherParams
        } = flaskCaller;

        const callerDetails = {
          ...callerOtherParams,
          typeId: flaskCaller.type_id,
          firstName: flaskCaller.first_name,
          lastName: flaskCaller.last_name,
          avatarUrl: flaskCaller.avatar_url,
          flaskId: callerFlaskId,
          flaskNgoId: callerFlaskNgoId,
          birthDate: flaskCaller.birth_date && new Date(flaskCaller.birth_date),
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
        await this.userService.createUserWallet(body.message.address, body.message.chainId, nestContributor)
      }
      return session.nonce;

    } catch (e) {
      session.siwe = null;
      session.nonce = null;
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
          console.error("e");
          console.error(e);
          console.error("e");
          throw new WalletExceptionFilter(e.status, e.message);
        }
      }
    }
  }

  @Get(`personal_information`)
  @ApiOperation({ description: 'Get all signatures' })
  async getPersonalInformation(@Session() session: Record<string, any>) {
    if (!session.siwe) {
      throw new WalletExceptionFilter(401, 'You have to first sign_in');
    }
    return session.siwe;
  }

  @Get(`all`)
  @ApiOperation({ description: 'Get all signatures' })
  async getTransaction() {
    return await this.signatureService.getSignatures();
  }

  @UseInterceptors(WalletInterceptor)
  @Post(`sw/generate`)
  @UsePipes(new ValidationPipe()) // validation for dto files
  async swSignTransaction(
    @Req() req: Request,
    @Body(ValidateSignaturePipe) body: SwGenerateSignatureDto,
  ) {
    let transaction: SwSignatureResult;
    try {
      const { need, child } = await this.syncService.syncNeed(
        body.flaskUserId,
        body.panelData,
        body.childId,
        ['AUDITOR', 'SOCIAL_WORKER', 'PURCHASER', 'NGO_SUPERVISOR', 'FAMILY'],
      );
      console.log('\x1b[36m%s\x1b[0m', 'Preparing signature data ...\n');

      transaction = await this.signatureService.swSignTransaction(
        body.signerAddress,
        need,
        child,
        body.userTypeId
      );
      console.log('\x1b[36m%s\x1b[0m', 'Uploading to IPFS ...');
      const ipfs = await this.ipfsService.storeImagesIpfs(need.id)
      return { transaction, ipfs };

    } catch (e) {
      console.log(e)
      throw new AllExceptionsFilter(e);
    }
  }


  @Post(`create/:signature`)
  @ApiOperation({ description: 'Get all signatures' })
  async createSignature(
    @Param('signature') signature: string,
    @Body(ValidateSignaturePipe) body: CreateSignatureDto,
  ) {
    return await this.signatureService.createSignature(signature, body.flaskNeedId, body.role, body.signerAddress, body.flaskUserId);
  }

  @Get(`signature/:signature`)
  @ApiOperation({ description: 'Get all signatures' })
  async getSignature(
    @Param('signature') signature: string,

  ) {
    return await this.signatureService.getSignature(signature);
  }


}

