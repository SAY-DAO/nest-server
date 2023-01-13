import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { NeedsData } from 'src/types/interfaces/Need';

@Injectable()
export class ValidateNeedPipe implements PipeTransform {
  transform(value: NeedsData, metadata: ArgumentMetadata) {
    return value;
  }
}
