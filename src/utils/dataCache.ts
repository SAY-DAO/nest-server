import { VirtualFamilyRole } from 'src/types/interfaces/interface';

export default class DataCache {
  familyData = null;

  store = ({
    fathersAvg,
    mothersAvg,
    amoosAvg,
    daeisAvg,
    khalehsAvg,
    ammesAvg,
    fatherData,
    motherData,
    amooData,
    khalehData,
    daeiData,
    ammeData,
  }) => {
    this.familyData = {
      fathersAvg,
      mothersAvg,
      amoosAvg,
      daeisAvg,
      khalehsAvg,
      ammesAvg,
      fatherData,
      motherData,
      amooData,
      khalehData,
      daeiData,
      ammeData,
    };
  };

  customFilter = (vFamilyRole: VirtualFamilyRole) => {
    const result = this.familyData[vFamilyRole];
    return result;
  };

  fetchFamilyAll = () => this.familyData;
}
