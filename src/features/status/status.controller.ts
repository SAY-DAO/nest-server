import { Controller} from '@nestjs/common';
import { StatusService } from './status.service';
import { ApiHeader, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('Status')
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskId',
  description: 'to use cache and flask authentication',
  required: true,
})
@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

}
