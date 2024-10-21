import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ValidateTicketPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    console.log("Validating Ticket...")

    return value;
  }
}
