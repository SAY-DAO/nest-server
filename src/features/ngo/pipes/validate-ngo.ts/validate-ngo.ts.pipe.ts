import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ValidateNgoPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    console.log("Validating Children...")

    return value;
  }
}
