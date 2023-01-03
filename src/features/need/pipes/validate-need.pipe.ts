import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { NeedDto } from '../../../types/dtos/CreateNeed.dto';

@Injectable()
export class ValidateNeedPipe implements PipeTransform {
  transform(value: NeedDto, metadata: ArgumentMetadata) {
    return value;
  }
}
