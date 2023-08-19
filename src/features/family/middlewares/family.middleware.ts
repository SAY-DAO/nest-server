import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestMiddleware,
  Request,
  Response,
} from '@nestjs/common';
import { NextFunction } from 'express';
import { ServerError } from 'src/filters/server-exception.filter';
import { checkFlaskCacheAuthentication } from 'src/utils/auth';

@Injectable()
export class FamilyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(FamilyMiddleware.name);

  async use(@Request() req, @Response() res, next: NextFunction) {
    // try {
    //   await checkFlaskCacheAuthentication(req, this.logger);
    // } catch (e) {
    //   throw new ServerError(e);
    // }

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
