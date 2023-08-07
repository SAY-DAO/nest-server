import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
  Request,
  Response,
} from '@nestjs/common';
import { NextFunction } from 'express';

@Injectable()
export class ProviderImageMiddleware implements NestMiddleware {

  async use(@Request() req, @Response() res, next: NextFunction) {

    const { host, origin } = req.headers;
    const origins = [
      process.env.AUTHORIZED_DAPP_LOCAL,
      process.env.AUTHORIZED_PANEL_LOCAL,
      process.env.AUTHORIZED_DOCS_LOCAL,
    ];
    if (!origins.includes(origin) && !host) {
      throw new HttpException('not an authorized origin', HttpStatus.FORBIDDEN);
    }
    if (origins.includes(origin) || host) next();
  }
}
