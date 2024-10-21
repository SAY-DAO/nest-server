import { ForbiddenException, Logger } from '@nestjs/common';
import config from 'src/config';
import { ServerError } from 'src/filters/server-exception.filter';
import { SocialWorkerAPIApi, UserAPIApi } from 'src/generated-sources/openapi';
import { convertFlaskToSayRoles, timeDifference } from './helpers';
import {
  FlaskUserTypesEnum,
} from 'src/types/interfaces/interface';

export async function updateFlaskCacheAuthentication(req, logger: Logger) {
  logger.warn('Passing through MiddleWare...');

  const accessToken = req.headers['authorization'];
  const requestDappFlaskId = Number(req.headers['flaskdappid']);
  const requestPanelFlaskId = Number(req.headers['flaskid']);

  if (!accessToken || (!requestPanelFlaskId && !requestDappFlaskId)) {
    throw new ForbiddenException('Access Token and the ID is required!');
  }


  try {
    // for Dapp
    if (requestDappFlaskId) {
      // If in Cache
      logger.log('fetching dapp cache token...');
      let fetched = config().dataCache.fetchDappAuthentication(requestDappFlaskId);
      if (fetched) {
        logger.log('fetched dapp cache token...');
        if (
          timeDifference(fetched.createdAt, new Date()).mm >= 1 ||
          fetched.token !== accessToken
        ) {
          logger.warn('removing old user token...');
          config().dataCache.expireDappAccessToken(requestDappFlaskId);
          req.headers['dappFlaskUserId'] = '';
          req.headers['flaskId'] = '';
          fetched = config().dataCache.fetchDappAuthentication(requestDappFlaskId);
        } else {
          logger.log('Got the cache token!...');
          req.headers['dappFlaskUserId'] = requestDappFlaskId;
          return;
        }
      }

      // If not in Cache
      if (!fetched || fetched.isExpired) {
        logger.warn(
          'No token at cache, Authenticating from Family Flask Api...',
        );
        const userFlaskApi = new UserAPIApi();
        const familyMember = await userFlaskApi.apiV2UserUserIduserIdGet(
          accessToken,
          'me',
        );
        if (!familyMember) {
          throw new ForbiddenException('You Do not have Access!');
        } else {
          req.headers['dappFlaskUserId'] = familyMember.id;

          config().dataCache.storeDappAccessToken(
            accessToken,
            familyMember.id,
            new Date(),
          );

          logger.log('saved token...');
          logger.log('Authenticated...');
        }
      }
    }
    // for panel
    else if (requestPanelFlaskId) {
      logger.log('fetching panel cache token...');
      let fetched = config().dataCache.fetchPanelAuthentication(requestPanelFlaskId);
      if (fetched) {
        if (
          timeDifference(fetched.createdAt, new Date()).mm > 1 ||
          fetched.token !== accessToken
        ) {
          logger.warn('removing old user token...');
          config().dataCache.expirePanelAccessToken(requestPanelFlaskId);
          req.headers['panelFlaskTypeId'] = '';
          req.headers['panelFlaskUserId'] = '';
          req.headers['flaskId'] = '';
          fetched = config().dataCache.fetchPanelAuthentication(requestPanelFlaskId);
        } else {
          logger.log('Got the cache token!...');
          req.headers['panelFlaskUserId'] = requestPanelFlaskId;
          req.headers['panelFlaskTypeId'] = fetched.flaskUserType;
          return;
        }
      }

      if (!fetched || fetched.isExpired) {
        logger.warn(
          'No token at cache, Authenticating from Social worker Flask Api...',
        );
        const flaskApi = new SocialWorkerAPIApi();
        const socialWorker = await flaskApi.apiV2SocialworkersIdGet(
          accessToken,
          Number(requestPanelFlaskId),
        );
        console.log('here2');

        if (!socialWorker) {
          throw new ForbiddenException('You Do not have Access!');
        }

        req.headers['panelFlaskUserId'] = socialWorker.id;
        req.headers['panelFlaskTypeId'] = socialWorker.typeId;

        config().dataCache.storePanelAccessToken(
          accessToken,
          socialWorker.id,
          socialWorker.typeId,
          convertFlaskToSayRoles(socialWorker.typeId),
          new Date(),
        );

        logger.log('saved token...');
        console.log(
          config().dataCache.fetchPanelAuthentication(socialWorker.id),
        );
        logger.log('Authenticated...');
      }
    } else {
      throw new ServerError('Hmmm, something is not right!', 500);
    }
  } catch (e) {
    throw new ForbiddenException(e);
  }
}

export function isAuthenticated(
  flaskUserId: number,
  userType: FlaskUserTypesEnum,
): boolean {
  console.log('checking authentication...');
  console.log(flaskUserId);
  console.log(userType);

  if (userType === FlaskUserTypesEnum.FAMILY) {
    const dappAuthentication =
      config().dataCache.fetchDappAuthentication(flaskUserId);
    if (!dappAuthentication || dappAuthentication.isExpired === true) {
      return false;
    } else {
      console.log('Authenticated...');
      return true;
    }
  } else {
    const panelAuthentication =
      config().dataCache.fetchPanelAuthentication(flaskUserId);
    if (!panelAuthentication || panelAuthentication.isExpired === true) {
      return false;
    } else {
      console.log('Authenticated...');
      return true;
    }
  }
}
