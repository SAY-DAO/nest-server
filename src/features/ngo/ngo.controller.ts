import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  FlaskUserTypesEnum,
  PreRegisterStatusEnum,
  SAYPlatformRoles,
} from '../../types/interfaces/interface';
import {
  capitalizeFirstLetter,
  convertFlaskToSayRoles,
} from '../../utils/helpers';
import { SyncService } from '../sync/sync.service';
import { UserService } from '../user/user.service';

import { NgoService } from './ngo.service';
import { isAuthenticated } from '../../utils/auth';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ngoPreregisterStorage } from 'src/storage/NgoStorage';
import { PreparePreRegisterNgoDto } from 'src/types/dtos/CreateNgo.dto';
import { ServerError } from 'src/filters/server-exception.filter';
import { checkIfDirectoryExists, moveFile } from 'src/utils/file';
import { ngoInterceptor } from './interceptors/ngo.interceptors';

@ApiTags('Ngo')
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskId',
  description: 'to use cache and flask authentication',
  required: true,
})
@Controller('ngo')
export class NgoController {
  constructor(
    private ngoService: NgoService,
    private userService: UserService,
    private syncService: SyncService,
  ) { }

  @Get(`all`)
  @ApiOperation({ description: 'Get all ngos' })
  async getNgos(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    return await this.ngoService.getNgos();
  }

  @Get(`socialworkers/:flaskNgoId`)
  @ApiOperation({ description: 'Get all ngos' })
  async getNgoSws(
    @Param('flaskNgoId') flaskNgoId: number,
    @Req() req: Request,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    return await this.ngoService.getFlaskNGOSws(
      Number(flaskNgoId),
      Number(panelFlaskUserId),
      Number(panelFlaskTypeId),
    );
  }

  @Get(`arrivals/:swId`)
  async getNgoArrivals(@Req() req: Request, @Param('swId') swId: number) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException('You Are not authorized');
    }
    let socialWorkerId: number;
    let swIds: number[];
    const socialWorker = await this.userService.getFlaskSocialWorker(swId);
    const roleId = convertFlaskToSayRoles(socialWorker.type_id);
    if (roleId === SAYPlatformRoles.SOCIAL_WORKER) {
      socialWorkerId = swId;
    }
    if (roleId === SAYPlatformRoles.AUDITOR) {
      socialWorkerId = null;
      swIds = await this.userService
        .getFlaskSwIds()
        .then((r) => r.map((s) => s.id));
    }
    if (roleId === SAYPlatformRoles.PURCHASER) {
      socialWorkerId = null;
      swIds = await this.userService
        .getFlaskSwIds()
        .then((r) => r.map((s) => s.id));
    }
    if (roleId === SAYPlatformRoles.NGO_SUPERVISOR) {
      socialWorkerId = null;
      swIds = await this.userService
        .getFlaskSocialWorkersByNgo(socialWorker.ngo_id)
        .then((r) => r.map((s) => s.id));
    }
    return await this.ngoService.getNgoArrivals(socialWorkerId, swIds);
  }

  @Patch(`arrivals/update/:flaskUserId/:deliveryCode/:arrivalCode`)
  async updateNgoArrivals(
    @Req() req: Request,
    @Param('flaskUserId') flaskUserId: number,
    @Param('deliveryCode') deliveryCode: string,
    @Param('arrivalCode') arrivalCode: string,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    const flaskSocialWorker = await this.userService.getFlaskSocialWorker(
      flaskUserId,
    );
    const ngo = await this.syncService.syncContributorNgo(flaskSocialWorker);

    return await this.ngoService.updateNgoArrivals(
      ngo,
      deliveryCode,
      arrivalCode,
    );
  }

  @Get(`preregister/:id`)
  @ApiOperation({ description: 'Get NGO preregister' })
  async getNgoPreregister(@Req() req: Request, @Param('id') id: string) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      !(
        panelFlaskTypeId === FlaskUserTypesEnum.SOCIAL_WORKER ||
        panelFlaskTypeId === FlaskUserTypesEnum.NGO_SUPERVISOR ||
        panelFlaskTypeId === FlaskUserTypesEnum.SUPER_ADMIN ||
        panelFlaskTypeId === FlaskUserTypesEnum.ADMIN
      )
    ) {
      throw new ForbiddenException('You Are not the Authorized!');
    }

    return await this.ngoService.getNgoPreRegisterById(id);
  }

  @Post(`preregister`)
  @ApiOperation({ description: 'Create Ngo pre register' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'logoFile', maxCount: 1 },
        { name: 'docFile', maxCount: 1 },
        { name: 'idCardFile', maxCount: 1 },
      ],
      ngoPreregisterStorage,
    ),
  )
  @UsePipes(new ValidationPipe())
  async preRegisterCreate(
    @Req() req: Request,
    @UploadedFiles()
    files: {
      logoFile?: Express.Multer.File[];
      docFile?: Express.Multer.File[];
      idCardFile?: Express.Multer.File[];
    },
    @Body()
    body: PreparePreRegisterNgoDto,
  ) {
    if (!files || !files.docFile || !files.idCardFile) {
      throw new BadRequestException('No files were uploaded!');
    }
    return await this.ngoService.createPreRegisterNgo({
      ...body,
      logoUrl: files.logoFile && files.logoFile[0].filename,
      docUrl: files.docFile && files.docFile[0].filename,
      idCardUrl: files.idCardFile && files.idCardFile[0].filename,
    });
  }

  @UseInterceptors(ngoInterceptor)
  @Get(`preregisters`)
  @ApiOperation({ description: 'Get all Ngos preregisters from db' })
  async getNgosPreRegister(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];

    const X_LIMIT = parseInt(req.headers['x-limit']);
    const X_TAKE = parseInt(req.headers['x-take']);
    const limit = X_LIMIT > 100 ? 100 : X_LIMIT;
    const page = X_TAKE + 1;
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      !(
        panelFlaskTypeId === FlaskUserTypesEnum.SUPER_ADMIN ||
        panelFlaskTypeId === FlaskUserTypesEnum.ADMIN
      )
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }

    return await this.ngoService.getNgosPreRegister({
      page: page,
      limit: limit,
      path: '/',
    });
  }
}
