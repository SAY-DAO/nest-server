import { ArgumentMetadata, HttpException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { CreateChildDto } from 'src/types/dtos/CreateChildren.dto';

@Injectable()
export class ValidateChildrenPipe implements PipeTransform {
  transform(value: CreateChildDto, metadata: ArgumentMetadata) {
    console.log("Validating Children data...")
    if (!value.childId) {
      console.log(`passing from a child with no Id in Flask!`)
    }
    return value
  }
}