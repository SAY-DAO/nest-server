export class SummaryDto {
  children: any;
  ngos: any;
  activeUsersCount: {
    activeFathersCount: number;
    activeMothersCount: number;
    activeAmoosCount: number;
    activeKhalehsCount: number;
    activeDaeisCount: number;
    activeAmmesCount: number;
    created: Date;
  };
  totalUsers: number;
  totalNotDoneNeeds: number;
  totalPayments: number;
  totalDoneNeeds: number;
  totalFamilyMembers: number;
}
