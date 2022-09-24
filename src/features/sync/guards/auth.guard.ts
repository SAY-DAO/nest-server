import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log('Guarding Sync request...')
    const request = context.switchToHttp().getRequest() as Request;
    console.log(request.headers)
    // check user auth and return false if not authorized
    return true;
  }
}
