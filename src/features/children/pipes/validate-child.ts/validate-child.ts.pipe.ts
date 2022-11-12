import { ArgumentMetadata, HttpException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { CreateChildDto } from 'src/types/dtos/CreateChildren.dto';

@Injectable()
export class ValidateChildTsPipe implements PipeTransform {
  transform(value: CreateChildDto, metadata: ArgumentMetadata) {
    console.log("Validating Children...")

    return value;
  }
}
