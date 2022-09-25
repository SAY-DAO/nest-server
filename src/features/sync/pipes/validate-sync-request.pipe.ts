import { ArgumentMetadata, HttpException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { SyncRequestDto } from '../../../types/dtos/SyncRequest.dto';

@Injectable()
export class ValidateSyncRequestPipe implements PipeTransform {
  transform(value: SyncRequestDto, metadata: ArgumentMetadata) {
    console.log("Validating sync data...")
    const finalValue = value.needData
    // use pipes to transform request data to a desireable type
    for (let i = 0; i < value.needData.length; i++) {
      const parseTypeInt = parseInt(value.needData[i].type.toString())
      if (parseTypeInt !== 0 && parseTypeInt !== 1) {
        console.log(`${value.needData[i].type} is not a number`)
        throw new HttpException('invalid data type', HttpStatus.BAD_REQUEST)
      }
    }
    return value
  }
}
