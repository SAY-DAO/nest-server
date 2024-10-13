import { ArgumentMetadata, HttpException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { Children } from 'src/types/interfaces/Children';

@Injectable()
export class ValidateChildPipe implements PipeTransform {
  transform(value: Children, metadata: ArgumentMetadata) {
    console.log("Validating Children...")

    return value;
  }
}
