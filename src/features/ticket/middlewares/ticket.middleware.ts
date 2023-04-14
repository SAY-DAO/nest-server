import {  HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ObjectNotFound } from 'src/filters/notFound-expectation.filter';
import { SocialWorkerAPIApi } from 'src/generated-sources/openapi';

@Injectable()
export class TicketMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    console.log('Ticket MiddleWare...')
    const accessToken = req.headers['authorization'];
    const flaskUserId = Number(req.headers['flaskuserid']);

    const flaskApi = new SocialWorkerAPIApi();
    const socialWorker = await flaskApi.apiV2SocialworkersIdGet(accessToken, flaskUserId);
    if (!socialWorker) {
      throw new ObjectNotFound('You Do not have Access!')
    }
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
