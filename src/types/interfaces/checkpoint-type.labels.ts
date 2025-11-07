import { CheckPointType } from './checkpoint-type.enum';

export const CheckPointTypeLabel: Record<CheckPointType, string> = {
  [CheckPointType.FEATURE]: 'Feature',
  [CheckPointType.BUG_FIX]: 'Bug',
  [CheckPointType.HOTFIX]: 'Hotfix',
  [CheckPointType.DEPLOY]: 'Deploy',
  [CheckPointType.ROLLBACK]: 'Rollback',
  [CheckPointType.DB_MIGRATION]: 'Migration',
  [CheckPointType.CODE_REVIEW]: 'Review',
  [CheckPointType.PERFORMANCE]: 'Perf',

  [CheckPointType.ROADMAP]: 'Roadmap',
  [CheckPointType.USER_RESEARCH]: 'Research',
  [CheckPointType.TESTING]: 'Testing',

  [CheckPointType.DESIGN]: 'Design',
  [CheckPointType.CONTENT]: 'Content',
  [CheckPointType.MARKETING_CAMPAIGN]: 'Campaign',
  [CheckPointType.GROWTH_EXPERIMENT]: 'Experiment',

  [CheckPointType.CUSTOMER_SUPPORT]: 'Support',
  [CheckPointType.ONBOARDING]: 'Onboarding',
  [CheckPointType.PARTNERSHIPS]: 'Partners',
  [CheckPointType.INCIDENT_RESPONSE]: 'Incident',

  [CheckPointType.MONITORING]: 'Monitor',
  [CheckPointType.BACKUP]: 'Backup',
  [CheckPointType.SECURITY]: 'Security',
  [CheckPointType.CONFIG_CHANGE]: 'Config',
  [CheckPointType.AUTOMATION]: 'Automation',

  [CheckPointType.LEGAL]: 'Legal',
  [CheckPointType.FINANCE]: 'Finance',
  [CheckPointType.HR]: 'HR',
  [CheckPointType.MEETING]: 'Meeting',
  [CheckPointType.TRAINING]: 'Training',

  [CheckPointType.CHILD_LEFT]: 'Left',
  [CheckPointType.CHILD_JOINED]: 'Registered',
  [CheckPointType.NGO_JOINED]: 'Joined',
  [CheckPointType.MONTHLY_REPORT]: 'Report',
};
