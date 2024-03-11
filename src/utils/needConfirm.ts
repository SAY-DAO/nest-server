import { Need } from 'src/entities/flaskEntities/need.entity';
import { ServerError } from 'src/filters/server-exception.filter';
import {
  NeedTypeEnum,
  PaymentStatusEnum,
} from 'src/types/interfaces/interface';

export function checkNeed(need: Need, duplicates: Need[]) {
  const category = need.category;
  const type = need.type;
  const status = need.status;
  const retailerLink = need.link;
  const price = need._cost;
  const icon = need.imageUrl;
  const title = need.imageUrl;
  const name_en = need.name_translations.en;
  const description_en = need.description_translations.en;
  const confirmDate = need.confirmDate;
  const isDeleted = need.isDeleted;

  if (!title || !icon || !price || !name_en || !description_en) {
    throw new ServerError(
      'We need title, icon, price, name and description!',
      500,
    );
  }

  if (isDeleted || confirmDate) {
    throw new ServerError("This need's is not available to confirm!", 502);
  }

  if (status > PaymentStatusEnum.NOT_PAID) {
    throw new ServerError("This need's status is wrong!", 503);
  }

  if (type === NeedTypeEnum.PRODUCT && !retailerLink) {
    throw new ServerError('We need the link!', 504);
  }

  if (duplicates.length > 0) {
    const dupList = [];
    for (let i = 0; i < duplicates.length; i++) {
      let C: boolean; // category
      let T: boolean; // type
      let S: boolean; // status
      let R: boolean; // retailerLink
      let P: boolean; // price
      let I: boolean; // icon
      let TT: boolean; // title
      let N: boolean; // name_en
      let D: boolean; // description_en
      let CO: boolean; // confirmDate
      let IS: boolean; // isDeleted

      if (category === duplicates[i].category) {
        C = true;
      } else {
        C = false;
      }
      if (type === duplicates[i].type) {
        T = true;
      } else {
        T = false;
      }
      if (status === duplicates[i].status) {
        S = true;
      } else {
        S = false;
      }
      if (retailerLink === duplicates[i].link) {
        R = true;
      } else {
        R = false;
      }
      if (price === duplicates[i]._cost) {
        P = true;
      } else {
        P = false;
      }
      if (icon === duplicates[i].imageUrl) {
        I = true;
      } else {
        I = false;
      }
      if (title === duplicates[i].title) {
        TT = true;
      } else {
        TT = false;
      }
      if (name_en === duplicates[i].name_translations.en) {
        N = true;
      } else {
        N = false;
      }
      if (description_en === duplicates[i].description_translations.en) {
        D = true;
      } else {
        D = false;
      }
      if (confirmDate === duplicates[i].confirmDate) {
        CO = true;
      } else {
        CO = false;
      }
      if (isDeleted === duplicates[i].isDeleted) {
        IS = true;
      } else {
        IS = false;
      }

      const duplicateNeed = {
        id: duplicates[i],
        C,
        T,
        S,
        R,
        P,
        I,
        TT,
        N,
        D,
        CO,
        IS,
      };
      dupList.push(duplicateNeed);
    }
  } else {
  }
}
