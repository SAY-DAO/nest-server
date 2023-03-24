import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { SwMyPage } from 'src/generated-sources/openapi';

@Injectable()
export class ValidateNeedPipe implements PipeTransform {
  transform(value: SwMyPage, metadata: ArgumentMetadata) {
    console.log("Validating Need...")

    return value;
  }
}
