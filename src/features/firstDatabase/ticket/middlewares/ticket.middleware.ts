import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class TicketMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Ticket MiddleWare...')
    console.log(req.headers)
    const { host, origin } = req.headers
    const origins = [
      process.env.AUTHORIZED_DAPP_LOCAL,
      process.env.AUTHORIZED_PANEL_LOCAL,
      process.env.AUTHORIZED_DOCS_LOCAL
    ]
    if (!origins.includes(origin) && !host) {
      throw new HttpException('not an authorized origin - Ticket middleWare', HttpStatus.FORBIDDEN)
    }
    if (origins.includes(origin) || host) next();
  }
}
