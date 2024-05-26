import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ProviderService } from './provider.service';
import { ProviderEntity } from '../../entities/provider.entity';
import { ServerError } from '../../filters/server-exception.filter';
import {
  CreateProviderDto,
  CreateProviderJoinNeedDto,
} from '../../types/dtos/CreateProvider.dto';
import { Observable } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { providerStorage } from '../../storage/providerStorage';
import { UpdateResult } from 'typeorm';
import {
  FlaskUserTypesEnum,
  NeedTypeDefinitionEnum,
  NeedTypeEnum,
} from '../../types/interfaces/interface';
import { ValidateProviderPipe } from './pipes/validate-provider.pipe';
import { ProviderJoinNeedEntity } from 'src/entities/provider.Join.need..entity';
import { isAuthenticated } from 'src/utils/auth';
import { NeedService } from '../need/need.service';

@ApiTags('Provider')
@Controller('providers')
export class ProviderController {
  constructor(
    private providerService: ProviderService,
    private needService: NeedService,
  ) {}

  @Get(`all`)
  @ApiSecurity('flask-access-token')
  @ApiHeader({
    name: 'flaskId',
    description: 'to use cache and flask authentication',
    required: true,
  })
  @ApiOperation({ description: 'Get all providers' })
  async getProviders(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException('You Are not authorized');
    }
    return await this.providerService.getProviders();
  }

  @Get(`:id`)
  @ApiSecurity('flask-access-token')
  @ApiHeader({
    name: 'flaskId',
    description: 'to use cache and flask authentication',
    required: true,
  })
  @ApiOperation({ description: 'Get one by id' })
  async getOneProvider(@Req() req: Request, @Param('id') id: string) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException('You Are not authorized');
    }
    let provider: ProviderEntity;
    if (id) {
      try {
        provider = await this.providerService.getProviderById(id);
      } catch (e) {
        throw new ServerError(e.message, e.status);
      }
      return provider;
    } else {
      throw new HttpException('you need to provide id', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('join')
  @ApiSecurity('flask-access-token')
  @ApiHeader({
    name: 'flaskId',
    description: 'to use cache and flask authentication',
    required: true,
  })
  @ApiOperation({ description: 'Create one provider' })
  async createRelation(
    @Req() req: Request,
    @Body() body: CreateProviderJoinNeedDto,
  ): Promise<ProviderJoinNeedEntity> {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException('You Are not authorized');
    }
    let relation: ProviderJoinNeedEntity;
    try {
      relation = await this.providerService.getProviderNeedRelationById(
        body.flaskNeedId,
      );
      if (!relation) {
        relation = await this.providerService.createRelation(
          body.flaskNeedId,
          body.nestProviderId,
        );
      } else {
        await this.providerService.updateProviderRelation(
          relation.id,
          body.flaskNeedId,
          body.nestProviderId,
        );
        relation = await this.providerService.getProviderNeedRelationById(
          body.flaskNeedId,
        );

        const provider = await this.providerService.getProviderById(
          relation.nestProviderId,
        );
        const need = await this.needService.getNeedByFlaskId(body.flaskNeedId);
        await this.needService.updateNeedProvider(need.id, provider);
      }
    } catch (e) {
      throw new ServerError(e.message, e.status);
    }
    return relation;
  }

  @Get('need/:needId')
  @ApiSecurity('flask-access-token')
  @ApiHeader({
    name: 'flaskId',
    description: 'to use cache and flask authentication',
    required: true,
  })
  @ApiOperation({ description: 'Create one provider' })
  async getProviderByNeed(
    @Req() req: Request,
    @Param('needId') needId,
  ): Promise<ProviderEntity> {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException('You Are not authorized');
    }
    let provider: ProviderEntity;
    try {
      const relation = await this.providerService.getProviderNeedRelationById(
        needId,
      );
      if (relation) {
        provider = await this.providerService.getProviderById(
          relation.nestProviderId,
        );
        return provider;
      } else {
        throw new BadRequestException('No provider relation for this need');
      }
    } catch (e) {
      throw new ServerError(e.message, e.status);
    }
  }

  @Post('add')
  @ApiSecurity('flask-access-token')
  @ApiHeader({
    name: 'flaskId',
    description: 'to use cache and flask authentication',
    required: true,
  })
  @UsePipes(new ValidationPipe()) // validation for dto files
  @UseInterceptors(FileInterceptor('file', providerStorage))
  @ApiOperation({ description: 'Create one provider' })
  async createProvider(
    @Req() req: Request,
    @UploadedFile() file,
    @Body(ValidateProviderPipe) request: CreateProviderDto,
  ): Promise<ProviderEntity> {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException('You Are not authorized');
    }

    let provider: ProviderEntity;
    provider = await this.providerService.getProviderByName(request.name);
    if (
      provider &&
      provider.city == request.city &&
      provider.country == request.country
    ) {
      throw new BadRequestException('Already exist!');
    }
    const newProvider = {
      name: request.name,
      description: request?.description,
      address: request?.address,
      type:
        parseInt(request.type) === 0
          ? NeedTypeEnum.SERVICE
          : NeedTypeEnum.PRODUCT,
      typeName:
        parseInt(request.type) === 0
          ? NeedTypeDefinitionEnum.SERVICE
          : NeedTypeDefinitionEnum.PRODUCT,
      website: request.website,
      city: request?.city,
      state: request?.state,
      country: request.country,
      logoUrl: file?.filename,
      isActive: true,
    };

    try {
      provider = await this.providerService.createProvider(newProvider);
    } catch (e) {
      throw new ServerError(e.message, e.status);
    }
    return provider;
  }

  @Patch('update/:id')
  @ApiSecurity('flask-access-token')
  @ApiHeader({
    name: 'flaskId',
    description: 'to use cache and flask authentication',
    required: true,
  })
  @UsePipes(new ValidationPipe()) // validation for dto files
  @UseInterceptors(FileInterceptor('file', providerStorage))
  async updateProvider(
    @Req() req: Request,
    @Param('id') id,
    @UploadedFile() file,
    @Body(ValidateProviderPipe) request: CreateProviderDto,
  ): Promise<UpdateResult> {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException('You Are not authorized');
    }

    const newProvider = {
      name: request?.name,
      description: request?.description,
      address: request?.address,
      type:
        parseInt(request.type) === 0
          ? NeedTypeEnum.SERVICE
          : NeedTypeEnum.PRODUCT,
      typeName:
        parseInt(request.type) === 0
          ? NeedTypeDefinitionEnum.SERVICE
          : NeedTypeDefinitionEnum.PRODUCT,
      website: request?.website,
      city: request?.city,
      state: request?.state,
      country: request?.country,
      logoUrl: file?.filename,
      isActive: Boolean(request.isActive),
    };

    return this.providerService.updateProvider(id, newProvider);
  }

  @Delete(':id')
  @ApiSecurity('flask-access-token')
  @ApiHeader({
    name: 'flaskId',
    description: 'to use cache and flask authentication',
    required: true,
  })
  deleteOne(@Req() req: Request, @Param('id') id: number): Observable<any> {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    return this.providerService.deleteOne(id);
  }

  @Get('images/:fileName')
  async serveAvatar(
    @Param('fileName') fileName: string,
    @Res() res: any,
  ): Promise<any> {
    res.sendFile(fileName, { root: './uploads/providers/logos' });
  }
}
