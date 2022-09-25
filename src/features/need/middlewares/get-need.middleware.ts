import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class GetNeedMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('All Needs MiddleWare...')
    console.log(req.headers)

    next();
  }
}
