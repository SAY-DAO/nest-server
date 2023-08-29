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
  const requestFlaskId = req.headers['flaskid'];

  if (!accessToken || !requestFlaskId) {
    throw new ForbiddenException('Access Token and the ID is required!');
  }
  try {
    // for Dapp
    if (String(requestFlaskId) === 'me') {
      logger.log('fetching dapp cache token...');
      const fetchedToken = config().dataCache.fetchDappAccessToken();
      if (fetchedToken[requestFlaskId]) {
        logger.log('Got the cache token!...');
        req.headers['appFlaskUserId'] = requestFlaskId;
      }
      if (
        !fetchedToken[requestFlaskId] ||
        fetchedToken[requestFlaskId] !== accessToken
      ) {
        logger.warn(
          'No token at cache, Authenticating from Family Flask Api...',
        );
        const userFlaskApi = new UserAPIApi();
        const familyMember = await userFlaskApi.apiV2UserUserIduserIdGet(
          accessToken,
          requestFlaskId,
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
    else if (Number(requestFlaskId) > 0) {
      logger.log('fetching panel cache token...');
      const fetchedToken = config().dataCache.fetchPanelAccessToken();
      if (fetchedToken[requestFlaskId]) {
        logger.log('Got the cache token!...');
        req.headers['panelFlaskUserId'] = requestFlaskId;
        req.headers['panelFlaskTypeId'] =
          fetchedToken[requestFlaskId].flaskTypeId;
      }
      if (
        !fetchedToken[requestFlaskId] ||
        fetchedToken[requestFlaskId].token !== accessToken
      ) {
        logger.warn(
          'No token at cache, Authenticating from Social worker Flask Api...',
        );
        const flaskApi = new SocialWorkerAPIApi();
        const socialWorker = await flaskApi.apiV2SocialworkersIdGet(
          accessToken,
          Number(requestFlaskId),
        );
        if (!socialWorker) {
          throw new ForbiddenException('You Do not have Access!');
        }
        console.log(socialWorker);

        req.headers['panelFlaskUserId'] = socialWorker.id;
        req.headers['panelFlaskTypeId'] = socialWorker.typeId;

        // if (fetchedToken[flaskId]) {
        //   logger.warn('removing old user token...');
        //   config().dataCache.deletePanelAccessToken(flaskId);
        // }
        config().dataCache.storePanelAccessToken(
          accessToken,
          socialWorker.id,
          socialWorker.typeId,
        );

        logger.log('saved token...');
        logger.log('Authenticated...');
      }
    } else {
      throw new ServerError('Hmmm, something is not right!', 500);
    }
  } catch (e) {
    throw new ForbiddenException({
      status: e.status,
      message: e.statusText || e.response,
      hint: 'access token in middleware!',
    });
  }
}
