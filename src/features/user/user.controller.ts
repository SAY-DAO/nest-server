import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(private userService: UserService) { }

    @Get(`done`)
    @ApiOperation({ description: 'Get all done needs' })

    async getUserChildDoneNeeds(@Query('childId') childId: string, @Query('userId') userId: string) {
        return await this.userService.getUserChildDoneNeeds({ userId: Number(userId), childId: Number(childId) });
    }
}
