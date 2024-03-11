import { Catch, HttpStatus, HttpException, } from '@nestjs/common';

@Catch(HttpException)
export class ServerError extends HttpException {
  constructor(msg?: string, status?: HttpStatus) {
    super(msg || 'Could not save!', status || HttpStatus.INTERNAL_SERVER_ERROR);
    console.log(msg, status)
  }

}
