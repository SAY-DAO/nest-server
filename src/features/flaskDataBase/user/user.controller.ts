import {
    Controller,
    Get,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';

@ApiTags('Flask/Users')
@Controller('flask/users')
export class UserController {
    constructor(
        private userService: UserService,
    ) { }

    @Get(`all`)
    @ApiOperation({ description: 'Get all users' })
    async getUsers() {
        console.log('here')
        return await this.userService.getUsers()
    }

}
