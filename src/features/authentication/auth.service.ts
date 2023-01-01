import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PanelAuthAPIApi, PreneedAPIApi } from "../../generated-sources/openapi";



@ApiTags('Auth')
@Controller('flask')
export class AuthenticationService {
    @Post(`/panel/auth`)
    @ApiOperation({ description: 'Get all done needs from flask' })
    async authPanel() {
        const panelAuthApi = new PanelAuthAPIApi()
        const response = await panelAuthApi.apiV2PanelAuthLoginPost(process.env.PANEL_AUTH_USERNAME, process.env.PANEL_AUTH_PASSWORD)
        const data = await response.json()

        const accessToken = data.access_token;

        return accessToken
    }
}