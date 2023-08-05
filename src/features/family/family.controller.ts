import { Controller } from '@nestjs/common';
import { FamilyService } from './family.service';
import { ApiHeader, ApiSecurity } from '@nestjs/swagger';

@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskSwId',
  description: 'to use cache and flask authentication',
  required: true,
})
@Controller('family')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}
}
