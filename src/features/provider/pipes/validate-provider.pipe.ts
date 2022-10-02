import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { CreateProviderDto } from 'src/types/dtos/CreateProvider.dto';

@Injectable()
export class ValidateProviderPipe implements PipeTransform {
  transform(value: CreateProviderDto, metadata: ArgumentMetadata) {
    console.log("Validating Provider data...")
    // use pipes to transform request data to a desireable type
    return value
  }
}