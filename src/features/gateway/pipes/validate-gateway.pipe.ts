import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ValidateGatewayPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    console.log("Validating Gateway...")
    return value;
  }
}
