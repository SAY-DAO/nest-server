import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class PostNeedMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Create Need MiddleWare...')
    console.log(req.headers)
    const { origin } = req.headers
    const origins = [
      process.env.AUTHORIZED_DAPP_LOCAL,
      process.env.AUTHORIZED_PANEL_LOCAL,
      process.env.AUTHORIZED_DOCS_LOCAL
    ]

    if (!origins.includes(origin)) {
      throw new HttpException('not an authorized origin', HttpStatus.FORBIDDEN)
    }
    if (origins.includes(origin)) next();
  }
}
