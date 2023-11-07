import {
  AuthenticationType,
  FlaskUserTypesEnum,
  SAYPlatformRoles,
  VirtualFamilyRole,
} from 'src/types/interfaces/interface';
import { quantileSeq, median } from 'mathjs';
import { getScattered } from './helpers';

export default class DataCache {
  childrenEcosystem = null;
  authentication: {
    [flaskId: number]: AuthenticationType;
  } = {};

  familyData = null;
  familyRolesCount = null;
  childActiveFamilies = null;
  medianList = [];
  midjourneyList = [];
  countChildrenNoNeeds = null;

  updateChildrenNoNeeds(count: number) {
    this.countChildrenNoNeeds = count;
  }

  storeActiveFamilies = (activesList) => {
    this.childActiveFamilies = { actives: activesList, created: new Date() };
  };
  // panel analytic bar chart
  storeChildrenEcosystem = (result: {
    meanNeedsPerChild: number;
    meanConfirmedPerChild: number;
    meanUnConfirmedPerChild: number;
    meanConfirmedNotPaidPerChild: number;
    meanCompletePayPerChild: number;
    meanPartialPayPerChild: number;
    meanPurchasedPerChild: number;
    meanMoneyToNgoPerChild: number;
    meanDeliveredNgoPerChild: number;
    meanDeliveredChildPerChild: number;
    totalFamilies: number;
    totalFamilyMembers: number;
    meanFamilyMembers: number;
    childrenList: any[];
  }) => {
    this.childrenEcosystem = { ...result, created: new Date() };
  };

  storePanelAccessToken = (
    token: string,
    flaskSwId: number,
    flaskUserType: FlaskUserTypesEnum,
    sayRole: SAYPlatformRoles,
    createdAt: Date,
  ) => {
    this.authentication[flaskSwId] = {
      token,
      flaskUserType,
      sayRole,
      createdAt,
      isExpired: false,
    };
  };

  storeDappAccessToken = (
    token: string,
    flaskFamilyId: number,
    createdAt: Date,
  ) => {
    this.authentication[flaskFamilyId] = {
      token,
      sayRole: SAYPlatformRoles.FAMILY,
      flaskUserType: FlaskUserTypesEnum.FAMILY,
      createdAt,
      isExpired: false,
    };
  };

  storeMidjourny = (list: any[]) => {
    list.forEach((e) => this.midjourneyList.push(e));
  };

  // dApp user ratio in different roles / distance ratio
  storeFamilyData = ({
    fathersData,
    mothersData,
    amoosData,
    khalehsData,
    daeisData,
    ammesData,
  }) => {
    this.familyData = {
      fathersData,
      mothersData,
      amoosData,
      khalehsData,
      daeisData,
      ammesData,
      created: new Date(),
    };
    this.roleScatteredData();
    this.theQuartile();
  };

  // dApp user ratio in different roles / distance ratio
  storeRolesCount = ({
    fathersCount,
    mothersCount,
    amoosCount,
    khalehsCount,
    daeisCount,
    ammesCount,
  }) => {
    this.familyRolesCount = {
      fathersCount,
      mothersCount,
      amoosCount,
      khalehsCount,
      daeisCount,
      ammesCount,
      created: new Date(),
    };
  };

  fetchMidjourney = () => (this.midjourneyList = this.midjourneyList);
  fetchChildrenNoNeeds() {
    return this.countChildrenNoNeeds;
  }
  fetchChildrenEcosystem = () => this.childrenEcosystem;
  fetchFamilyAll = () => this.familyData;
  fetchFamilyCount = () => this.familyRolesCount;
  fetchActiveFamilies = () => this.childActiveFamilies;
  fetchPanelAuthentication = (flaskSwId: number) => {
    if (this.authentication[String(flaskSwId)]) {
      return this.authentication[flaskSwId];
    } else {
      return null;
    }
  };
  fetchDappAuthentication = (flaskFamilyId: number) => {
    if (this.authentication[String(flaskFamilyId)]) {
      return this.authentication[flaskFamilyId];
    } else {
      return null;
    }
  };

  deletePanelAccessToken = (flaskSwId: number) =>
    (this.authentication[String(flaskSwId)] = {
      ...this.authentication[String(flaskSwId)],
      isExpired: true,
    });
  deleteDappAccessToken = (flaskFamilyId: number) =>
    (this.authentication[String(flaskFamilyId)] = {
      ...this.authentication[String(flaskFamilyId)],
      isExpired: true,
    });

  // panel analytic scatter chart
  roleScatteredData() {
    return {
      father: getScattered(
        this.familyData.fathersData,
        VirtualFamilyRole.FATHER,
        this.medianList,
      ),
      mother: getScattered(
        this.familyData.mothersData,
        VirtualFamilyRole.MOTHER,
        this.medianList,
      ),
      amoo: getScattered(
        this.familyData.amoosData,
        VirtualFamilyRole.AMOO,
        this.medianList,
      ),
      khaleh: getScattered(
        this.familyData.khalehsData,
        VirtualFamilyRole.KHALEH,
        this.medianList,
      ),
      daei: getScattered(
        this.familyData.daeisData,
        VirtualFamilyRole.DAEI,
        this.medianList,
      ),
      amme: getScattered(
        this.familyData.ammesData,
        VirtualFamilyRole.AMME,
        this.medianList,
      ),
    };
  }

