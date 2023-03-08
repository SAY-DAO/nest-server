import { TicketEntity } from 'src/entities/ticket.entity';
import { SwmypageNeeds } from 'src/generated-sources/openapi';
import {
  NeedTypeEnum,
  PaymentStatusEnum,
  ProductStatusEnum,
  RolesEnum,
  SAYPlatformRoles,
  ServiceStatusEnum,
} from 'src/types/interface';

export function convertFlaskToSayRoles(flakUserType: number) {
  let role: SAYPlatformRoles;
  if (flakUserType === RolesEnum.SAY_SUPERVISOR) {
    role = SAYPlatformRoles.AUDITOR;
  } else if (flakUserType === RolesEnum.ADMIN) {
    role = SAYPlatformRoles.AUDITOR;
  } else if (flakUserType === RolesEnum.SUPER_ADMIN) {
    role = SAYPlatformRoles.AUDITOR;
  } else if (flakUserType === RolesEnum.SOCIAL_WORKER) {
    role = SAYPlatformRoles.SOCIAL_WORKER;
  } else if (flakUserType === RolesEnum.COORDINATOR) {
    role = SAYPlatformRoles.PURCHASER;
  } else if (flakUserType === RolesEnum.NGO_SUPERVISOR) {
    role = SAYPlatformRoles.NGO_SUPERVISOR;
  } else if (!flakUserType) {
    role = SAYPlatformRoles.FAMILY;
  }
  return role;
}

export function dateConvertor(value: string) {
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

export function persianMonth(value: Date) {
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

export function timeDifference(time1: Date, time2: Date) {
  const diff = time2.getTime() - time1.getTime();
  let msec = diff;
  const hh = Math.floor(msec / 1000 / 60 / 60);
  msec -= hh * 1000 * 60 * 60;
  const mm = Math.floor(msec / 1000 / 60);
  msec -= mm * 1000 * 60;
  const ss = Math.floor(msec / 1000);
  msec -= ss * 1000;
  return { hh, mm, ss }
}

export function timeDifferenceWithComment(time1: number, time2: number, comment: string) {
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

export function getNeedsTimeLine(needs: SwmypageNeeds[], who: string) {
  let summary: { inTwoDays: number; inWeek: number; inThirtyDays: number };
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

  const currentMonth = parseInt(
    new Intl.DateTimeFormat('en-US-u-ca-persian', { month: 'numeric' }).format(
      new Date(),
    ),
  );
  const currentYear = parseInt(
    new Intl.DateTimeFormat('en-US-u-ca-persian', { year: 'numeric' }).format(
      new Date(),
    ),
  );
  for (let i = 0; i < needs.length; i++) {
    const thePersianMonthCreated = persianMonth(new Date(needs[i].created));
    const thePersianMonthConfirm = persianMonth(new Date(needs[i].confirmDate));
    const thePersianYearCreated = persianYear(new Date(needs[i].created));
    const thePersianYearConfirm = persianYear(new Date(needs[i].confirmDate));

    if (
      currentMonth - 6 < thePersianMonthCreated &&
      thePersianYearCreated === currentYear
    ) {
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
    }
    if (
      currentMonth - 6 < thePersianMonthConfirm &&
      thePersianYearConfirm === currentYear
    ) {
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
  }

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 1);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);

  if (who == 'createdBy') {
    const inTwoDays = needs.filter(
      (n) => new Date(n.confirmDate).getTime() >= twoDaysAgo.getTime(),
    );
    const inWeek = needs.filter(
      (n) => new Date(n.confirmDate).getTime() >= weekAgo.getTime(),
    );
    const inThirtyDays = needs.filter(
      (n) => new Date(n.confirmDate).getTime() >= monthAgo.getTime(),
    );
    summary = {
      inTwoDays: inTwoDays.length,
      inWeek: inWeek.length,
      inThirtyDays: inThirtyDays.length,
    };
  } else {
    const inTwoDays = needs.filter(
      (n) => new Date(n.confirmDate).getTime() >= twoDaysAgo.getTime(),
    );
    const inWeek = needs.filter(
      (n) => new Date(n.confirmDate).getTime() >= weekAgo.getTime(),
    );
    const inThirtyDays = needs.filter(
      (n) => new Date(n.confirmDate).getTime() >= monthAgo.getTime(),
    );
    summary = {
      inTwoDays: inTwoDays.length,
      inWeek: inWeek.length,
      inThirtyDays: inThirtyDays.length,
    };
  }
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
export function getOrganizedNeeds(needsData: SwmypageNeeds[]) {
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

export function sortNeeds(theNeeds: SwmypageNeeds[], sortBy: string) {
  return theNeeds.sort((a, b) => {
    // Sort needs by create date Ascending
    return new Date(b[sortBy]).getTime() - new Date(a[sortBy]).getTime();
  });
}

export function ticketNotifications(
  tickets: TicketEntity[],
  flaskUserId: number,
) {

  console.log((new Date(tickets[0].updatedAt)))
  console.log(
    new Date(
      tickets[0].views.find((v) => v.flaskUserId === flaskUserId) &&
      tickets[0].views.find((v) => v.flaskUserId === flaskUserId).viewed,

    ))
  const result = timeDifference(
    new Date(
      tickets[0].views.find((v) => v.flaskUserId === flaskUserId) &&
      tickets[0].views.find((v) => v.flaskUserId === flaskUserId).viewed,
    ), new Date(tickets[0].updatedAt))
  console.log(result)

  const unReads = tickets.filter(
    (t) => {
      const { hh, mm, ss } = timeDifference(
        new Date(
          t.views.find((v) => v.flaskUserId === flaskUserId) &&
          t.views.find((v) => v.flaskUserId === flaskUserId).viewed,
        ), new Date(tickets[0].updatedAt))
      const hourDiff = hh
      const minatuteDiff = mm
      const secondDiff = ss
      return hourDiff >= 0 && mm >= 0 && ss >= 5
    }
  );
  return unReads;
}
