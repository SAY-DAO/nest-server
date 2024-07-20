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
  SexEnum,
  PanelContributors,
  PreRegisterStatusEnum,
  SchoolTypeEnum,
  SAYPlatformRoles,
} from 'src/types/interfaces/interface';
import { isAuthenticated } from 'src/utils/auth';
import config from 'src/config';
import { UserService } from '../user/user.service';
import {
  CreateFlaskChildDto,
  PreparePreRegisterChildDto,
  UpdateApprovedPreRegisterDto,
  UpdatePreRegisterChildDto,
} from 'src/types/dtos/CreateChild.dto';
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
import { DownloadService } from '../download/download.service';
import { NgoService } from '../ngo/ngo.service';
import { randomUUID } from 'crypto';
import { NgoEntity } from 'src/entities/ngo.entity';
import { SyncService } from '../sync/sync.service';
import { LocationEntity } from 'src/entities/location.entity';
import { NgoParams } from 'src/types/parameters/NgoParammeters';
import {
  capitalizeFirstLetter,
  convertFlaskToSayAppRoles,
  convertFlaskToSayPanelRoles,
  convertFlaskToSayRoles,
  formatDate,
  truncateString,
} from 'src/utils/helpers';
import axios from 'axios';
import { AllUserEntity } from 'src/entities/user.entity';
import { checkIfFileOrDirectoryExists, moveFile } from 'src/utils/file';
import fs from 'fs';
import { CampaignService } from '../campaign/campaign.service';
import { File } from '@web-std/file';
import { ChildrenPreRegisterEntity } from 'src/entities/childrenPreRegister.entity';
import { ObjectNotFound } from 'src/filters/notFound-expectation.filter';

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
    private syncService: SyncService,
    private userService: UserService,
    private ngoService: NgoService,
    private locationService: LocationService,
    private downloadService: DownloadService,
    private campaignService: CampaignService,
  ) {}
  @Get(`preregister/:childFlaskId`)
  @ApiOperation({ description: 'Get child preregister' })
  async getChildPreregister(
    @Req() req: Request,
    @Param('childFlaskId') childFlaskId: number,
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
      throw new ForbiddenException('You Are not the Authorized!');
    }

    return await this.childrenService.getChildrenPreRegisterByFlaskId(
      childFlaskId,
    );
  }

  @UsePipes(new ValidationPipe()) // validation for dto files
  @Patch(`preregister/approve/:id`)
  @ApiOperation({ description: 'Approve a pre register' })
  @UseInterceptors(FileInterceptor('voiceFile', voiceStorage))
  async approvePreregister(
    @Req() req: Request,
    @UploadedFile() voiceFile: Express.Multer.File,
    @Param('id') id: string,
    @Body(ValidateChildTsPipe) body: CreateFlaskChildDto,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      !(
        panelFlaskTypeId === FlaskUserTypesEnum.SUPER_ADMIN ||
        panelFlaskTypeId === FlaskUserTypesEnum.ADMIN
      )
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }

    try {
      const preRegister = await this.childrenService.getChildPreRegisterById(
        id,
      );
      if (
        preRegister.status === PreRegisterStatusEnum.CONFIRMED ||
        preRegister.status === PreRegisterStatusEnum.NOT_REGISTERED
      ) {
        throw new ServerError('Pre register approval could not go ahead!');
      }
      if (!voiceFile) {
        throw new ServerError('we need the Edited Voice!');
      }
      const token =
        config().dataCache.fetchPanelAuthentication(panelFlaskUserId).token;
      const awakeFile = await this.downloadService.fileFromPath(
        process.env.NODE_ENV === 'development'
          ? `http://localhost:8002/api/dao/children/avatars/images/${preRegister.awakeUrl}`
          : `https://nest.saydao.org/api/dao/children/avatars/images/${preRegister.awakeUrl}`,
        `${preRegister.awakeUrl}`,
      );
      const sleptFile = await this.downloadService.fileFromPath(
        process.env.NODE_ENV === 'development'
          ? `http://localhost:8002/api/dao/children/avatars/images/${preRegister.sleptUrl}`
          : `https://nest.saydao.org/api/dao/children/avatars/images/${preRegister.sleptUrl}`,
        `${preRegister.sleptUrl}`,
      );

      const fileBuffer = await fs.promises.readFile(
        `uploads/children/voices/${voiceFile.filename}`,
      );

      const file = new File([fileBuffer], `${voiceFile.filename}`, {
        type: voiceFile.mimetype,
      });

      const formData = new FormData();
      formData.append('ngo_id', String(preRegister.flaskNgoId));
      formData.append('sw_id', String(preRegister.flaskSwId));
      formData.append('awakeAvatarUrl', awakeFile);
      formData.append('sleptAvatarUrl', sleptFile);
      formData.append('voiceUrl', file);
      formData.append(
        'gender',
        String(preRegister.sex === SexEnum.MALE ? true : false),
      );
      formData.append('city', String(preRegister.city));
      formData.append('country', String(preRegister.country));
      formData.append('phoneNumber', preRegister.phoneNumber);
      formData.append('birthDate', formatDate(preRegister.birthDate)); //'2015-05-20'
      formData.append(
        'sayname_translations',
        JSON.stringify({
          fa: preRegister.sayName.fa,
          en: preRegister.sayName.en,
        }),
      );
      formData.append(
        'bio_translations',
        JSON.stringify({
          fa: preRegister.bio.fa,
          en: body.bioEn,
        }),
      );
      formData.append(
        'bio_summary_translations',
        JSON.stringify({
          fa: truncateString(preRegister.bio.fa, 120),
          en: truncateString(body.bioEn, 120),
        }),
      );
      formData.append(
        'firstName_translations',
        JSON.stringify({
          fa: preRegister.firstName.fa,
          en: body.firstNameEn,
        }),
      );
      formData.append(
        'lastName_translations',
        JSON.stringify({
          fa: preRegister.lastName.fa,
          en: body.lastNameEn,
        }),
      );
      formData.append('nationality', String(preRegister.birthPlaceId));
      formData.append('birthPlace', String(preRegister.birthPlaceId));
      formData.append('familyCount', String(preRegister.familyCount));
      formData.append('education', String(preRegister.educationLevel));
      formData.append('housingStatus', String(preRegister.housingStatus));
      formData.append('address', preRegister.address);

      const configs = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token,
          processData: false,
          contentType: false,
        },
      };

      // create flask child
      const { data } = await axios.post(
        'https://api.sayapp.company/api/v2/child/add/',
        formData,
        configs,
      );

      // approve / confirm child Pre register
      const approvedPre = await this.childrenService.approvePreregister(
        preRegister,
        body.firstNameEn,
        body.lastNameEn,
        body.bioEn,
        data.id,
        voiceFile.filename,
      );

      // clean up downloaded files
      fs.unlinkSync(`${preRegister.awakeUrl}`);
      fs.unlinkSync(`${preRegister.sleptUrl}`);

      const configs2 = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      };
      // confirm child
      await axios.patch(
        `https://api.sayapp.company/api/v2/child/confirm/childId=${data.id}`,
        {},
        configs2,
      );

      // send email
      await this.campaignService.sendSwChildConfirmation(
        preRegister.flaskSwId,
        preRegister,
      );

      return {
        added: data,
        approvedPre: approvedPre,
      };
    } catch (e) {
      throw new ServerError('Flask reverted!');
    }
  }

  @Delete(`preregister/:id`)
  @ApiOperation({ description: 'Delete a pre register' })
  async deletePreRegister(@Req() req: Request, @Param('id') id: string) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      !(
        panelFlaskTypeId === FlaskUserTypesEnum.SUPER_ADMIN ||
        panelFlaskTypeId === FlaskUserTypesEnum.ADMIN
      )
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }

    try {
      const preRegister = await this.childrenService.getChildPreRegisterById(
        id,
      );

      if (preRegister.status === PreRegisterStatusEnum.CONFIRMED) {
        throw new ForbiddenException('This Child has been confirmed');
      }
      await this.childrenService.deletePreRegister(preRegister.id);
    } catch (e) {
      throw new ServerError(e.message, e.status);
    }
  }

  @Post(`preregister`)
  @ApiOperation({ description: 'Create children pre register' })
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
    body: { sex: SexEnum; sayNameFa: string; sayNameEn: string },
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
      throw new ForbiddenException('You Are not the Authorized!');
    }

    if (!files) {
      throw new ServerError('No files were uploaded!');
    }

    // for local purposes - organized folders and files
    if (process.env.NODE_ENV === 'development') {
      const newChildFolder = `../../Docs/children${
        Number(body.sex) === SexEnum.MALE ? '/boys/' : '/girls/'
      }organized/${capitalizeFirstLetter(body.sayNameEn)}-${body.sayNameFa}`;

      const originalAwakeGirl = `../../Docs/children/girls/${
        files.awakeFile[0].filename.split('-s-')[0]
      }.png`;
      const originalAwakeBoy = `../../Docs/children/boys/${
        files.awakeFile[0].filename.split('-s-')[0]
      }.png`;
      const originalSleptGirl = `../../Docs/children/girls/${
        files.sleptFile[0].filename.split('-s-')[0]
      }.png`;
      const originalSleptBoy = `../../Docs/children/boys/${
        files.sleptFile[0].filename.split('-s-')[0]
      }.png`;

      const newAwakeName = `awake-${body.sayNameEn.toLowerCase()}.png`;
      const newSleepName = `sleep-${body.sayNameEn.toLowerCase()}.png`;

      if (
        checkIfFileOrDirectoryExists(originalAwakeGirl) ||
        checkIfFileOrDirectoryExists(originalAwakeBoy)
      ) {
        if (!checkIfFileOrDirectoryExists(newChildFolder)) {
          fs.mkdirSync(newChildFolder);
        }
        if (Number(body.sex) === SexEnum.MALE) {
          moveFile(originalAwakeBoy, `${newChildFolder}/${newAwakeName}`);
          moveFile(originalSleptBoy, `${newChildFolder}/${newSleepName}`);
        }
        if (Number(body.sex) === SexEnum.FEMALE) {
          moveFile(originalAwakeGirl, `${newChildFolder}/${newAwakeName}`);
          moveFile(originalSleptGirl, `${newChildFolder}/${newSleepName}`);
        }
      } else {
        throw new ServerError('could not find the file');
      }
    }
    return await this.childrenService.createPreRegisterChild(
      files.awakeFile[0].filename,
      files.sleptFile[0].filename,
      { fa: body.sayNameFa, en: body.sayNameEn },
      body.sex,
    );
  }

  @ApiOperation({
    description: 'NGO / SW add a child by updating pre register',
  })
  @Patch(`preregister/prepare`)
  @UsePipes(new ValidationPipe())
  @UseInterceptors(FileInterceptor('voiceFile', voiceStorage))
  async preRegisterPrepare(
    @Req() req: Request,
    @UploadedFile() voiceFile,
    @Body(ValidateChildTsPipe) body: PreparePreRegisterChildDto,
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
      throw new ForbiddenException('You Are not the Super admin');
    }
    if (!voiceFile) {
      throw new ServerError('No file was uploaded!');
    }
    try {
      const allPreRegisters =
        await this.childrenService.getChildrenPreRegisterSimple(
          PreRegisterStatusEnum.NOT_REGISTERED,
        );

      const candidate = allPreRegisters.find(
        (p) => !p.voiceUrl && p.sex === Number(body.sex),
      );
      if (!candidate) {
        throw new ServerError('We need more avatars');
      }

      let location = await this.locationService.getCityById(body.city);
      const birthPlace = await this.locationService.getCityByCountryId(
        Number(body.birthPlaceId),
      );

      if (!location) {
        console.log('\x1b[36m%s\x1b[0m', 'Creating a Location ...');
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
        console.log('\x1b[36m%s\x1b[0m', 'Created a Location ...');
      }
      const ngo = await this.ngoService.getNgoById(Number(body.ngoId));

      let nestSocialWorker: AllUserEntity;
      let swNgo: NgoEntity;

      nestSocialWorker = await this.userService.getContributorByFlaskId(
        Number(body.swId),
        PanelContributors.SOCIAL_WORKER,
      );

      if (!nestSocialWorker) {
        const flaskSocialWorker = await this.userService.getFlaskSocialWorker(
          body.swId,
        );

        const swDetails = {
          typeId: flaskSocialWorker.type_id,
          firstName: flaskSocialWorker.firstName,
          lastName: flaskSocialWorker.lastName,
          avatarUrl: flaskSocialWorker.avatar_url,
          flaskUserId: flaskSocialWorker.id,
          birthDate:
            flaskSocialWorker.birth_date &&
            new Date(flaskSocialWorker.birth_date),
          panelRole: PanelContributors.SOCIAL_WORKER,
          userName: flaskSocialWorker.userName,
        };

        swNgo = await this.syncService.syncContributorNgo(flaskSocialWorker);
        console.log('\x1b[36m%s\x1b[0m', 'Creating a Social Worker ...\n');
        nestSocialWorker = await this.userService.createContributor(
          swDetails,
          swNgo,
        );
        console.log('\x1b[36m%s\x1b[0m', 'Created a Social Worker ...\n');
      }

      const contributor = nestSocialWorker.contributions.find(
        (c) => c.flaskUserId === Number(body.swId),
      );
      if (!nestSocialWorker || !ngo || !contributor) {
        throw new ServerError('This social worker has not contributed yet');
      }
      return await this.childrenService.preRegisterPrepare(
        candidate.id,
        {
          phoneNumber: body.phoneNumber,
          country: Number(body.country),
          city: Number(body.city),
          bio: { fa: body.bio, en: '' },
          voiceUrl: voiceFile.filename,
          birthPlaceId: Number(body.birthPlaceId),
          birthPlaceName: birthPlace.name,
          birthDate: new Date(body.birthDate),
          housingStatus: Number(body.housingStatus),
          familyCount: Number(body.familyCount),
          educationLevel: Number(body.educationLevel),
          schoolType: Number(body.schoolType),
          flaskNgoId: Number(body.ngoId),
          flaskSwId: Number(body.swId),
          lastName: { fa: body.lastName, en: '' },
          firstName: { fa: body.firstName, en: '' },
          state: Number(body.state),
          address: body.address,
          status: PreRegisterStatusEnum.PRE_REGISTERED,
        },
        location,
        ngo,
        contributor,
      );
    } catch (e) {
      throw new ServerError(e.message, e.status);
    }
  }

  @ApiOperation({
    description: 'update pre register',
  })
  @Patch(`preregister/update-approved/:flaskChildId`)
  @UsePipes(new ValidationPipe())
  async preRegisterUpdateApproved(
    @Param('flaskChildId') flaskChildId: number,
    @Body() body: { schoolType: SchoolTypeEnum; addedState: number },
    @Req() req: Request,
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
      throw new ForbiddenException('You Are not the Super admin');
    }
    let preRegister: ChildrenPreRegisterEntity;
    try {
      const flaskChild = await this.childrenService.getFlaskChild(flaskChildId);
      preRegister = await this.childrenService.getChildrenPreRegisterByFlaskId(
        flaskChildId,
      );
      if (!preRegister) {
        preRegister = await this.childrenService.createPreRegisterChild(
          flaskChild.awakeAvatarUrl,
          flaskChild.sleptAvatarUrl,
          {
            fa: flaskChild.sayname_translations.fa,
            en: flaskChild.sayname_translations.en,
          },
          flaskChild.gender === false ? SexEnum.FEMALE : SexEnum.MALE,
        );
        console.log(preRegister);
      }
      const preRegisterDetails = {
        birthDate: new Date(flaskChild.birthDate),
        firstName: {
          fa: flaskChild.firstName_translations.fa,
          en: flaskChild.firstName_translations.en,
        },
        lastName: {
          fa: flaskChild.lastName_translations.fa,
          en: flaskChild.lastName_translations.en,
        },
        sayName: {
          fa: flaskChild.sayname_translations.fa,
          en: flaskChild.sayname_translations.en,
        },
        birthPlaceId: Number(flaskChild.nationality),
        phoneNumber: flaskChild.phoneNumber,
        address: flaskChild.address,
        country: Number(flaskChild.country),
        city: Number(flaskChild.city),
        state: Number(body.addedState),
        awakeUrl: flaskChild.awakeAvatarUrl,
        sleptUrl: flaskChild.sleptAvatarUrl,
        voiceUrl: flaskChild.voiceUrl,
        sex: flaskChild.gender === false ? SexEnum.FEMALE : SexEnum.MALE,
        bio: {
          fa: flaskChild.bio_translations.fa,
          en: flaskChild.bio_translations.en,
        },
        housingStatus: Number(flaskChild.housingStatus),
        educationLevel: Number(flaskChild.education),
        schoolType: body.schoolType,
        familyCount: Number(flaskChild.familyCount),
      };
      console.log('\x1b[36m%s\x1b[0m', 'Updating the preRegister ...\n');

      await this.childrenService.preRegisterUpdateApproved(
        flaskChildId,
        preRegister.id,
        preRegisterDetails,
      );

      preRegister = await this.childrenService.getChildrenPreRegisterByFlaskId(
        flaskChildId,
      );

      return await this.syncService.syncChild(
        flaskChild,
        body.addedState,
        body.schoolType,
      );
    } catch (e) {
      throw new ServerError(e.message, e.status);
    }
  }

  @ApiOperation({
    description: 'update pre register',
  })
  @Patch(`preregister/update`)
  @UsePipes(new ValidationPipe())
  async preRegisterUpdate(
    @Req() req: Request,
    @Body(ValidateChildTsPipe) body: UpdatePreRegisterChildDto,
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
      throw new ForbiddenException('You Are not the Super admin');
    }
    try {
      return await this.childrenService.preRegisterUpdate(body.id, {
        bio: { fa: body.bio, en: '' },
        housingStatus: Number(body.housingStatus),
        educationLevel: Number(body.educationLevel),
        schoolType: Number(body.schoolType),
        lastName: { fa: body.lastName, en: '' },
        firstName: { fa: body.firstName, en: '' },
      });
    } catch (e) {
      throw new ServerError(e.message, e.status);
    }
  }

  @UseInterceptors(ChildrenInterceptor)
  @Get(`preregister/all/:status`)
  @ApiOperation({ description: 'Get all children from db' })
  async getChildrenPreRegister(
    @Param('status') status: PreRegisterStatusEnum,
    @Req() req: Request,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];

    const X_LIMIT = parseInt(req.headers['x-limit']);
    const X_TAKE = parseInt(req.headers['x-take']);
    const limit = X_LIMIT > 100 ? 100 : X_LIMIT;
    const page = X_TAKE + 1;
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    let ngoIds: number[];
    let swIds: number[];
    const socialWorker = await this.userService.getFlaskSocialWorker(
      panelFlaskUserId,
    );
    if (convertFlaskToSayRoles(panelFlaskTypeId) === SAYPlatformRoles.AUDITOR) {
      // for auditor - admin
      swIds = await this.userService
        .getFlaskSwIds()
        .then((r) => r.map((s) => s.id)); // all NGOs id

      ngoIds = await this.ngoService
        .getFlaskNgos()
        .then((r) => r.map((s) => s.id));
    }

    if (
      convertFlaskToSayRoles(panelFlaskTypeId) ===
      SAYPlatformRoles.NGO_SUPERVISOR
    ) {
      // for ngo supervisor

      swIds = await this.userService
        .getFlaskSocialWorkersByNgo(socialWorker.ngo_id)
        .then((r) => r.map((s) => s.id));
      ngoIds = [socialWorker.ngo_id];
    }

    if (
      (panelFlaskTypeId === FlaskUserTypesEnum.ADMIN ||
        panelFlaskTypeId === FlaskUserTypesEnum.SUPER_ADMIN) &&
      Number(status) === PreRegisterStatusEnum.NOT_REGISTERED
    ) {
      return await this.childrenService.getChildrenPreRegisterNotRegistered(
        {
          page: page,
          limit: limit,
          path: '/',
        },
        status,
      );
    }

    return await this.childrenService.getChildrenPreRegisters(
      {
        page: page,
        limit: limit,
        path: '/',
      },
      status,
      ngoIds ? ngoIds : [socialWorker.ngo_id],
      panelFlaskTypeId === FlaskUserTypesEnum.SOCIAL_WORKER
        ? [panelFlaskUserId]
        : swIds,
    );
  }

  @Get(`all`)
  @ApiOperation({ description: 'Get all children from db' })
  async getChildren(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) &&
      !(
        panelFlaskTypeId === FlaskUserTypesEnum.SUPER_ADMIN ||
        panelFlaskTypeId === FlaskUserTypesEnum.ADMIN
      )
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    return await this.childrenService.getChildren();
  }

  @Get(`all/actives`)
  @ApiOperation({ description: 'Get all active children from flask db' })
  async getActiveChildren(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) &&
      !(
        panelFlaskTypeId === FlaskUserTypesEnum.SUPER_ADMIN ||
        panelFlaskTypeId === FlaskUserTypesEnum.ADMIN
      )
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    return await this.childrenService.getFlaskActiveChildren();
  }

  @ApiOperation({
    description: 'update child',
  })
  @Patch(`flaskChildId=:flaskChildId`)
  @UseInterceptors(FileInterceptor('voiceFile', voiceStorage))
  @UsePipes(new ValidationPipe())
  async updateChild(
    @Req() req: Request,
    @UploadedFile() voiceFile: Express.Multer.File,
    @Body() body,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) &&
      !(
        panelFlaskTypeId === FlaskUserTypesEnum.SUPER_ADMIN ||
        panelFlaskTypeId === FlaskUserTypesEnum.ADMIN
      )
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    let theVoiceFile: File;
    if (voiceFile) {
      const fileBuffer = await fs.promises.readFile(
        `uploads/children/voices/${voiceFile.filename}`,
      );

      theVoiceFile = new File([fileBuffer], `${voiceFile.filename}`, {
        type: voiceFile.mimetype,
      });
    }
    console.log(body);
    console.log(theVoiceFile);

    return theVoiceFile;
  }

  @Get(`check/names/:newName/:lang`)
  @ApiOperation({ description: 'Check similar names' })
  async checkChildrenNames(
    @Param('newName') newName: string,
    @Param('lang') lang: 'fa' | 'en',
    @Req() req: Request,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      !(
        panelFlaskTypeId === FlaskUserTypesEnum.SUPER_ADMIN ||
        panelFlaskTypeId === FlaskUserTypesEnum.ADMIN
      )
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    const confirmedNames = (
      await this.childrenService.getFlaskChildrenNames()
    ).map((r) => r.sayname_translations);

    const preNames = (await this.childrenService.getPreChildrenNames()).map(
      (r) => r.sayName,
    );

    const names = confirmedNames.concat(preNames);

    // to minimize human mistakes, we also compare the last 3 chars - همادخت vs هُمادخت
    const found = names.filter((n) =>
      lang === 'en'
        ? n.en.toUpperCase() === newName.toUpperCase() ||
          (n.en &&
            n.en.slice(-3).toUpperCase() === newName.slice(-3).toUpperCase())
        : n.fa === newName || (n.fa && n.fa.slice(-3) === newName.slice(-3)),
    );

    return {
      found,
      total: found.length,
    };
  }

  @Get(`generate/say/names`)
  @ApiOperation({ description: 'Get all children from db' })
  async generateNames(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) &&
      !(
        panelFlaskTypeId === FlaskUserTypesEnum.SUPER_ADMIN ||
        panelFlaskTypeId === FlaskUserTypesEnum.ADMIN
      )
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    return await this.downloadService.excelStream(
      'dist/features/children/resources/names.xlsx',
    );
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
      throw new ForbiddenException('You Are not the Super admin');
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
      throw new ForbiddenException('You Are not authorized');
    }
    const token =
      config().dataCache.fetchPanelAuthentication(panelFlaskUserId).token;
    return await this.childrenService.getChildNeedsSummery(token, childId);
  }

  @Get('/network')
  getAvailableContributions(@Req() req: Request) {
    const dappFlaskUserId = req.headers['dappFlaskUserId'];
    if (!isAuthenticated(dappFlaskUserId, FlaskUserTypesEnum.FAMILY)) {
      throw new ForbiddenException('You Are not authorized');
    }
    return this.childrenService.gtTheNetwork();
  }

  @Get('avatars/images/:fileName')
  async serveAwakeAvatar(
    @Param('fileName') fileName: string,
    @Res() res: any,
  ): Promise<any> {
    try {
      res.sendFile(fileName, { root: './uploads/children/avatars' });
    } catch (e) {
      console.log(e);
    }
  }

  @Get('voices/:fileName')
  async serveVoice(
    @Param('fileName') fileName: string,
    @Res() res: any,
  ): Promise<any> {
    res.sendFile(fileName, { root: './uploads/children/voices' });
  }
}
