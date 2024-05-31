import { PRODUCT_UNPAYABLE_PERIOD } from 'src/config';
import { Need } from 'src/entities/flaskEntities/need.entity';
import { TicketEntity } from 'src/entities/ticket.entity';
import { ServerError } from 'src/filters/server-exception.filter';
import {
  NeedTypeEnum,
  PaymentStatusEnum,
  ProductStatusEnum,
  FlaskUserTypesEnum,
  SAYPlatformRoles,
  ServiceStatusEnum,
  PanelContributors,
  VirtualFamilyRole,
  ChildExistence,
  AppContributors,
  CampaignNameEnum,
  CampaignTypeEnum,
  AnnouncementEnum,
} from 'src/types/interfaces/interface';
import fs from 'fs';
import { checkIfFileOrDirectoryExists } from './file';

export const Q1_LOWER_COEFFICIENT = 0.75;
export const Q1_TO_Q2_COEFFICIENT = 1;
export const Q2_TO_Q3_COEFFICIENT = 1.25;
export const Q3_UPPER_COEFFICIENT = 1.5;
export const CONTRIBUTION_COEFFICIENT = 1.2;
const PARENTS_DELIVERED_RANGE = 1;
const RELETIVES_DELIVERED_RANGE = 3;

export function sleep(time) {
    console.log('Sleeping...');
  return new Promise(resolve => setTimeout(resolve, time));
} 
export function getAllFilesFromFolder(dir: string) {
  let results = [];
  if (checkIfFileOrDirectoryExists(dir)) {
    fs.readdirSync(dir).forEach(function (file) {
      file = dir + '/' + file;
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        results = results.concat(getAllFilesFromFolder(file));
      } else results.push(file);
    });
  }

  return results;
}

// {id: 44 }
export function removeSpecialDuplicates(array: any[]) {
  return array.filter((obj, index) => {
    return index === array.findIndex((o) => obj.id === o.id);
  });
}

export function removeDuplicates(array: any[]) {
  return array.filter((item, index) => array.indexOf(item) === index);
}

export function getSAYRoleInteger(sayRole: string) {
  let roleInteger: SAYPlatformRoles;
  if (sayRole === 'AUDITOR') {
    roleInteger = SAYPlatformRoles.AUDITOR;
  } else if (sayRole === 'SOCIAL_WORKER') {
    roleInteger = SAYPlatformRoles.SOCIAL_WORKER;
  } else if (sayRole === 'PURCHASER') {
    roleInteger = SAYPlatformRoles.PURCHASER;
  } else if (sayRole === 'NGO_SUPERVISOR') {
    roleInteger = SAYPlatformRoles.NGO_SUPERVISOR;
  } else if (sayRole === 'FAMILY') {
    roleInteger = SAYPlatformRoles.FAMILY;
  } else if (sayRole === 'RELATIVE') {
    roleInteger = SAYPlatformRoles.RELATIVE;
  } else if (sayRole === 'NO_ROLE') {
    roleInteger = SAYPlatformRoles.NO_ROLE;
  }
  return roleInteger;
}

export function convertFlaskToSayRoles(flaskUserType: number) {
  if (typeof flaskUserType != 'number') {
    throw new ServerError('bad role type');
  }
  let role: SAYPlatformRoles;
  if (flaskUserType === FlaskUserTypesEnum.SAY_SUPERVISOR) {
    role = SAYPlatformRoles.AUDITOR;
  } else if (flaskUserType === FlaskUserTypesEnum.ADMIN) {
    role = SAYPlatformRoles.AUDITOR;
  } else if (flaskUserType === FlaskUserTypesEnum.SUPER_ADMIN) {
    role = SAYPlatformRoles.AUDITOR;
  } else if (flaskUserType === FlaskUserTypesEnum.SOCIAL_WORKER) {
    role = SAYPlatformRoles.SOCIAL_WORKER;
  } else if (flaskUserType === FlaskUserTypesEnum.COORDINATOR) {
    role = SAYPlatformRoles.PURCHASER;
  } else if (flaskUserType === FlaskUserTypesEnum.NGO_SUPERVISOR) {
    role = SAYPlatformRoles.NGO_SUPERVISOR;
  } else if (flaskUserType === FlaskUserTypesEnum.FAMILY) {
    role = SAYPlatformRoles.FAMILY;
  } else if (flaskUserType === FlaskUserTypesEnum.RELATIVE) {
    role = SAYPlatformRoles.RELATIVE;
  }
  return role;
}

