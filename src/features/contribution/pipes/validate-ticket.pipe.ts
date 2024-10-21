import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ValidateContributionPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    console.log('Validating Contribution...');

    return value;
  }
}
