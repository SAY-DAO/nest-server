import { Body, Controller, Get, HttpException, HttpStatus, Param, Patch, Post, Query, Res, UploadedFile, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProviderService } from './provider.service';
import { ProviderEntity } from '../../entities/provider.entity';
import { ServerError } from '../../filters/server-exception.filter';
import { CreateProviderDto } from '../../types/dtos/CreateProvider.dto';
import { Observable, of } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { storage } from '../../storage';
import { UpdateResult } from 'typeorm';
import { NeedTypeEnum } from '../../types/interface';
import { ValidateProviderPipe } from './pipes/validate-provider.pipe';

@ApiTags('Provider')
@Controller('providers')
export class ProviderController {
    constructor(private providerService: ProviderService,
    ) { }

    @Get(`all`)
    @ApiOperation({ description: 'Get all providers from flask' })
    async getProviders() {
        return await this.providerService.getProviders()
    }

    @Get(`:id`)
    @ApiOperation({ description: 'Get one by id' })
    async getOneProvider(@Param('id') id: string) {
        let provider: ProviderEntity
        if (id) {
            try {
                provider = await this.providerService.getProviderById(id)
            } catch (e) {
                throw new ServerError(e);
            }
            return provider;
        } else {
            throw new HttpException('you need to provide id', HttpStatus.BAD_REQUEST)

        }

    }

    @Post('add')
    @UseInterceptors(FileInterceptor('file', storage))
    @ApiOperation({ description: 'Create one provider' })
    async createProvider(@UploadedFile() file, @Body() request: CreateProviderDto): Promise<Observable<any>> {

        const newProvider = {
            name: request.name,
            description: request?.description,
            type:
                request.type === 0
                    ? NeedTypeEnum.SERVICE
                    : NeedTypeEnum.PRODUCT,
            website: request.website,
            city: request?.city,
            state: request?.state,
            country: request.country,
            logoUrl: file?.filename
        };
        try {
            await this.providerService.createProvider(newProvider)
        } catch (e) {
            throw new ServerError(e);
        }
        return of({ imagePath: file?.path });
    }

    @Patch('update/:id')
    @UsePipes(new ValidationPipe()) // validation for dto files
    @UseInterceptors(FileInterceptor('file', storage))
    async updateProvider(@Param('id') id, @UploadedFile() file, @Body(ValidateProviderPipe) request: CreateProviderDto): Promise<UpdateResult> {
        console.log(request)
        console.log("file")
        console.log(id)
        const newProvider = {
            name: request?.name,
            description: request?.description,
            type:
                request.type === 1
                    ? NeedTypeEnum.PRODUCT
                    : NeedTypeEnum.SERVICE,
            website: request?.website,
            city: request?.city,
            state: request?.state,
            country: request?.country,
            logoUrl: file?.filename
        };
        return this.providerService.updateProvider(id, newProvider)
    }


    @Get('images/:fileId')
    async serveAvatar(@Param('fileId') fileId, @Res() res): Promise<any> {
        res.sendFile(fileId, { root: './uploads/providers/logos' });
    }

}