export function convertFlaskToSayAppRoles(flaskUserType: number) {
  if (typeof flaskUserType != 'number') {
    throw new ServerError('bad role type');
  }
  let panelRole: AppContributors;
  if (flaskUserType === FlaskUserTypesEnum.FAMILY) {
    panelRole = AppContributors.FAMILY;
  } else if (flaskUserType === FlaskUserTypesEnum.RELATIVE) {
    panelRole = AppContributors.RELATIVE;
  }
  return panelRole;
}

export function convertFlaskToSayPanelRoles(flaskUserType: number) {
  if (typeof flaskUserType != 'number') {
    throw new ServerError('bad role type');
  }
  let panelRole: PanelContributors;

  if (flaskUserType === FlaskUserTypesEnum.SUPER_ADMIN) {
    panelRole = PanelContributors.AUDITOR;
  } else if (flaskUserType === FlaskUserTypesEnum.SOCIAL_WORKER) {
    panelRole = PanelContributors.SOCIAL_WORKER;
  } else if (flaskUserType === FlaskUserTypesEnum.COORDINATOR) {
    panelRole = PanelContributors.PURCHASER;
  } else if (flaskUserType === FlaskUserTypesEnum.NGO_SUPERVISOR) {
    panelRole = PanelContributors.NGO_SUPERVISOR;
  } else if (flaskUserType === FlaskUserTypesEnum.SAY_SUPERVISOR) {
    panelRole = PanelContributors.AUDITOR;
  } else if (flaskUserType === FlaskUserTypesEnum.ADMIN) {
    panelRole = PanelContributors.AUDITOR;
  }
  return panelRole;
}

export function getSAYRoleString(sayRole: number) {
  let roleString: string;
  if (sayRole === SAYPlatformRoles.AUDITOR) {
    roleString = 'auditor';
  } else if (sayRole === SAYPlatformRoles.SOCIAL_WORKER) {
    roleString = 'socialWorker';
  } else if (sayRole === SAYPlatformRoles.PURCHASER) {
    roleString = 'purchaser';
  } else if (sayRole === SAYPlatformRoles.NGO_SUPERVISOR) {
    roleString = 'ngoSupervisor';
  } else if (sayRole === SAYPlatformRoles.FAMILY) {
    roleString = 'familyMember';
  } else if (sayRole === SAYPlatformRoles.RELATIVE) {
    roleString = 'relative';
  } else if (sayRole === SAYPlatformRoles.NO_ROLE) {
    roleString = 'noRole';
  }
  return roleString;
}

export function getSAYRolePersian(sayRole: number) {
  let roleString: string;
  if (sayRole === SAYPlatformRoles.AUDITOR) {
    roleString = 'شاهد';
  } else if (sayRole === SAYPlatformRoles.SOCIAL_WORKER) {
    roleString = 'مددکار';
  } else if (sayRole === SAYPlatformRoles.PURCHASER) {
    roleString = 'میانجی';
  } else if (sayRole === SAYPlatformRoles.NGO_SUPERVISOR) {
    roleString = 'نماینده انجمن';
  } else if (sayRole === SAYPlatformRoles.FAMILY) {
    roleString = 'خانواده';
  } else if (sayRole === SAYPlatformRoles.RELATIVE) {
    roleString = 'خویش‌آوند';
  } else if (sayRole === SAYPlatformRoles.NO_ROLE) {
    roleString = 'noRole';
  }
  return roleString;
}

export function getUserSAYRoleString(userTypeId: number) {
  if (userTypeId === FlaskUserTypesEnum.SOCIAL_WORKER) {
    return 'socialWorker';
  }
  if (userTypeId === FlaskUserTypesEnum.NGO_SUPERVISOR) {
    return 'ngoSupervisor';
  }
  if (
    userTypeId === FlaskUserTypesEnum.ADMIN ||
    userTypeId === FlaskUserTypesEnum.SUPER_ADMIN ||
    userTypeId === FlaskUserTypesEnum.SAY_SUPERVISOR
  ) {
    return 'auditor';
  }
  return 'noRole';
}

