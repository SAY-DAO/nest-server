// src/checkpoint/checkpoint-type.enum.ts
export enum CheckPointType {
  // Engineering / Releases
  FEATURE = 'feature',
  BUG_FIX = 'bug-fix',
  HOTFIX = 'hotfix',
  DEPLOY = 'deploy',
  ROLLBACK = 'rollback',
  DB_MIGRATION = 'db-migration',
  CODE_REVIEW = 'code-review',
  PERFORMANCE = 'performance',

  // Product / Research
  ROADMAP = 'roadmap',
  PRODUCT_SPEC = 'product-spec',
  USER_RESEARCH = 'user-research',
  QA_APPROVAL = 'qa-approval',

  // Design / Creative
  DESIGN = 'design',
  UX = 'ux',
  BRANDING = 'branding',
  ASSET_PRODUCTION = 'asset-production', // images/video/illustrations

  // Content / Marketing
  CONTENT = 'content-creation',
  COPYWRITING = 'copywriting',
  SEO = 'seo',
  SOCIAL = 'social',
  EMAIL = 'email-campaign',
  PAID_ADS = 'paid-ads',
  MARKETING_CAMPAIGN = 'marketing-campaign',
  GROWTH_EXPERIMENT = 'growth-experiment',

  // Customer / Sales / Support
  CUSTOMER_SUPPORT = 'customer-support',
  ONBOARDING = 'onboarding',
  SALES = 'sales',
  BIZDEV = 'bizdev',
  INCIDENT = 'incident', // outages / incident work

  // Ops / Infra / Security / Legal / Finance / HR
  MONITORING = 'monitoring',
  BACKUP = 'backup',
  SECURITY = 'security',
  CONFIG_CHANGE = 'config-change',
  AUTOMATION = 'automation',
  LEGAL = 'legal',
  FINANCE = 'finance',
  HR = 'hr',
  MEETING = 'meeting',
  TRAINING = 'training',
}
