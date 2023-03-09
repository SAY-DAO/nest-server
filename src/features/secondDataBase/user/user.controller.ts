import {
    Controller,
    Get,
    Param,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FlaskUserService } from './user.service';

@ApiTags('Flask/Users')
@Controller('flask/users')
export class UserController {
    constructor(
        private userService: FlaskUserService,
    ) { }

    @Get(`users`)
    @ApiOperation({ description: 'Get all users' })
    async getUsers() {
        return await this.userService.getUsers()
    }


    @Get(`users/:id`)
    @ApiOperation({ description: 'Get all users' })
    async getUserById(
        @Param('id') id: number
    ) {
        return await this.userService.getUserById(id)
    }

    @Get(`allSw`)
    @ApiOperation({ description: 'Get all users' })
    async getSws() {
        return await this.userService.getSws()
    }

}