  theQuartile() {
    const medianObject = {
      father: 0,
      mother: 0,
      amoo: 0,
      khaleh: 0,
      daei: 0,
      amme: 0,
    };

    //  Q1 (also called the lower quartile), Q2 (the median), and Q3 (also called the upper quartile).
    // delivered <= Q1, Q1 < delivered <= Q2 , Q2 < delivered <= Q3,  delivered > Q3
    const IQRObject = {
      min: {
        father: 0,
        mother: 0,
        amoo: 0,
        khaleh: 0,
        daei: 0,
        amme: 0,
      },
      Q1: {
        father: 0,
        mother: 0,
        amoo: 0,
        khaleh: 0,
        daei: 0,
        amme: 0,
      },
      Q2: {
        father: 0,
        mother: 0,
        amoo: 0,
        khaleh: 0,
        daei: 0,
        amme: 0,
      },
      // median of upper half
      Q3: {
        father: 0,
        mother: 0,
        amoo: 0,
        khaleh: 0,
        daei: 0,
        amme: 0,
      },
      max: {
        father: 0,
        mother: 0,
        amoo: 0,
        khaleh: 0,
        daei: 0,
        amme: 0,
      },
      IQR: {
        father: 0,
        mother: 0,
        amoo: 0,
        khaleh: 0,
        daei: 0,
        amme: 0,
      },
    };
    // this.medianList = { father: [[1,2], [1,2], [2,3], [1,6], [#users, totalPaid],...], mother: [...], ...}
    // [#users, totalPaid]
    this.medianList.forEach((item) => {
      const father = item[VirtualFamilyRole.FATHER];
      const mother = item[VirtualFamilyRole.MOTHER];
      const amoo = item[VirtualFamilyRole.AMOO];
      const khaleh = item[VirtualFamilyRole.KHALEH];
      const daei = item[VirtualFamilyRole.DAEI];
      const amme = item[VirtualFamilyRole.AMME];

      if (father && father[0]) {
        medianObject.father = median(father);
        IQRObject.min.father = Number(quantileSeq(father, 0)); //min
        IQRObject.Q1.father = Number(quantileSeq(father, 0.25));
        IQRObject.Q2.father = Number(quantileSeq(father, 0.5));
        IQRObject.Q3.father = Number(quantileSeq(father, 0.75));
        IQRObject.max.father = Number(quantileSeq(father, 1));
        IQRObject.IQR.father = IQRObject.Q3.father - IQRObject.Q1.father;
      }
      if (mother && mother[0]) {
        medianObject.mother = median(mother);
        IQRObject.min.mother = Number(quantileSeq(mother, 0)); // min
        IQRObject.Q1.mother = Number(quantileSeq(mother, 0.25));
        IQRObject.Q2.mother = Number(quantileSeq(mother, 0.5));
        IQRObject.Q3.mother = Number(quantileSeq(mother, 0.75));
        IQRObject.max.mother = Number(quantileSeq(mother, 1)); // max
        IQRObject.IQR.mother = IQRObject.Q3.mother - IQRObject.Q1.mother;
      }
      if (amoo && amoo[0]) {
        medianObject.amoo = median(amoo);
        IQRObject.min.amoo = Number(quantileSeq(amoo, 0)); // min
        IQRObject.Q1.amoo = Number(quantileSeq(amoo, 0.25));
        IQRObject.Q2.amoo = Number(quantileSeq(amoo, 0.5));
        IQRObject.Q3.amoo = Number(quantileSeq(amoo, 0.75));
        IQRObject.max.amoo = Number(quantileSeq(amoo, 1)); // max
        IQRObject.IQR.amoo = IQRObject.Q3.amoo - IQRObject.Q1.amoo;
      }
      if (khaleh && khaleh[0]) {
        medianObject.khaleh = median(khaleh);
        IQRObject.min.khaleh = Number(quantileSeq(khaleh, 0)); // min
        IQRObject.Q1.khaleh = Number(quantileSeq(khaleh, 0.25));
        IQRObject.Q2.khaleh = Number(quantileSeq(khaleh, 0.5));
        IQRObject.Q3.khaleh = Number(quantileSeq(khaleh, 0.75));
        IQRObject.max.khaleh = Number(quantileSeq(khaleh, 1)); // max
        IQRObject.IQR.khaleh = IQRObject.Q3.khaleh - IQRObject.Q1.khaleh;
      }
      if (daei && daei[0]) {
        medianObject.daei = median(daei);
        IQRObject.min.daei = Number(quantileSeq(daei, 0)); // min
        IQRObject.Q1.daei = Number(quantileSeq(daei, 0.25));
        IQRObject.Q2.daei = Number(quantileSeq(daei, 0.5));
        IQRObject.Q3.daei = Number(quantileSeq(daei, 0.75));
        IQRObject.max.daei = Number(quantileSeq(daei, 1)); // max
        IQRObject.IQR.daei = IQRObject.Q3.daei - IQRObject.Q1.daei;
      }
      if (amme && amme[0]) {
        medianObject.amme = median(amme);
        IQRObject.min.amme = Number(quantileSeq(amme, 0)); // min
        IQRObject.Q1.amme = Number(quantileSeq(amme, 0.25));
        IQRObject.Q2.amme = Number(quantileSeq(amme, 0.5));
        IQRObject.Q3.amme = Number(quantileSeq(amme, 0.75));
        IQRObject.max.amme = Number(quantileSeq(amme, 1)); // max
        IQRObject.IQR.amme = IQRObject.Q3.amme - IQRObject.Q1.amme;
      }
    });

    return { medianObject, IQRObject };
  }
}