export function dateConvertToPersian(value: string) {
  const d = new Date(value);
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    dateStyle: 'full',
  }).format(d);
}

export function persianMonthString(value: Date) {
  return new Intl.DateTimeFormat('en-US-u-ca-persian', {
    month: 'short',
  }).format(value);
}

export function persianMonthStringFarsi(value: Date) {
  const pm = persianMonthString(value);
  return pm === 'Farvardin'
    ? 'فروردین'
    : pm === 'Ordibehesht'
    ? 'اردیبهست'
    : pm === 'Khordad'
    ? 'خرداد'
    : pm === 'Tir'
    ? 'تیر'
    : pm === 'Mordad'
    ? 'مرداد'
    : pm === 'Shahrivar'
    ? 'شهریور'
    : pm === 'Mehr'
    ? 'مهر'
    : pm === 'Aban'
    ? 'آبان'
    : pm === 'Azar'
    ? 'آذر'
    : pm === 'Dey'
    ? 'دی'
    : pm === 'Bahman'
    ? 'بهمن'
    : pm === 'Esfand'
    ? 'اسفند'
    : null;
}

export function persianDay(value: Date) {
  if (!value) {
    return null;
  }
  return parseInt(
    new Intl.DateTimeFormat('en-US-u-ca-persian', { day: 'numeric' }).format(
      value,
    ),
  );
}

export function persianMonth(value: Date) {
  if (!value) {
    return null;
  }
  return parseInt(
    new Intl.DateTimeFormat('en-US-u-ca-persian', { month: 'numeric' }).format(
      value,
    ),
  );
}

export function persianYear(value: Date) {
  return parseInt(
    new Intl.DateTimeFormat('en-US-u-ca-persian', { year: 'numeric' }).format(
      value,
    ),
  );
}

export function daysDifference(time1: Date, time2: Date) {
  const date1 = new Date(time1);
  const date2 = new Date(time2);
  //calculate days difference by dividing total milliseconds in a day
  return (date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24);
}

export function prepareUrl(imageUrl: string) {
  let url: string;
  if (imageUrl && imageUrl.startsWith('/')) {
    url = `https://api.sayapp.company/${imageUrl.slice(1)}`;
  } else {
    url = `https://api.sayapp.company/${imageUrl}`;
  }
  return url;
}

export function timeDifference(time1: Date, time2: Date) {
  const diff = time2.getTime() - time1.getTime();
  let msec = diff;
  const hh = Math.floor(msec / 1000 / 60 / 60);
  msec -= hh * 1000 * 60 * 60;
  const mm = Math.floor(msec / 1000 / 60);
  msec -= mm * 1000 * 60;
  const ss = Math.floor(msec / 1000);
  msec -= ss * 1000;
  return { hh, mm, ss, diff };
}

export function timeDifferenceWithComment(
  time1: number,
  time2: number,
  comment: string,
) {
  const diff = time2 - time1;
  let msec = diff;
  const hh = Math.floor(msec / 1000 / 60 / 60);
  msec -= hh * 1000 * 60 * 60;
  const mm = Math.floor(msec / 1000 / 60);
  msec -= mm * 1000 * 60;
  const ss = Math.floor(msec / 1000);
  msec -= ss * 1000;

  console.log(comment + hh + ':' + mm + ':' + ss);
}

