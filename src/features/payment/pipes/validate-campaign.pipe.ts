import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ValidatePaymentPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    console.log('Validating Payment...');

    return value;
  }
}
