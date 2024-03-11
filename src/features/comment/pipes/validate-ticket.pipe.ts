import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ValidateCommentPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    console.log("Validating Comment...")

    return value;
  }
}
