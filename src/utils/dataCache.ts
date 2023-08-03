import { VirtualFamilyRole } from 'src/types/interfaces/interface';
import { quantileSeq, median } from 'mathjs';

export default class DataCache {
  familyData = null;
  familyRolesCount = null;
  medianList = [];

  store = ({
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
    };
    this.roleScatteredData();
    this.theMedian();
  };


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
    };
  };

  customFilter = (vFamilyRole: VirtualFamilyRole) => {
    const result = this.familyData[vFamilyRole];
    return result;
  };

  fetchFamilyAll = () => this.familyData;
  fetchFamilyCount = () => this.familyRolesCount;

  getScattered(data: any[], vRole: VirtualFamilyRole) {
    const series = [];
    const usersPays = [];
    if (data) {
      data.forEach((n) => {
        n.participants.forEach((partic) => {
          // get the payment of the participant
          const payment = n.payments.find((p) => p.id_user === partic.id_user);
          if (payment && payment.id_user) {
            usersPays.push({
              userId: payment.id_user,
              created: payment.created,
            });
          }
        });
      });
    }
    const listOfIds = [];
    usersPays.forEach((u) => {
      const onlyThisUserPays = usersPays.filter((p) => p.userId === u.userId);
      if (!listOfIds.find((item) => item.userId === u.userId)) {
        listOfIds.push({ userId: u.userId });
        series.push({ userId: u.userId, total: onlyThisUserPays.length });
      }
    });

    // {userId: 126, total: 101}
    const sorted = series.sort((a, b) => a.total - b.total);

    // const listOfIds2 = [];
    const scatteredData = sorted.map((s) => {
      return [s.total, sorted.filter((o) => o.total === s.total).length];
    });
    // [[1,162],[4, 5], ...]

    this.medianList.push({ [vRole]: scatteredData.map((el) => el[0]) });
    return scatteredData;
  }

  roleScatteredData() {
    return {
      father: this.getScattered(
        this.familyData.fathersData,
        VirtualFamilyRole.FATHER,
      ),
      mother: this.getScattered(
        this.familyData.mothersData,
        VirtualFamilyRole.MOTHER,
      ),
      amoo: this.getScattered(this.familyData.amoosData, VirtualFamilyRole.AMOO),
      khaleh: this.getScattered(
        this.familyData.khalehsData,
        VirtualFamilyRole.KHALEH,
      ),
      daie: this.getScattered(this.familyData.daeisData, VirtualFamilyRole.DAEI),
      amme: this.getScattered(this.familyData.ammesData, VirtualFamilyRole.AMME),
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
    console.log(this.medianList);
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
