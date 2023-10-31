import { isMatchInCommaSeperated } from './Utils';

// will add more permissions over the time, currently handling Resources view and its import/export actions based on tenant modules list
export const PermissionsConstants = {
  Resources: {
    collection: 'prospects',
    create: 'create',
    view: 'view',
    import: 'prospecting_peoples_import',
    export: 'prospecting_peoples_export',
    import_: 'resources_import',
    export_: 'resources_export',
  },
  Reports: {
    WorkingCapital: 'engagement_working_capital',
    Treasury: 'engagement_treasury_management',
    Merchant: 'engagement_merchant_services',
  },
  ModulesReportNames: {
    WorkingCapital: 'engagement_working_capital',
    Treasury: 'engagement_treasury_management',
    Merchant: 'engagement_merchant_services',
  },
  Training: {
    MyStats: 'my_training_stats',
  },
  AIAssist: {
    Assist: 'ai_assist', // main side menu module
    Write: 'ai_assist_write', // inner tab
    Summarize: 'ai_assist_summarize', // inner tab
    Ask: 'ai_assist_ask', // inner tab
  },
  ClientPortal: 'client_portal',
};

export const checkPermission = (modules, permissions) => {
  return permissions.filter((key) => {
    return isMatchInCommaSeperated(modules, key);
  });
};
