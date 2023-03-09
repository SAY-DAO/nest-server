import { ArgumentMetadata, HttpException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { CreateProviderDto } from '../../../../types/dtos/CreateProvider.dto';

@Injectable()
export class ValidateProviderPipe implements PipeTransform {
  transform(value: CreateProviderDto, metadata: ArgumentMetadata) {
    console.log("Validating Provider data...")
    if (value.website && value.website.indexOf('https') < 0) {
      console.log(`Website is not correct!`)
      throw new HttpException('invalid data type', HttpStatus.BAD_REQUEST)
    }
    return value
  }
}