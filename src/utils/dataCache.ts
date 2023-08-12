import { VirtualFamilyRole } from 'src/types/interfaces/interface';
import { quantileSeq, median } from 'mathjs';
import { getScattered, removeDuplicates } from './helpers';

export default class DataCache {
  childrenEcosystem = null;
  panelAccessToken = {};
  dappAccessToken = {};
  familyData = null;
  familyRolesCount = null;
  childActiveFamilies = null;
  medianList = [];
  midjourneyList = [];

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

  storePanelAccessToken = (token: string, flaskSwId: number) => {
    this.panelAccessToken[flaskSwId] = token;
  };

  storeDappAccessToken = (token: string, flaskFamilyId: number) => {
    this.dappAccessToken[flaskFamilyId] = token;
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
    this.theMedian();
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

  fetchMidjourney = () =>
    (this.midjourneyList = removeDuplicates(this.midjourneyList));

  fetchChildrenEcosystem = () => this.childrenEcosystem;
  fetchFamilyAll = () => this.familyData;
  fetchFamilyCount = () => this.familyRolesCount;
  fetchActiveFamilies = () => this.childActiveFamilies;
  fetchPanelAccessToken = () => this.panelAccessToken;
  fetchDappAccessToken = () => this.dappAccessToken;
  deletePanelAccessToken = (flaskSwId: number) => this.panelAccessToken[flaskSwId];
  deleteDappAccessToken = (flaskFamilyId: number) => this.dappAccessToken[flaskFamilyId];

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

  theMedian() {
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
      // median of lower half
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
      IQR: {
        father: 0,
        mother: 0,
        amoo: 0,
        khaleh: 0,
        daei: 0,
        amme: 0,
      },
    };
    this.medianList.forEach((item) => {
      if (item[VirtualFamilyRole.FATHER]) {
        medianObject.father = median(item[VirtualFamilyRole.FATHER]);
        IQRObject.Q1.father = Number(
          quantileSeq(item[VirtualFamilyRole.FATHER], 0),
        );
        IQRObject.Q2.father = Number(
          quantileSeq(item[VirtualFamilyRole.FATHER], 0.5),
        );
        IQRObject.Q3.father = Number(
          quantileSeq(item[VirtualFamilyRole.FATHER], 0.75),
        );
        IQRObject.IQR.father = IQRObject.Q3.father - IQRObject.Q1.father;
      }
      if (item[VirtualFamilyRole.MOTHER]) {
        medianObject.mother = median(item[VirtualFamilyRole.MOTHER]);
        IQRObject.Q1.mother = Number(
          quantileSeq(item[VirtualFamilyRole.MOTHER], 0),
        );
        IQRObject.Q2.mother = Number(
          quantileSeq(item[VirtualFamilyRole.MOTHER], 0.5),
        );
        IQRObject.Q3.mother = Number(
          quantileSeq(item[VirtualFamilyRole.MOTHER], 0.75),
        );
        IQRObject.IQR.mother = IQRObject.Q3.mother - IQRObject.Q1.mother;
      }
      if (item[VirtualFamilyRole.AMOO]) {
        medianObject.amoo = median(item[VirtualFamilyRole.AMOO]);
        IQRObject.Q1.amoo = Number(
          quantileSeq(item[VirtualFamilyRole.AMOO], 0),
        );
        IQRObject.Q2.amoo = Number(
          quantileSeq(item[VirtualFamilyRole.AMOO], 0.5),
        );
        IQRObject.Q3.amoo = Number(
          quantileSeq(item[VirtualFamilyRole.AMOO], 0.75),
        );
        IQRObject.IQR.amoo = IQRObject.Q3.amoo - IQRObject.Q1.amoo;
      }
      if (item[VirtualFamilyRole.KHALEH]) {
        medianObject.khaleh = median(item[VirtualFamilyRole.KHALEH]);
        IQRObject.Q1.khaleh = Number(
          quantileSeq(item[VirtualFamilyRole.KHALEH], 0),
        );
        IQRObject.Q2.khaleh = Number(
          quantileSeq(item[VirtualFamilyRole.KHALEH], 0.5),
        );
        IQRObject.Q3.khaleh = Number(
          quantileSeq(item[VirtualFamilyRole.KHALEH], 0.75),
        );
        IQRObject.IQR.khaleh = IQRObject.Q3.khaleh - IQRObject.Q1.khaleh;
      }
      if (item[VirtualFamilyRole.DAEI]) {
        medianObject.daei = median(item[VirtualFamilyRole.DAEI]);
        IQRObject.Q1.daei = Number(
          quantileSeq(item[VirtualFamilyRole.DAEI], 0),
        );
        IQRObject.Q2.daei = Number(
          quantileSeq(item[VirtualFamilyRole.DAEI], 0.5),
        );
        IQRObject.Q3.daei = Number(
          quantileSeq(item[VirtualFamilyRole.DAEI], 0.75),
        );
        IQRObject.IQR.daei = IQRObject.Q3.daei - IQRObject.Q1.daei;
      }
      if (item[VirtualFamilyRole.AMME]) {
        medianObject.amme = median(item[VirtualFamilyRole.AMME]);
        IQRObject.Q1.amme = Number(
          quantileSeq(item[VirtualFamilyRole.AMME], 0),
        );
        IQRObject.Q2.amme = Number(
          quantileSeq(item[VirtualFamilyRole.AMME], 0.5),
        );
        IQRObject.Q3.amme = Number(
          quantileSeq(item[VirtualFamilyRole.AMME], 0.75),
        );
        IQRObject.IQR.amme = IQRObject.Q3.amme - IQRObject.Q1.amme;
      }
    });

    return { medianObject, IQRObject };
  }
}
