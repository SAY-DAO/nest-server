import { Catch, BadRequestException, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

@Catch(BadRequestException)
export class BadRequestTransformationFilter extends BaseWsExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const properError = new WsException(exception.getResponse());
    console.log(properError)
    super.catch(properError, host);
  }
}