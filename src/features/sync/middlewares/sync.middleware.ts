import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class SyncMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    console.log('Sync MiddleWare...')
    next();
  }
}
