import { Need } from 'src/entities/flaskEntities/need.entity';
import { ServerError } from 'src/filters/server-exception.filter';
import {
  AnnouncementEnum,
  CategoryEnum,
  FlaskUserTypesEnum,
  NeedTypeEnum,
  PaymentStatusEnum,
  SAYPlatformRoles,
  SUPER_ADMIN_ID,
} from 'src/types/interfaces/interface';
import {
  convertFlaskToSayRoles,
  daysDifference,
  getSimilarityPercentage,
  prepareUrl,
  urlSimilarityPercentage,
} from './helpers';
import { round } from 'mathjs';
import axios from 'axios';
import { CreateTicketParams } from 'src/types/parameters/CreateTicketParameters';
import { NeedEntity } from 'src/entities/need.entity';
import { AllUserEntity } from 'src/entities/user.entity';
import { TicketEntity } from 'src/entities/ticket.entity';

const BASE_AGE_OF_DUPLICATE_0 = 30;
const BASE_AGE_OF_DUPLICATE_1 = 30;
const BASE_AGE_OF_DUPLICATE_2 = 30;
const BASE_AGE_OF_DUPLICATE_3 = 30;

const SIMILAR_URL_PERCENTAGE = 57; // percentage
const SIMILAR_TXT_PERCENTAGE = 15; // percentage
export const SIMILAR_NAME_LIMIT_PRODUCT = 20;
export const SIMILAR_NAME_LIMIT_SERVICE = 10;
export const GRACE_PERIOD = 15; // days left after ticket to fix the problem mentioned in ticket
export async function validateNeed(
  nestNeed: NeedEntity,
  SuperAdmin: AllUserEntity,
): Promise<{
  needId: string;
  isValidNeed: boolean;
  participants: AllUserEntity[] | null[];
  ticket?: CreateTicketParams;
  ticketDetails?: CreateTicketParams;
  message: string;
}> {
  const type = nestNeed.type;
  const retailerLink = nestNeed.link;
  const price = nestNeed.cost;
  const icon = nestNeed.imageUrl;
  const title = nestNeed.title;
  const name_en = nestNeed.nameTranslations.en;
  const description_en = nestNeed.descriptionTranslations.en;
  const confirmDate = nestNeed.confirmDate;
  const isDeleted = nestNeed.isDeleted;
  let result = {
    needId: nestNeed.id,
    isValidNeed: true,
    participants: [],
    ticketDetails: null,
    message: null,
  };
  // validate Confirm and delete
  if (isDeleted || confirmDate) {
    const createTicketDetails: CreateTicketParams = {
      title: `Bad Need`,
      flaskNeedId: nestNeed.flaskId,
      need: nestNeed,
      flaskUserId: SUPER_ADMIN_ID,
      role: convertFlaskToSayRoles(FlaskUserTypesEnum.SUPER_ADMIN),
      lastAnnouncement: AnnouncementEnum.ERROR,
    };
    result = {
      needId: nestNeed.id,
      isValidNeed: false,
      participants: [SuperAdmin],
      ticketDetails: createTicketDetails,
      message: 'Automated Message: Check need confirmation and existence!',
    };
    return result;
  }

  // validate Retailer Link
  if (type === NeedTypeEnum.PRODUCT) {
    if (retailerLink && retailerLink.length > 10) {
      axios
        .get(retailerLink)
        .then(async (response) => {
          if (response.status !== 200) {
            const createTicketDetails: CreateTicketParams = {
              title: `${response.status} - Need retailerLink is corrupted`,
              flaskNeedId: nestNeed.flaskId,
              need: nestNeed,
              flaskUserId: SUPER_ADMIN_ID,
              role: convertFlaskToSayRoles(FlaskUserTypesEnum.SUPER_ADMIN),
              lastAnnouncement: AnnouncementEnum.ERROR,
            };

            result = {
              needId: nestNeed.id,
              isValidNeed: false,
              participants: [SuperAdmin],
              ticketDetails: createTicketDetails,
              message: `Automated Message: Check retailer link to continue! - ${response.status}.`,
            };
          }
        })
        .catch(async (error) => {
          const createTicketDetails: CreateTicketParams = {
            title: `${error.status} - Error fetching retailerLink`,
            flaskNeedId: nestNeed.flaskId,
            need: nestNeed,
            flaskUserId: SUPER_ADMIN_ID,
            role: convertFlaskToSayRoles(FlaskUserTypesEnum.SUPER_ADMIN),
            lastAnnouncement: AnnouncementEnum.ERROR,
          };

          result = {
            needId: nestNeed.id,
            isValidNeed: false,
            participants: [SuperAdmin],
            ticketDetails: createTicketDetails,
            message: `Automated Message: ${error.message}!`,
          };
          return result;
        });
    } else {
      const createTicketDetails: CreateTicketParams = {
        title: 'We need retailer Link',
        flaskNeedId: nestNeed.flaskId,
        need: nestNeed,
        flaskUserId: nestNeed.socialWorker.flaskUserId,
        role: convertFlaskToSayRoles(FlaskUserTypesEnum.SOCIAL_WORKER),
        lastAnnouncement: AnnouncementEnum.ERROR,
      };
      console.log('\x1b[36m%s\x1b[0m', 'Creating Social workerTicket ...\n');
      result = {
        needId: nestNeed.id,
        isValidNeed: false,
        participants: [nestNeed.socialWorker, SuperAdmin],
        ticketDetails: createTicketDetails,
        message: `Automated Message: Please add the product link or change to Service!`,
      };
      return result;
    }
  }

  // validate icon
  if (icon && icon.length > 10) {
    const iconUrl = prepareUrl(icon);
    axios
      .get(iconUrl)
      .then(async (response) => {
        if (response.status !== 200) {
          const createTicketDetails: CreateTicketParams = {
            title: `${response.status} - Need Icon is corrupted`,
            flaskNeedId: nestNeed.flaskId,
            need: nestNeed,
            flaskUserId: SUPER_ADMIN_ID,
            role: convertFlaskToSayRoles(FlaskUserTypesEnum.SUPER_ADMIN),
            lastAnnouncement: AnnouncementEnum.ERROR,
          };

          result = {
            needId: nestNeed.id,
            isValidNeed: false,
            participants: [SuperAdmin],
            ticketDetails: createTicketDetails,
            message: `Automated Message: Please check the icon url! - ${response.status}`,
          };
          return result;
        }
      })
      .catch(async (error) => {
        const createTicketDetails: CreateTicketParams = {
          title: `${error.status} - Error fetching Icon`,
          flaskNeedId: nestNeed.flaskId,
          need: nestNeed,
          flaskUserId: SUPER_ADMIN_ID,
          role: convertFlaskToSayRoles(FlaskUserTypesEnum.SUPER_ADMIN),
          lastAnnouncement: AnnouncementEnum.ERROR,
        };
        result = {
          needId: nestNeed.id,
          isValidNeed: false,
          participants: [SuperAdmin],
          ticketDetails: createTicketDetails,
          message: `Automated Message: ${error.message}!`,
        };
        return result;
      });
  } else {
    const createTicketDetails: CreateTicketParams = {
      title: 'We need Icon Link',
      flaskNeedId: nestNeed.flaskId,
      need: nestNeed,
      flaskUserId: nestNeed.socialWorker.flaskUserId,
      role: convertFlaskToSayRoles(FlaskUserTypesEnum.SOCIAL_WORKER),
      lastAnnouncement: AnnouncementEnum.ERROR,
    };
    console.log('\x1b[36m%s\x1b[0m', 'Creating Auditor Ticket ...\n');
    result = {
      needId: nestNeed.id,
      isValidNeed: false,
      participants: [SuperAdmin],
      ticketDetails: createTicketDetails,
      message: `Automated Message: Please add the icon!`,
    };
    return result;
  }

  // validate details
  if (
    !name_en ||
    !description_en ||
    (type === NeedTypeEnum.PRODUCT && (!title || title.length < 5)) ||
    name_en.length < 3 ||
    description_en.length < 5 ||
    price < 500
  ) {
    const createTicketDetails: CreateTicketParams = {
      title: `Check ${
        price < 500
          ? 'Price'
          : type === NeedTypeEnum.PRODUCT && (!title || title.length < 5)
          ? 'Title'
          : !name_en || name_en.length < 3
          ? 'Name'
          : !description_en || (description_en.length < 5 && 'Description')
      }`,
      flaskNeedId: nestNeed.flaskId,
      need: nestNeed,
      flaskUserId: nestNeed.socialWorker.flaskUserId,
      role: convertFlaskToSayRoles(FlaskUserTypesEnum.SOCIAL_WORKER),
      lastAnnouncement: AnnouncementEnum.ERROR,
    };
    result = {
      needId: nestNeed.id,
      isValidNeed: false,
      participants: [nestNeed.socialWorker, SuperAdmin],
      ticketDetails: createTicketDetails,
      message: `Automated Message: Please check ${
        price < 500
          ? 'Price'
          : type === NeedTypeEnum.PRODUCT && (!title || title.length < 5)
          ? 'Title'
          : !name_en || name_en.length < 3
          ? 'Name'
          : !description_en || (description_en.length < 5 && 'Description')
      }`,
    };
    return result;
  }
  return result;
}

