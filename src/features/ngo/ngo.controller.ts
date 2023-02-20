import { Controller, Get, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { NgoService } from './ngo.service';

@ApiTags('Ngo')
@Controller('ngo')
export class NgoController {
    constructor(private ngoService: NgoService,
    ) { }

    @Get(`all`)
    @ApiOperation({ description: 'Get all ngos' })
    async getNgos(
        @Req() req: Request,
    ) {

        const accessToken = req.headers['authorization'];

        return await this.ngoService.getNgos(accessToken)
    }

}