import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { NextFunction } from 'express';

@Injectable()
export class GateWayMiddleware implements NestMiddleware {
  async use(session: Record<string, any>, next: NextFunction) {
    console.log('GateWay MiddleWare...');
    if (!session.siwe) {
      throw new ForbiddenException('You have to first sign_in');
    }
    next();
  }
}
