// src/checkpoint/checkpoint-type.labels.ts
import { CheckPointType } from './checkpoint-type.enum';

export const CheckPointTypeLabel: Record<CheckPointType, string> = {
  [CheckPointType.FEATURE]: 'Feature / release',
  [CheckPointType.BUG_FIX]: 'Bug fix',
  [CheckPointType.HOTFIX]: 'Hotfix (urgent)',
  [CheckPointType.DEPLOY]: 'Deployment',
  [CheckPointType.ROLLBACK]: 'Rollback',
  [CheckPointType.DB_MIGRATION]: 'DB migration',
  [CheckPointType.CODE_REVIEW]: 'Code review',
  [CheckPointType.PERFORMANCE]: 'Performance / tuning',

  [CheckPointType.ROADMAP]: 'Product roadmap item',
  [CheckPointType.PRODUCT_SPEC]: 'Product spec',
  [CheckPointType.USER_RESEARCH]: 'User research',
  [CheckPointType.QA_APPROVAL]: 'QA approval',

  [CheckPointType.DESIGN]: 'Design task',
  [CheckPointType.UX]: 'UX work',
  [CheckPointType.BRANDING]: 'Branding',
  [CheckPointType.ASSET_PRODUCTION]: 'Asset production (video/images)',

  [CheckPointType.CONTENT]: 'Content creation',
  [CheckPointType.COPYWRITING]: 'Copywriting',
  [CheckPointType.SEO]: 'SEO work',
  [CheckPointType.SOCIAL]: 'Social media',
  [CheckPointType.EMAIL]: 'Email campaign',
  [CheckPointType.PAID_ADS]: 'Paid advertising',
  [CheckPointType.MARKETING_CAMPAIGN]: 'Marketing campaign',
  [CheckPointType.GROWTH_EXPERIMENT]: 'Growth experiment',

  [CheckPointType.CUSTOMER_SUPPORT]: 'Customer support action',
  [CheckPointType.ONBOARDING]: 'Onboarding',
  [CheckPointType.SALES]: 'Sales activity',
  [CheckPointType.BIZDEV]: 'Business development',
  [CheckPointType.INCIDENT]: 'Incident / outage',

  [CheckPointType.MONITORING]: 'Monitoring / alerts',
  [CheckPointType.BACKUP]: 'Backup / snapshot',
  [CheckPointType.SECURITY]: 'Security / vuln fix',
  [CheckPointType.CONFIG_CHANGE]: 'Configuration change',
  [CheckPointType.AUTOMATION]: 'Automation / CI-CD',
  [CheckPointType.LEGAL]: 'Legal',
  [CheckPointType.FINANCE]: 'Finance',
  [CheckPointType.HR]: 'HR',
  [CheckPointType.MEETING]: 'Meeting / sync',
  [CheckPointType.TRAINING]: 'Training / KT',
};
