import { ForbiddenException } from '@nestjs/common';
import config from 'src/config';
import { ServerError } from 'src/filters/server-exception.filter';
import { SocialWorkerAPIApi, UserAPIApi } from 'src/generated-sources/openapi';

export async function checkFlaskCacheAuthentication(
  req: {
    headers: { [x: string]: any };
  },
  logger: { warn: (arg0: string) => void; log: (arg0: string) => void },
) {
  logger.warn('Passing through MiddleWare...');

  const accessToken = req.headers['authorization'];
  const flaskId = req.headers['flaskid'];

  if (!accessToken || !flaskId) {
    throw new ForbiddenException('Access Token and the ID is required!');
  }
  try {
    // for Dapp
    if (String(flaskId) === 'me') {
      logger.log('fetching dapp cache token...');
      const fetchedToken = config().dataCache.fetchDappAccessToken();
      if (fetchedToken[flaskId]) {
        logger.log('Got the cache token!...');
        req.headers['appFlaskUserId'] = flaskId;
      }
      if (!fetchedToken[flaskId] || fetchedToken[flaskId] !== accessToken) {
        logger.warn(
          'No token at cache, Authenticating from Family Flask Api...',
        );
        const userFlaskApi = new UserAPIApi();
        const familyMember = await userFlaskApi.apiV2UserUserIduserIdGet(
          accessToken,
          flaskId,
        );
        if (!familyMember) {
          throw new ForbiddenException('You Do not have Access!');
        }
        req.headers['appFlaskUserId'] = familyMember.id;

        // if (fetchedToken[flaskId]) {
        //   logger.warn('removing old user token...');
        //   config().dataCache.deleteDappAccessToken(flaskId);
        // }
        config().dataCache.storeDappAccessToken(accessToken, familyMember.id);

        logger.log('saved token...');
        logger.log('Authenticated...');
      }
    }
    // for panel
    else if (Number(flaskId) > 0) {
      logger.log('fetching panel cache token...');
      const fetchedToken = config().dataCache.fetchPanelAccessToken();
      if (fetchedToken[flaskId]) {
        logger.log('Got the cache token!...');
        req.headers['panelFlaskUserId'] = flaskId;
      }
      if (!fetchedToken[flaskId] || fetchedToken[flaskId] !== accessToken) {
        logger.warn(
          'No token at cache, Authenticating from Social worker Flask Api...',
        );
        const flaskApi = new SocialWorkerAPIApi();
        const socialWorker = await flaskApi.apiV2SocialworkersIdGet(
          accessToken,
          Number(flaskId),
        );
        if (!socialWorker) {
          throw new ForbiddenException('You Do not have Access!');
        }
        req.headers['panelFlaskUserId'] = socialWorker.id;

        // if (fetchedToken[flaskId]) {
        //   logger.warn('removing old user token...');
        //   config().dataCache.deletePanelAccessToken(flaskId);
        // }
        config().dataCache.storePanelAccessToken(accessToken, socialWorker.id);

        logger.log('saved token...');
        logger.log('Authenticated...');
      }
    } else {
      throw new ServerError('Hmmm, something is not right!', 500);
    }
  } catch (e) {
    console.log(accessToken);
    console.log(flaskId);

    throw new ForbiddenException({
      status: e.status,
      message: e.statusText || e.response,
      hint: 'access token in middleware!',
    });
  }
}