export function getNeedsTimeLine(needs: Need[]) {
  const farvardin = { created: 0, confirmed: 0 };
  const ordibehesht = { created: 0, confirmed: 0 };
  const khordad = { created: 0, confirmed: 0 };
  const tir = { created: 0, confirmed: 0 };
  const mordad = { created: 0, confirmed: 0 };
  const shahrivar = { created: 0, confirmed: 0 };
  const mehr = { created: 0, confirmed: 0 };
  const aban = { created: 0, confirmed: 0 };
  const azar = { created: 0, confirmed: 0 };
  const dey = { created: 0, confirmed: 0 };
  const bahman = { created: 0, confirmed: 0 };
  const esfand = { created: 0, confirmed: 0 };

  for (let i = 0; i < needs.length; i++) {
    const thePersianMonthCreated = persianMonth(needs[i].created);
    const thePersianMonthConfirm = persianMonth(needs[i].confirmDate);

    // farvardin
    if (thePersianMonthCreated === 1) {
      farvardin.created += 1;
    }
    // ordibehesht
    else if (thePersianMonthCreated === 2) {
      ordibehesht.created += 1;
    }
    // khordad
    else if (thePersianMonthCreated === 3) {
      khordad.created += 1;
    }
    // tir
    else if (thePersianMonthCreated === 4) {
      tir.created += 1;
    }
    // mordad
    else if (thePersianMonthCreated === 5) {
      mordad.created += 1;
    }
    // shahrivar
    else if (thePersianMonthCreated === 6) {
      shahrivar.created += 1;
    }
    // mehr
    else if (thePersianMonthCreated === 7) {
      mehr.created += 1;
    }
    // aban
    else if (thePersianMonthCreated === 8) {
      aban.created += 1;
    }
    // azar
    else if (thePersianMonthCreated === 9) {
      azar.created += 1;
    }
    // dey
    else if (thePersianMonthCreated === 10) {
      dey.created += 1;
    }
    // bahman
    else if (thePersianMonthCreated === 11) {
      bahman.created += 1;
    }

    // esfand
    else if (thePersianMonthCreated === 12) {
      esfand.created += 1;
    }

    // farvardin
    if (thePersianMonthConfirm === 1) {
      farvardin.confirmed += 1;
    }
    // ordibehesht
    else if (thePersianMonthConfirm === 2) {
      ordibehesht.confirmed += 1;
    }
    // khordad
    else if (thePersianMonthConfirm === 3) {
      khordad.confirmed += 1;
    }
    // tir
    else if (thePersianMonthConfirm === 4) {
      tir.confirmed += 1;
    }
    // mordad
    else if (thePersianMonthConfirm === 5) {
      mordad.confirmed += 1;
    }
    // shahrivar
    else if (thePersianMonthConfirm === 6) {
      shahrivar.confirmed += 1;
    }
    // mehr
    else if (thePersianMonthConfirm === 7) {
      mehr.confirmed += 1;
    }
    // aban
    else if (thePersianMonthConfirm === 8) {
      aban.confirmed += 1;
    }
    // azar
    else if (thePersianMonthConfirm === 9) {
      azar.confirmed += 1;
    }
    // dey
    else if (thePersianMonthConfirm === 10) {
      dey.confirmed += 1;
    }
    // bahman
    else if (thePersianMonthConfirm === 11) {
      bahman.confirmed += 1;
    }
    // esfand
    else if (thePersianMonthConfirm === 12) {
      esfand.confirmed += 1;
    }
  }

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 1);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);

  const inTwoDays = needs.filter(
    (n) => new Date(n.confirmDate).getTime() >= twoDaysAgo.getTime(),
  );
  const inWeek = needs.filter(
    (n) => new Date(n.confirmDate).getTime() >= weekAgo.getTime(),
  );
  const inThirtyDays = needs.filter(
    (n) => new Date(n.confirmDate).getTime() >= monthAgo.getTime(),
  );
  const summary = {
    inTwoDays: inTwoDays.length,
    inWeek: inWeek.length,
    inThirtyDays: inThirtyDays.length,
  };

  return {
    summary,
    inMonth: {
      Farvardin: farvardin,
      Ordibehesht: ordibehesht,
      Khordad: khordad,
      Tir: tir,
      Mordad: mordad,
      Shahrivar: shahrivar,
      Mehr: mehr,
      Aban: aban,
      Azar: azar,
      Dey: dey,
      Bahman: bahman,
      Esfand: esfand,
    },
  };
}

