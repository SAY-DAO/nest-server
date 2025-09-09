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
  ],
  Product: [
    CheckPointType.ROADMAP,
    CheckPointType.PRODUCT_SPEC,
    CheckPointType.USER_RESEARCH,
    CheckPointType.QA_APPROVAL,
  ],
  Design: [
    CheckPointType.DESIGN,
    CheckPointType.UX,
    CheckPointType.BRANDING,
    CheckPointType.ASSET_PRODUCTION,
  ],
  Marketing: [
    CheckPointType.CONTENT,
    CheckPointType.COPYWRITING,
    CheckPointType.SEO,
    CheckPointType.SOCIAL,
    CheckPointType.EMAIL,
    CheckPointType.PAID_ADS,
    CheckPointType.MARKETING_CAMPAIGN,
    CheckPointType.GROWTH_EXPERIMENT,
  ],
  Customer: [
    CheckPointType.CUSTOMER_SUPPORT,
    CheckPointType.ONBOARDING,
    CheckPointType.SALES,
    CheckPointType.BIZDEV,
    CheckPointType.INCIDENT,
  ],
  Business: [
    CheckPointType.LEGAL,
    CheckPointType.FINANCE,
    CheckPointType.HR,
    CheckPointType.MEETING,
    CheckPointType.TRAINING,
  ],
};
