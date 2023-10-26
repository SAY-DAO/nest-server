import {
  Controller,
  ForbiddenException,
  Get,
  Body,
  Param,
  Req,
  Post,
  UsePipes,
  ValidationPipe,
  Patch,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ChildrenService } from './children.service';
import {
  FlaskUserTypesEnum,
  ChildExistence,
  ChildConfirmation,
} from 'src/types/interfaces/interface';
import { isAuthenticated } from 'src/utils/auth';
import config from 'src/config';
import { UserService } from '../user/user.service';
import { CreatePreRegisterChildDto } from 'src/types/dtos/CreateChild.dto';
import { ValidateChildTsPipe } from './pipes/validate-child.ts/validate-child.ts.pipe';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { avatarStorage } from 'src/storage/avatarStorage';
import { ServerError } from 'src/filters/server-exception.filter';

@ApiTags('Children')
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskId',
  description: 'to use cache and flask authentication',
  required: true,
})
@Controller('children')
export class ChildrenController {
  constructor(
    private childrenService: ChildrenService,
    private userService: UserService,
  ) {}

  @Delete(`preregister/:id`)
  @ApiOperation({ description: 'Delete a pre register' })
  async deleteContribution(@Req() req: Request, @Param('id') id: string) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }

    try {
      const preRegister = await this.childrenService.getChildPreRegisterById(
        id,
      );

      await this.childrenService.deletePreRegister(preRegister.id);
    } catch (e) {
      throw new ServerError(e);
    }
  }

  @Patch(`preregister`)
  @ApiOperation({ description: 'Get all children from db' })
  @UsePipes(new ValidationPipe())
  async preRegisterUpdate(
    @Req() req: Request,
    @Body(ValidateChildTsPipe) body: CreatePreRegisterChildDto,
  ) {
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
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }

    return await this.childrenService.updatePreRegisterChild(body.id, {
      phoneNumber: body.phoneNumber,
      country: body.country,
      city: body.city,
      bioTranslations: body.bio_translations,
      voiceUrl: body.voiceUrl,
      birthPlace: body.birthPlaceId,
      birthDate: body.birthDate,
      housingStatus: body.housingStatus,
      familyCount: body.familyCount,
      education: body.education,
      flaskNgoId: body.ngoId,
      flaskSwId: body.swId,
      lastName: body.lastName_translations,
      firstName: body.firstName_translations,
      state: body.state,
      sex: body.sex,
      address: body.address,
    });
  }

  @Post(`preregister`)
  @ApiOperation({ description: 'Get all children from db' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'awakeFile', maxCount: 1 },
        { name: 'sleptFile', maxCount: 1 },
      ],
      avatarStorage,
    ),
  )
  @UsePipes(new ValidationPipe())
  async preRegisterAdd(
    @Req() req: Request,
    @UploadedFiles()
    files: {
      awakeFile?: Express.Multer.File[];
      sleptFile?: Express.Multer.File[];
    },
    @Body()
    body: {
      awakeFile: string;
      sleptFile: string;
      sayNameFa: string;
      sayNameEn: string;
    },
  ) {
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
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }

    if (!files) {
      throw new BadRequestException(400, 'No files were uploaded!');
    }
    console.log(body.sayNameFa);

    return await this.childrenService.createPreRegisterChild(
      files.awakeFile[0].filename,
      files.sleptFile[0].filename,
      { fa: body.sayNameFa, en: body.sayNameFa },
    );
  }

  @Get(`preregister/all`)
  @ApiOperation({ description: 'Get all children from db' })
  async getChildrenPreRegister(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
    return await this.childrenService.getChildrenPreRegister();
  }

  @Get(`all`)
  @ApiOperation({ description: 'Get all children from db' })
  async getChildren(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN ||
      panelFlaskTypeId !== FlaskUserTypesEnum.ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
    return await this.childrenService.getChildren();
  }

  @Get(`all/actives`)
  @ApiOperation({ description: 'Get all active children from flask db' })
  async getActiveChildren(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN ||
      panelFlaskTypeId !== FlaskUserTypesEnum.ADMIN
    ) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
    return await this.childrenService.getFlaskActiveChildren();
  }

  @Get(`check/names/:newName/:lang`)
  @ApiOperation({ description: 'Check similar names' })
  async checkChildrenNames(
    @Param('newName') newName: string,
    @Param('lang') lang: 'FA' | 'EN',
    @Req() req: Request,
  ) {
    // const panelFlaskUserId = req.headers['panelFlaskUserId'];
    // const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    // if (
    //   !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
    //   panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN ||
    //   panelFlaskTypeId !== FlaskUserTypesEnum.ADMIN
    // ) {
    //   throw new ForbiddenException(403, 'You Are not the Super admin');
    // }
    const names = (await this.childrenService.getFlaskChildrenNames()).map(
      (r) => r.sayname_translations,
    );

    return names.filter((n) =>
      lang === 'EN'
        ? n.en.toUpperCase() === newName.toUpperCase()
        : n.fa === newName,
    ).length;
  }

  @Post(`flask/all`)
  @ApiOperation({ description: 'Get all flask children from db' })
  async getFlaskChildren(
    @Req() req: Request,
    @Body()
    body: { statuses: ChildExistence[]; isConfirmed: ChildConfirmation },
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];

    const X_LIMIT = parseInt(req.headers['x-limit']);
    const X_TAKE = parseInt(req.headers['x-take']);
    const limit = X_LIMIT > 100 ? 100 : X_LIMIT;
    const page = X_TAKE + 1;

    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }

    if (
      panelFlaskTypeId === FlaskUserTypesEnum.SUPER_ADMIN ||
      panelFlaskTypeId === FlaskUserTypesEnum.ADMIN
    ) {
      const socialWorkerIds = await this.userService
        .getFlaskSwIds()
        .then((r) => r.map((s) => s.id));

      return await this.childrenService.getFlaskChildren(
        {
          page: page,
          limit: limit,
          path: '/',
        },
        body,
        socialWorkerIds,
      );
    } else if (panelFlaskTypeId === FlaskUserTypesEnum.NGO_SUPERVISOR) {
      const user = await this.userService.getFlaskSw(panelFlaskUserId);

      const socialWorkerIds = await this.userService
        .getFlaskSocialWorkersByNgo(user.ngo_id)
        .then((r) => r.map((s) => s.id));

      return await this.childrenService.getFlaskChildren(
        {
          page: page,
          limit: limit,
          path: '/',
        },
        body,
        socialWorkerIds,
      );
    } else {
      const socialWorkerIds = [panelFlaskUserId];
      return await this.childrenService.getFlaskChildren(
        {
          page: page,
          limit: limit,
          path: '/',
        },
        body,
        socialWorkerIds,
      );
    }
  }

  @Get(`flask/child/needs-summary/:childId`)
  @ApiOperation({ description: 'Get a single child needs summary by ID' })
  async getChildNeedsSummary(
    @Req() req: Request,
    @Param('childId') childId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(403, 'You Are not authorized');
    }
    const token =
      config().dataCache.fetchPanelAuthentication(panelFlaskUserId).token;
    return await this.childrenService.getChildNeedsSummery(token, childId);
  }

  @Get('/network')
  getAvailableContributions(@Req() req: Request) {
    const dappFlaskUserId = req.headers['dappFlaskUserId'];
    if (!isAuthenticated(dappFlaskUserId, FlaskUserTypesEnum.FAMILY)) {
      throw new ForbiddenException(403, 'You Are not authorized');
    }
    return this.childrenService.gtTheNetwork();
  }
}