// faster than the dictionary one below
export function getOrganizedNeeds(needsData) {
  const organizedNeeds = [[], [], [], []]; // [[not paid], [payment], [purchased/delivered Ngo], [Done]]
  if (needsData) {
    needsData = sortNeeds(needsData, 'created');
    for (let i = 0; i < needsData.length; i++) {
      // not Paid
      if (needsData[i].status === 0) {
        organizedNeeds[0].push(needsData[i]);
      }
      // Payment Received
      else if (
        needsData[i].status === PaymentStatusEnum.PARTIAL_PAY ||
        needsData[i].status === PaymentStatusEnum.COMPLETE_PAY
      ) {
        organizedNeeds[1].push(needsData[i]);
      }

      if (needsData[i].type === NeedTypeEnum.SERVICE) {
        // Payment sent to NGO
        if (needsData[i].status === ServiceStatusEnum.MONEY_TO_NGO) {
          organizedNeeds[2].push(needsData[i]);
        }
        // Delivered to child
        if (needsData[i].status === ServiceStatusEnum.DELIVERED) {
          organizedNeeds[3].push(needsData[i]);
        }
      } else if (needsData[i].type === NeedTypeEnum.PRODUCT) {
        // Purchased
        if (needsData[i].status === ProductStatusEnum.PURCHASED_PRODUCT) {
          organizedNeeds[2].push(needsData[i]);
        }
        // Delivered to Ngo
        if (needsData[i].status === ProductStatusEnum.DELIVERED_TO_NGO) {
          organizedNeeds[2].push(needsData[i]);
        }
        // Delivered to child
        if (needsData[i].status === ProductStatusEnum.DELIVERED) {
          organizedNeeds[3].push(needsData[i]);
        }
      }
    }
    organizedNeeds[3] = sortNeeds(organizedNeeds[3], 'doneAt');
    return organizedNeeds;
  }
}

export function sortNeeds(theNeeds: any[], sortBy: string) {
  return theNeeds.sort((a, b) => {
    // Sort needs by create date Ascending
    return new Date(b[sortBy]).getTime() - new Date(a[sortBy]).getTime();
  });
}

export function ticketNotifications(
  myTickets: TicketEntity[],
  flaskUserId: number,
) {
  const unReads = myTickets
    .filter(
      (t) =>
        t.lastAnnouncement !== AnnouncementEnum.ARRIVED_AT_NGO &&
        t.lastAnnouncement !== AnnouncementEnum.NGO_RECEIVED_MONEY,
    )
    .filter((t) => {
      // console.log(new Date(t.updatedAt));
      console.log(
        new Date(
          t.views.find((v) => v.flaskUserId === flaskUserId) &&
            t.views.find((v) => v.flaskUserId === flaskUserId).viewed,
        ),
      );

      // when a user creates a ticket, the participants won't have a view assigned to them
      const myView = t.views.find((v) => v.flaskUserId === flaskUserId);
      const latestView = t.views.find(
        (v) =>
          Date.parse(v.viewed.toUTCString()) ===
          Math.max(...t.views.map((t) => Date.parse(t.viewed.toUTCString()))),
      );

      // if (myView) {
      //   const { diff } = timeDifference(
      //     new Date(
      //       t.views.find((v) => v.flaskUserId === flaskUserId) &&
      //       t.views.find((v) => v.flaskUserId === flaskUserId).viewed,
      //     ), new Date(t.updatedAt))
      //   diffMilSeconds = diff

      // } else {
      //   diffMilSeconds = 1

      // }

      return (
        !myView ||
        (latestView.flaskUserId !== myView.flaskUserId &&
          Date.parse(myView.viewed.toUTCString()) <
            Date.parse(latestView.viewed.toUTCString()))
      );
    });

  return unReads;
}

export function isUnpayable(need: Need) {
  return (
    need.unavailable_from &&
    timeDifference(new Date(), need.unavailable_from).hh <
      PRODUCT_UNPAYABLE_PERIOD
  );
}

