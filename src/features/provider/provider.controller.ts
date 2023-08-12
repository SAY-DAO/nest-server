import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
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
import { providerStorage } from '../../providerStorage';
import { UpdateResult } from 'typeorm';
import {
  NeedTypeDefinitionEnum,
  NeedTypeEnum,
} from '../../types/interfaces/interface';
import { ValidateProviderPipe } from './pipes/validate-provider.pipe';
import { ProviderJoinNeedEntity } from 'src/entities/provider.Join.need..entity';

@ApiTags('Provider')
@Controller('providers')
export class ProviderController {
  constructor(private providerService: ProviderService) {}

  @Get(`all`)
  @ApiSecurity('flask-access-token')
  @ApiHeader({
    name: 'flaskId',
    description: 'to use cache and flask authentication',
    required: true,
  })
  @ApiOperation({ description: 'Get all providers' })
  async getProviders() {
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
  async getOneProvider(@Param('id') id: string) {
    let provider: ProviderEntity;
    if (id) {
      try {
        provider = await this.providerService.getProviderById(id);
      } catch (e) {
        throw new ServerError(e);
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
    @Body() body: CreateProviderJoinNeedDto,
  ): Promise<ProviderJoinNeedEntity> {
    let relation: ProviderJoinNeedEntity;
    try {
      relation = await this.providerService.createRelation(
        body.flaskNeedId,
        body.nestProviderId,
      );
    } catch (e) {
      body;
      throw new ServerError(e.message, e.status);
    }
    return relation;
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
    @UploadedFile() file,
    @Body(ValidateProviderPipe) request: CreateProviderDto,
  ): Promise<ProviderEntity> {
    let provider: ProviderEntity;
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
      throw new ServerError(e);
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
    @Param('id') id,
    @UploadedFile() file,
    @Body(ValidateProviderPipe) request: CreateProviderDto,
  ): Promise<UpdateResult> {
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
  deleteOne(@Param('id') id: number): Observable<any> {
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
