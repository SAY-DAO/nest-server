import { ArgumentMetadata, HttpException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { SyncRequestDto } from '../../../types/dtos/SyncRequest.dto';

@Injectable()
export class ValidateSyncMultiPipe implements PipeTransform {
  transform(value: SyncRequestDto, metadata: ArgumentMetadata) {
    console.log("Validating sync multi...")
    // use pipes to transform request data to a desireable type
    for (let i = 0; i < value.needData.length; i++) {
      if (value.needData[i].category < 0) {
        console.log(`Type ${value.needData[i].type} is not correct!`)
        throw new HttpException('invalid data type', HttpStatus.BAD_REQUEST)
      }
      if (value.needData[i].category < 0) {
        console.log(`Category ${value.needData[i].category} is not correct!`)
        throw new HttpException('invalid data type', HttpStatus.BAD_REQUEST)
      }
      if (!value.needData[i].createdById) {
        console.log(`Social Worker Id ${value.needData[i].needId} is not correct!`)
        throw new HttpException('invalid data type', HttpStatus.BAD_REQUEST)
      }

    }
    if (value.childData) {
      for (let i = 0; i < value.childData.length; i++) {
        if (!value.childData[i].childId) {
          console.log(`passing from a child with no Id in Flask! - index= ${i}`)
          value.childData.splice(i, 1);
        }
      }
    }


    return value
  }
}
