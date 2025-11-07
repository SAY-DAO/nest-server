import { CheckPointType } from './checkpoint-type.enum';

export const CheckPointCategory: Record<string, CheckPointType[]> = {
  Engineering: [
    CheckPointType.FEATURE,
    CheckPointType.BUG_FIX,
    CheckPointType.HOTFIX,
    CheckPointType.DEPLOY,
    CheckPointType.ROLLBACK,
    CheckPointType.DB_MIGRATION,
    CheckPointType.CODE_REVIEW,
    CheckPointType.PERFORMANCE,
    CheckPointType.MONITORING,
    CheckPointType.AUTOMATION,
    CheckPointType.BACKUP,
    CheckPointType.SECURITY,
    CheckPointType.CONFIG_CHANGE,
  ],
  Product: [
    CheckPointType.ROADMAP,
    CheckPointType.USER_RESEARCH,
    CheckPointType.TESTING,
  ],
  Design: [CheckPointType.DESIGN],
  Marketing: [
    CheckPointType.CONTENT,
    CheckPointType.MARKETING_CAMPAIGN,
    CheckPointType.GROWTH_EXPERIMENT,
  ],
  Customer: [
    CheckPointType.CUSTOMER_SUPPORT,
    CheckPointType.ONBOARDING,
    CheckPointType.PARTNERSHIPS,
    CheckPointType.INCIDENT_RESPONSE,
  ],
  Business: [
    CheckPointType.LEGAL,
    CheckPointType.FINANCE,
    CheckPointType.HR,
    CheckPointType.MEETING,
    CheckPointType.TRAINING,
  ],
  Internal: [
    CheckPointType.CHILD_LEFT,
    CheckPointType.CHILD_JOINED,
    CheckPointType.NGO_JOINED,
    CheckPointType.MONTHLY_REPORT,
  ],
};
