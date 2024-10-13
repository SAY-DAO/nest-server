import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ValidateNewsLetterPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    console.log('Validating NewsLetter...');

    return value;
  }
}
