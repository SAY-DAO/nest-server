import { ForbiddenException } from '@nestjs/common';
import config from 'src/config';
import { SocialWorkerAPIApi } from 'src/generated-sources/openapi';

export async function checkFlaskCacheAuthentication(
  req: {
    headers: { [x: string]: any };
  },
  logger: { warn: (arg0: string) => void; log: (arg0: string) => void },
) {
  logger.warn('Passing through MiddleWare...');

  const accessToken = req.headers['authorization'];
  const flaskSwId = Number(req.headers['flaskswid']);

  if (!accessToken || !flaskSwId) {
    throw new ForbiddenException('Access Token and the ID is required!');
  }
  logger.log('fetching cache token...');
  const fetchedToken = config().dataCache.fetchAccessToken();
  if (fetchedToken[flaskSwId]) {
    logger.log('Got the cache token!...');
  }
  if (!fetchedToken[flaskSwId] || fetchedToken[flaskSwId] !== accessToken) {
    try {
      logger.warn('No token at cache, Authenticating from Flask Api...');
      const flaskApi = new SocialWorkerAPIApi();
      const socialWorker = await flaskApi.apiV2SocialworkersIdGet(
        accessToken,
        flaskSwId,
      );

      if (!socialWorker) {
        throw new ForbiddenException('You Do not have Access!');
      }
      if (fetchedToken[flaskSwId]) {
        console.log([flaskSwId]);
        console.log(fetchedToken[flaskSwId]);
        
        logger.warn('removing old user token...');
        config().dataCache.deleteAnAccessToken(flaskSwId);
      }
      config().dataCache.storeAccessToken(accessToken, socialWorker.id);

      logger.log('saved token...');
    } catch (e) {
      throw new ForbiddenException({
        status: e.status,
        message: e.statusText,
        hint: 'access token in middleware!',
      });
    }
  }
  logger.log('Authenticated...');
}
