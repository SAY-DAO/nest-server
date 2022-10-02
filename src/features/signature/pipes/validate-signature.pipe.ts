import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { SwCreateSwSignatureDto } from '../../../types/dtos/CreateSignature.dto';

@Injectable()
export class ValidateSignaturePipe implements PipeTransform {
  transform(value: SwCreateSwSignatureDto, metadata: ArgumentMetadata) {
    console.log("Validating signature data...")
    // use pipes to transform request data to a desireable type
    return value
  }
}