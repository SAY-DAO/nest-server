import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { CreateNeedDto } from '../../../types/dtos/CreateNeed.dto';

@Injectable()
export class ValidateNeedPipe implements PipeTransform {
  transform(value: CreateNeedDto, metadata: ArgumentMetadata) {
    return value;
  }
}
