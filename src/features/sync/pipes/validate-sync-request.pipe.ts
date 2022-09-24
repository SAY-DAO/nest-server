import { ArgumentMetadata, HttpException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { SyncRequestDto } from '../../../types/dtos/SyncRequest.dto';

@Injectable()
export class ValidateSyncRequestPipe implements PipeTransform {
  transform(value: SyncRequestDto, metadata: ArgumentMetadata) {
    console.log("Validating sync data...")
    // use pipes to transform request data to a desireable type
    for (let i = 0; i < value.needData.length; i++) {
      const parseTypeInt = parseInt(value.needData[i].type.toString())
      const parseNeedIdInt = parseInt(value.needData[i].needId.toString())
      if (!parseTypeInt) {
        console.log(`${value.needData[0].type} is not a number`)
        throw new HttpException('invalid data type', HttpStatus.BAD_REQUEST)
      } else {
        return { ...value.needData[i], type: parseTypeInt, needId: parseNeedIdInt }
      }
    }
  }
}
