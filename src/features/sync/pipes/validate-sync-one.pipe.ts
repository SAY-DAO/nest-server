import { ArgumentMetadata, HttpException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { NeedDto } from '../../../types/dtos/CreateNeed.dto';

@Injectable()
export class ValidateSyncOnePipe implements PipeTransform {
  transform(value: NeedDto, metadata: ArgumentMetadata) {
    console.log("Validating sync one...")

    const parseTypeInt = parseInt(value.type.toString())
    if (parseTypeInt !== 0 && parseTypeInt !== 1) {
      console.log(`${value.type} is not a correct!`)
      throw new HttpException('invalid data type', HttpStatus.BAD_REQUEST)
    }
    return value
  }
}
