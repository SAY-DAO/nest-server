import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { Children } from 'src/types/interfaces/Children';

@Injectable()
export class ValidateChildrenPipe implements PipeTransform {
  transform(value: Children, metadata: ArgumentMetadata) {
    console.log("Validating Children data...")
    return value
  }
}