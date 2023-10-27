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
  Res,
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
import { voiceStorage } from 'src/storage/voiceStorage';
import { ChildrenInterceptor } from './interceptors/children.interceptors';
import { LocationService } from '../location/location.service';

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
    private locationService: LocationService,
  ) {}

  @Delete(`preregister/:id`)
  @ApiOperation({ description: 'Delete a pre register' })
  async deleteContribution(@Req() req: Request, @Param('id') id: string) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      !(
        panelFlaskTypeId === FlaskUserTypesEnum.SUPER_ADMIN ||
        panelFlaskTypeId === FlaskUserTypesEnum.ADMIN
      )
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
    body: { sayNameFa: string; sayNameEn: string },
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
      throw new ServerError('No files were uploaded!');
    }

    return await this.childrenService.createPreRegisterChild(
      files.awakeFile[0].filename,
      files.sleptFile[0].filename,
      { fa: body.sayNameFa, en: body.sayNameEn },
    );
  }

  @Patch(`preregister`)
  @ApiOperation({
    description: 'NGO / SW add a child by updating pre register',
  })
  @UsePipes(new ValidationPipe())
  @UseInterceptors(FileInterceptor('voiceFile', voiceStorage))
  async preRegisterUpdate(
    @Req() req: Request,
    @UploadedFile() voiceFile,
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
    if (!voiceFile) {
      throw new ServerError('No file was uploaded!');
    }
    try {
      const allPreRegisters = await this.childrenService.getChildrenPreRegister(
        true,
      );

      let location = await this.locationService.getCityById(body.city);
      console.log('\x1b[36m%s\x1b[0m', 'Creating a city ...');
      if (!location) {
        const flaskCity = await this.locationService.getFlaskCity(body.city);
        const {
          id: flaskId,
          name,
          state_id,
          state_code,
          state_name,
          country_id,
          country_code,
          country_name,
          latitude,
          longitude,
        } = flaskCity;

        location = await this.locationService.createLocation({
          flaskCityId: flaskId,
          name: name,
          stateId: state_id,
          stateCode: state_code,
          stateName: state_name,
          countryId: country_id,
          countryCode: country_code,
          countryName: country_name,
          latitude,
          longitude,
        });
        console.log('\x1b[36m%s\x1b[0m', 'Created a city ...');
      }
      return await this.childrenService.updatePreRegisterChild(
        allPreRegisters[0].id,
        {
          phoneNumber: body.phoneNumber,
          country: Number(body.country),
          city: Number(body.city),
          bio: body.bio,
          voiceUrl: voiceFile.filename,
          birthPlace: Number(body.birthPlaceId),
          birthDate: new Date(body.birthDate),
          housingStatus: Number(body.housingStatus),
          familyCount: Number(body.familyCount),
          education: Number(body.education),
          flaskNgoId: Number(body.ngoId),
          flaskSwId: Number(body.swId),
          lastName: { fa: body.lastName, en: '' },
          firstName: { fa: body.firstName, en: '' },
          state: Number(body.state),
          sex: Number(body.sex),
          address: body.address,
        },
        location,
      );
    } catch (e) {
      throw new ServerError(e);
    }
  }

  @UseInterceptors(ChildrenInterceptor)
  @Get(`preregister/all/:isApproved`)
  @ApiOperation({ description: 'Get all children from db' })
  async getChildrenPreRegister(
    @Param('isApproved') isApproved: boolean,
    @Req() req: Request,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(403, 'You Are not the Super admin');
    }
    return await this.childrenService.getChildrenPreRegister(isApproved);
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

  @UseInterceptors(ChildrenInterceptor)
  @Post(`flask/all`)
  @ApiOperation({ description: 'Get all flask children from db' })
  async getFlaskChildren(
    @Req() req: Request,
    @Body()
    body: {
      isMigrated: boolean;
      statuses: ChildExistence[];
      isConfirmed: ChildConfirmation;
    },
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

  @Get('images/:fileName')
  async serveAvatar(
    @Param('fileName') fileName: string,
    @Res() res: any,
  ): Promise<any> {
    res.sendFile(fileName, { root: './uploads/children/avatars' });
  }

  @Get('voices/:fileName')
  async serveVoice(
    @Param('fileName') fileName: string,
    @Res() res: any,
  ): Promise<any> {
    res.sendFile(fileName, { root: './uploads/children/voices' });
  }
}
