import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ValidateSignaturePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    console.log("Validating signature data...")
    // use pipes to transform request data to a desireable type
    return value
  }
}