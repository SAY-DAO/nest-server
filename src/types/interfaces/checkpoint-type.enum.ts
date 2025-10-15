export const CheckPointType = {
  FEATURE: 'feature',
  BUG_FIX: 'bug-fix',
  HOTFIX: 'hotfix',
  DEPLOY: 'deploy',
  ROLLBACK: 'rollback',
  DB_MIGRATION: 'db-migration',
  CODE_REVIEW: 'code-review',
  PERFORMANCE: 'performance',

  ROADMAP: 'roadmap',
  PRODUCT_SPEC: 'spec',
  USER_RESEARCH: 'research',
  TESTING: 'testing',

  DESIGN: 'design',
  ASSET_PRODUCTION: 'assets',

  CONTENT: 'content',
  SOCIAL: 'social',
  MARKETING_CAMPAIGN: 'campaign',
  GROWTH_EXPERIMENT: 'experiment',

  CUSTOMER_SUPPORT: 'support',
  ONBOARDING: 'onboarding',
  PARTNERSHIPS: 'partners',
  INCIDENT_RESPONSE: 'incident',

  MONITORING: 'monitor',
  BACKUP: 'backup',
  SECURITY: 'security',
  CONFIG_CHANGE: 'config',
  AUTOMATION: 'automation',

  LEGAL: 'legal',
  FINANCE: 'finance',
  HR: 'hr',
  MEETING: 'meeting',
  TRAINING: 'training',

  CHILD_JOINED: 'joined',
  SEASONAL_REPORT: 'report',
} as const;

export type CheckPointType =
  (typeof CheckPointType)[keyof typeof CheckPointType];