export function checkNeed(need: Need, duplicate: Need) {
  let C: boolean | null; // category
  let T: boolean | null; // type
  let R: boolean | null; // retailerLink
  let P: boolean | null; // price
  let I: boolean | null; // icon
  let N: boolean | null; // name_en
  let D: boolean | null; // description_en
  let TT: boolean | null; // title
  let ageOfDup: number; // e.g 50 days ago was created or confirmed
  let A: boolean | null; // age range check result - consider duplicate only if in range
  let msg: string;

  const category = need.category;
  const type = need.type;
  const retailerLink = need.link;
  const price = need._cost;
  const icon = need.imageUrl;
  const title = need.title;
  const name_en = need.name_translations.en;
  const description_en = need.description_translations.en;

  if (duplicate.id) {
    // 1- check how old is the duplicate, if not confirmed use created time.
    // e.g: to consider it as a duplicate or if dismiss if too old
    if (duplicate.confirmDate) {
      ageOfDup = daysDifference(duplicate.confirmDate, new Date());
    } else {
      ageOfDup = daysDifference(duplicate.created, new Date());
    }

    if (
      duplicate.category === CategoryEnum.GROWTH &&
      ageOfDup < BASE_AGE_OF_DUPLICATE_0
    ) {
      A = true;
    } else if (
      duplicate.category === CategoryEnum.JOY &&
      ageOfDup < BASE_AGE_OF_DUPLICATE_1
    ) {
      A = true;
    } else if (
      duplicate.category === CategoryEnum.HEALTH &&
      ageOfDup < BASE_AGE_OF_DUPLICATE_2
    ) {
      A = true;
    } else if (
      duplicate.category === CategoryEnum.SURROUNDING &&
      ageOfDup < BASE_AGE_OF_DUPLICATE_3
    ) {
      A = true;
    } else {
      A = false;
      let age: number;
      if (duplicate.category === CategoryEnum.GROWTH)
        age = BASE_AGE_OF_DUPLICATE_0;
      if (duplicate.category === CategoryEnum.JOY)
        age = BASE_AGE_OF_DUPLICATE_1;
      if (duplicate.category === CategoryEnum.HEALTH)
        age = BASE_AGE_OF_DUPLICATE_2;
      if (duplicate.category === CategoryEnum.SURROUNDING)
        age = BASE_AGE_OF_DUPLICATE_3;
      msg = `Age of Need error ${round(ageOfDup)}/${age} days`;
    }

    // 2- compare need and the duplicate by their variables
    if (category === duplicate.category) {
      C = true;
    } else {
      C = false;
      msg = 'Categories are different';
    }

    if (type === duplicate.type) {
      T = true;
    } else {
      T = false;
      msg = 'Types are different';
    }
    let titleResult: number;
    // compare only first 10 chars
    if (type === NeedTypeEnum.PRODUCT) {
      titleResult =
        duplicate.title &&
        Number(
          getSimilarityPercentage(
            title.length > 15 ? title.substring(0, 15) : title,
            duplicate.title.length > 15
              ? duplicate.title.substring(0, 15)
              : duplicate.title,
          ),
        );
      if (duplicate.title && titleResult > SIMILAR_TXT_PERCENTAGE) {
        TT = true;
      } else {
        TT = false;
        msg = 'title are not that similar';
      }
    } else if (type === NeedTypeEnum.SERVICE) {
      if (!duplicate.title || duplicate.title.length < 1) {
        TT = true;
      } else {
        TT = false;
        msg = 'service should not have link';
      }
    }

    // check icons similarity
    if (
      icon &&
      duplicate.imageUrl &&
      Number(
        urlSimilarityPercentage(
          prepareUrl(icon),
          prepareUrl(duplicate.imageUrl),
        ),
      ) >= SIMILAR_URL_PERCENTAGE
    ) {
      I = true;
    } else {
      I = false;
      msg = 'Icon similarity error';
    }
    if (price && Number(price && duplicate._cost && duplicate._cost > 0) > 0) {
      P = true;
    } else {
      P = false;
      msg = 'Price error';
    }
    if (
      type === NeedTypeEnum.PRODUCT &&
      retailerLink &&
      retailerLink.length > 10 &&
      duplicate.link &&
      duplicate.link.length > 10
    ) {
      R = true;
    } else if (type === NeedTypeEnum.SERVICE) {
      R = true;
    } else {
      R = false;
      msg = 'retailerLink error';
    }
    if (name_en === duplicate.name_translations.en) {
      N = true;
    } else {
      N = false;
      msg = 'name_en error';
    }
    if (description_en === duplicate.description_translations.en) {
      D = true;
    } else {
      D = false;
      msg = 'description_en error';
    }

    let isValidDuplicate = false;
    if (C && T && R && P && I && D && N && A && TT) {
      isValidDuplicate = true;
    }

    return {
      needId: need.id,
      dupId: duplicate.id,
      C, // category
      T, // type
      R, // retailerLink
      P, // price
      I, // icon
      N, // name_en
      TT, // title
      D, // description_en
      A, // ageOfDup
      titleResult,
      isValidNeed: true,
      isValidDuplicate,
      ageOfDup,
      msg: isValidDuplicate ? 'All good!' : msg,
      status: 200,
    };
  } else {
    return {
      needId: need.id,
      dupId: duplicate.id,
      C: null, // category
      T: null, // type
      R: null, // retailerLink
      P: null, // price
      I: null, // icon
      N: null, // name_en
      D: null, // description_en
      A: null, // ageOfDup
      titleResult: null,
      isValidNeed: null,
      isValidDuplicate: false,
      ageOfDup: 0,
      msg: 'This need does not exist!',
      status: 599,
    };
  }
}
