export class SummaryDto {
  children: any;
  ngos: any;
  rolesCount: {
    fathersCount: number;
    mothersCount: number;
    amoosCount: number;
    khalehsCount: number;
    daeisCount: number;
    ammesCount: number;
    created: Date;
  };
  totalUsers: number;
  totalNotDoneNeeds: number;
  totalPayments: number;
  totalDoneNeeds: number;
  totalFamilyMembers: number;
}
