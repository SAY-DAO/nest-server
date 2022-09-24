import { Catch, HttpStatus, HttpException, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class ServerError extends HttpException {
  constructor(msg?: string, status?: HttpStatus) {
    super(msg || 'Could not save!', status || HttpStatus.INTERNAL_SERVER_ERROR);
  }

}