export function getVFamilyRoleString(vfamilyRole: number) {
  let roleString: string;
  if (vfamilyRole === VirtualFamilyRole.FATHER) {
    roleString = 'Father';
  } else if (vfamilyRole === VirtualFamilyRole.MOTHER) {
    roleString = 'Mother';
  } else if (vfamilyRole === VirtualFamilyRole.AMOO) {
    roleString = 'Ammo';
  } else if (vfamilyRole === VirtualFamilyRole.KHALEH) {
    roleString = 'Khaleh';
  } else if (vfamilyRole === VirtualFamilyRole.DAEI) {
    roleString = 'Daei';
  } else if (vfamilyRole === VirtualFamilyRole.AMME) {
    roleString = 'Amme';
  }
  return roleString;
}

// https://en.wikipedia.org/wiki/File:Boxplot_vs_PDF.svg
export function findQuartileGrant(
  userValues: {
    fatherCompletePay: any;
    motherCompletePay: any;
    amooCompletePay: any;
    khalehCompletePay: any;
    daeiCompletePay: any;
    ammeCompletePay: any;
  },
  childrenList: any[],
  Qs: {
    Q1: {
      father: number;
      mother: number;
      amoo: number;
      khaleh: number;
      daei: number;
      amme: number;
    };
    Q2: {
      father: number;
      mother: number;
      amoo: number;
      khaleh: number;
      daei: number;
      amme: number;
    };
    Q3: {
      father: number;
      mother: number;
      amoo: number;
      khaleh: number;
      daei: number;
      amme: number;
    };
    IQR?: {
      father: number;
      mother: number;
      amoo: number;
      khaleh: number;
      daei: number;
      amme: number;
    };
  },
) {
  let fatherQGrant: number;
  let motherQGrant: number;
  let amooQGrant: number;
  let khalehQGrant: number;
  let daeiQGrant: number;
  let ammeQGrant: number;

  // do not add Grant when even one child has no payment => user need to pay at least one need per child or leave family to gain Grant
  if (
    childrenList.find(
      (c) => c.caredFor === false && c.status === ChildExistence.AlivePresent,
    )
  ) {
    return {
      allChildrenCaredFor: false,
      fatherQGrant: 0,
      motherQGrant: 0,
      amooQGrant: 0,
      khalehQGrant: 0,
      daeiQGrant: 0,
      ammeQGrant: 0,
      avg: 0,
    };
  }
  // paid <= Q1, Q1 < paid <= Q2 , Q2 < paid <= Q3,  paid > Q3
  if (
    0 < userValues.fatherCompletePay &&
    userValues.fatherCompletePay <= Qs.Q1.father
  ) {
    fatherQGrant = Q1_LOWER_COEFFICIENT;
  } else if (
    Qs.Q1.father < userValues.fatherCompletePay &&
    userValues.fatherCompletePay <= Qs.Q2.father
  ) {
    fatherQGrant = Q1_TO_Q2_COEFFICIENT;
  } else if (
    Qs.Q2.father < userValues.fatherCompletePay &&
    userValues.fatherCompletePay <= Qs.Q3.father
  ) {
    fatherQGrant = Q2_TO_Q3_COEFFICIENT;
  } else if (userValues.fatherCompletePay > Qs.Q3.father) {
    fatherQGrant = Q3_UPPER_COEFFICIENT;
  } else {
    fatherQGrant = 0;
  }
  // Mother
  if (
    0 < userValues.motherCompletePay &&
    userValues.motherCompletePay <= Qs.Q1.mother
  ) {
    motherQGrant = Q1_LOWER_COEFFICIENT;
  } else if (
    Qs.Q1.mother < userValues.motherCompletePay &&
    userValues.motherCompletePay <= Qs.Q2.mother
  ) {
    motherQGrant = Q1_TO_Q2_COEFFICIENT;
  } else if (
    Qs.Q2.mother < userValues.motherCompletePay &&
    userValues.motherCompletePay <= Qs.Q3.mother
  ) {
    motherQGrant = Q2_TO_Q3_COEFFICIENT;
  } else if (userValues.motherCompletePay > Qs.Q3.mother) {
    motherQGrant = Q3_UPPER_COEFFICIENT;
  } else {
    motherQGrant = 0;
  }
  // Amoo
  if (
    0 < userValues.amooCompletePay &&
    userValues.amooCompletePay <= Qs.Q1.amoo
  ) {
    amooQGrant = Q1_LOWER_COEFFICIENT;
  } else if (
    Qs.Q1.amoo < userValues.amooCompletePay &&
    userValues.amooCompletePay <= Qs.Q2.amoo
  ) {
    amooQGrant = Q1_TO_Q2_COEFFICIENT;
  } else if (
    Qs.Q2.amoo < userValues.amooCompletePay &&
    userValues.amooCompletePay <= Qs.Q3.amoo
  ) {
    amooQGrant = Q2_TO_Q3_COEFFICIENT;
  } else if (userValues.amooCompletePay > Qs.Q3.amoo) {
    amooQGrant = Q3_UPPER_COEFFICIENT;
  } else {
    amooQGrant = 0;
  }
  // Khaleh
  if (
    0 < userValues.khalehCompletePay &&
    userValues.khalehCompletePay <= Qs.Q1.khaleh
  ) {
    khalehQGrant = Q1_LOWER_COEFFICIENT;
  } else if (
    Qs.Q1.khaleh < userValues.khalehCompletePay &&
    userValues.khalehCompletePay <= Qs.Q2.khaleh
  ) {
    khalehQGrant = Q1_TO_Q2_COEFFICIENT;
  } else if (
    Qs.Q2.khaleh < userValues.khalehCompletePay &&
    userValues.khalehCompletePay <= Qs.Q3.khaleh
  ) {
    khalehQGrant = Q2_TO_Q3_COEFFICIENT;
  } else if (userValues.khalehCompletePay > Qs.Q3.khaleh) {
    khalehQGrant = Q3_UPPER_COEFFICIENT;
  } else {
    khalehQGrant = 0;
  }
  // Daei
  if (
    0 < userValues.daeiCompletePay &&
    userValues.daeiCompletePay <= Qs.Q1.daei
  ) {
    daeiQGrant = Q1_LOWER_COEFFICIENT;
  } else if (
    Qs.Q1.daei < userValues.daeiCompletePay &&
    userValues.daeiCompletePay <= Qs.Q2.daei
  ) {
    daeiQGrant = Q1_TO_Q2_COEFFICIENT;
  } else if (
    Qs.Q2.daei < userValues.daeiCompletePay &&
    userValues.daeiCompletePay <= Qs.Q3.daei
  ) {
    daeiQGrant = Q2_TO_Q3_COEFFICIENT;
  } else if (userValues.daeiCompletePay > Qs.Q3.daei) {
    daeiQGrant = Q3_UPPER_COEFFICIENT;
  } else {
    daeiQGrant = 0;
  }
  // Amme
  if (
    0 < userValues.ammeCompletePay &&
    userValues.ammeCompletePay <= Qs.Q1.amme
  ) {
    ammeQGrant = Q1_LOWER_COEFFICIENT;
  } else if (
    Qs.Q1.amme < userValues.ammeCompletePay &&
    userValues.ammeCompletePay <= Qs.Q2.amme
  ) {
    ammeQGrant = Q1_TO_Q2_COEFFICIENT;
  } else if (
    Qs.Q2.amme < userValues.ammeCompletePay &&
    userValues.ammeCompletePay <= Qs.Q3.amme
  ) {
    ammeQGrant = Q2_TO_Q3_COEFFICIENT;
  } else if (userValues.ammeCompletePay > Qs.Q3.amme) {
    ammeQGrant = Q3_UPPER_COEFFICIENT;
  } else {
    ammeQGrant = 0;
  }
  let total = 0;
  if (fatherQGrant > 0) total++;
  if (motherQGrant > 0) total++;
  if (amooQGrant > 0) total++;
  if (khalehQGrant > 0) total++;
  if (daeiQGrant > 0) total++;
  if (ammeQGrant > 0) total++;

  const avg =
    (fatherQGrant +
      motherQGrant +
      amooQGrant +
      khalehQGrant +
      daeiQGrant +
      ammeQGrant) /
    total;

  return {
    allChildrenCaredFor: true,
    fatherQGrant,
    motherQGrant,
    amooQGrant,
    khalehQGrant,
    daeiQGrant,
    ammeQGrant,
    avg,
  };
}

export function getScattered(
  data: any[],
  vRole: VirtualFamilyRole,
  medianList: any[],
) {
  const series = [];
  const usersPays = [];
  if (data) {
    // 1- go over all needs and seperate users who has paid
    data.forEach((n) => {
      n.participants.forEach((partic) => {
        // get the payment of the participant
        const payment = n.payments.find(
          (p) => p.id_user === partic.id_user && p.need_amount > 0,
        );
        if (payment && payment.id_user) {
          usersPays.push({
            userId: payment.id_user,
            created: payment.created,
          });
        }
      });
    });
  }
  // 2- count total pays per users
  const listOfIds = [];
  const finalList = [];
  usersPays.forEach((u) => {
    const onlyThisUserPays = usersPays.filter((p) => p.userId === u.userId);
    if (!listOfIds.find((item) => item.userId === u.userId)) {
      listOfIds.push({ userId: u.userId });
      series.push({ userId: u.userId, total: onlyThisUserPays.length });
    }
  });

  // {userId: 126, total: 101}
  const sorted = series.sort((a, b) => a.total - b.total);
  const myList = [];
  // [[1,162],[4, 5], ...]
  sorted.forEach((s) => {
    if (!myList.find((e) => e === s.total)) {
      myList.push(s.total);
      finalList.push([
        s.total,
        sorted.filter((o) => o.total === s.total).length,
      ]);
    }
  });

  // for quartile
  medianList.push({ [vRole]: finalList.map((el) => el[0]) });
  return finalList;
}

export function truncateString(str: string, num: number) {
  // If the length of str is less than or equal to num
  // just return str--don't truncate it.
  if (str.length <= num) {
    return str;
  }
  // Return str truncated with '...' concatenated to the end of str.
  return str.slice(0, num) + '...';
}

// format to yyyy-mm-dd
export function formatDate(date) {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

export function shuffleArray(array: any[]) {
  let currentIndex = array.length,
    randomIndex: number;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export function capitalizeFirstLetter(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function fetchCampaignCode(
  name: CampaignNameEnum,
  type: CampaignTypeEnum,
) {
  const today = new Date();
  const pMonth = persianMonth(today); // If it is January, getMonth() will return 0
  const pYear = persianYear(today);
  return `${type}:${name}-${pMonth}/${pYear}`;
}

export function getMonthsAgo(date: Date, priorMonths: number) {
  // accessing month of the date
  const month = date.getMonth();
  // subtracting required number of months
  date.setMonth(month - priorMonths);
  return date;
}

export function urlSimilarityPercentage(url1: string, url2: string) {
  // Convert URLs to lowercase to make the comparison case-insensitive
  url1 = url1.toLowerCase();
  url2 = url2.toLowerCase();

  // Calculate Levenshtein distance
  function levenshteinDistance(s1: string | any[], s2: string | any[]) {
    const len1 = s1.length;
    const len2 = s2.length;
    const matrix = [];

    // Initialize the matrix with default values
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // Calculate Levenshtein distance
    for (let j = 1; j <= len2; j++) {
      for (let i = 1; i <= len1; i++) {
        if (s1[i - 1] === s2[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1, // deletion
          );
        }
      }
    }

    return matrix[len1][len2];
  }

  // Calculate similarity percentage
  const distance = levenshteinDistance(url1, url2);
  const maxLength = Math.max(url1.length, url2.length);
  const similarityPercentage = ((maxLength - distance) / maxLength) * 100;

  return similarityPercentage.toFixed(2);
}

export function getSimilarityPercentage(sentence1: string, sentence2: string) {
  // Convert sentences to sets of words
  const set1 = new Set(sentence1.split(' '));
  const set2 = new Set(sentence2.split(' '));

  // Calculate intersection and union of the sets
  let intersection = 0;
  set1.forEach((word) => {
    if (set2.has(word)) {
      intersection++;
    }
  });
  const union = set1.size + set2.size - intersection;

  // Calculate Jaccard similarity coefficient
  const similarity = intersection / union;

  // Convert similarity coefficient to percentage
  const similarityPercentage = Math.round(similarity * 100);

  return similarityPercentage;
}
