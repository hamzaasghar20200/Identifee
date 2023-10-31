// all the pages titles that we wanna scrap in the account statement pdf
export const Pages = {
  RelationshipSummary: {
    title: 'Relationship Summary',
    headers: [
      'Account',
      'Name',
      'Investable Balance',
      'Required Balance',
      'Excess / Deficit',
      'Total Activity',
    ],
  },
  BalanceSummary: {
    title: 'Balance Summary',
    headers: ['Title', 'Value'],
  },
  ResultsSummary: { title: 'Results Summary', headers: ['Title', 'Value'] },
  ServiceDetails: {
    title: 'Service Details',
    headers: [
      'Service Description',
      'Volume',
      'Price',
      'Total Fee',
      'Required Balance',
    ],
  },
  // for SVB
  ServiceInformation: {
    title: 'Service Information',
    headers: [
      'Service Information',
      'Volume',
      'Unit Price',
      'Service Charge',
      'Balance Pay Methd',
    ],
  },
  HistoricalSummary: {
    title: 'Historical Summary',
    headers: [
      'Month',
      'Average Ledger Balance',
      'Average Positive Collected Balance',
      'Investable Balance',
      'Excess / Deficit Balance',
      'Earnings Credit Amount',
      'Analysis Based Fees',
      'Fees Based Fees',
      'Service Charges Due',
    ],
  },
  LastTwelveMonth: {
    title: 'Last Twelve Month History',
    headers: [
      'MM/YY',
      'Average Ledger Balance',
      'Balance Supporting Services',
      'Service Balance Required',
      'Excess / Deficit Balance',
      'Earnings Allowance',
      'Analyzed Charges',
      'Ttl Fees Analyzed Stmt',
    ],
  },
};

export const EstimatedTotalPayablesPoints = {
  Payables: [
    'TPA Book Transfer Via Wire',
    'TPA Drawdown Wire',
    'TPA Multibank Wire',
    'TPA Outgoing Domestic Wire',
    'TPA Outgoing Intl Wire-FX-Our',
    'TPA Outgoing Intl Wire-FX-Shared',
    'TPA Outgoing Intl Wire-Out',
    'TPA Outgoing Intl Wire-Shared',
    'Automated Drawdown Wire',
    'Automated Standing Transfer',
    'Book Transfer Via Wire',
    'Domestic Outgoing Wire Non-Repet',
    'Intl Automated Standing Transfer',
    'Intl Outgoing Wire Consumer',
    'Intl Outgoing Wire-FX-Our',
    'Intl Outgoing Wire-FX-Shared',
    'Intl Outgoing Wire-Our',
    'Intl Outgoing Wire-Shared',
    'Outgoing Wire Repetitive',
    'ACH Items Originated',
    'ACH GS Item',
    'TPA ACH Item',
    'TPA ACH GS Item',
    'ACH Items Originated Same Day',
    'Electronic Debit',
    'Controlled Disbursement Debits',
    'IP / IP Web Check Issue Printing',
    'IP / IP Web ACH Item Charge',
    'IP / IP Web ACH GS Item',
    'TPA RTP Outgoing Payment',
    'IP / IP Web Auto Domestic Wire',
    'IP / IP Web Book Transfer Via Wire',
    'Domestic Outgoing Wire Non-Repet',
    'Positive Pay Checks',
  ],
};
// covers B,
export const PayablesDataPointsV2 = {
  // B
  'TPA Wire': [
    'TPA Book Transfer Via Wire',
    'TPA Drawdown Wire',
    'TPA Multibank Wire',
    'TPA Outgoing Domestic Wire',
    'TPA Outgoing Intl Wire-FX-Our',
    'TPA Outgoing Intl Wire-FX-Shared',
    'TPA Outgoing Intl Wire-Out',
    'TPA Outgoing Intl Wire-Shared',
    'Automated Drawdown Wire',
    'Automated Standing Transfer',
    'Book Transfer Via Wire',
    'Domestic Outgoing Wire Non-Repet',
    'Intl Automated Standing Transfer',
    'Intl Outgoing Wire Consumer',
    'Intl Outgoing Wire-FX-Our',
    'Intl Outgoing Wire-FX-Shared',
    'Intl Outgoing Wire-Our',
    'Intl Outgoing Wire-Shared',
    'Outgoing Wire Repetitive',
  ],
  // C
  'ACH Origination': [
    'ACH Items Originated',
    'ACH GS Item',
    'TPA ACH Item',
    'TPA ACH GS Item',
    'ACH Items Originated Same Day',
  ],
  // D
  'Checks Paid': [
    'Electronic Debit',
    'Controlled Disbursement Debits',
    'Positive Pay Checks',
  ],
  // E
  'Integrated Payables ACH': [
    'IP Service Maintenance',
    'IP Web Service Maintenance',
    'IP Web Account Maintenance',
    'IP Web Submitted Files',
    'SWIFT FileAct Reporting (4)',
    'IP / IP Web Check Issue Printing',
    'IP / IP Web ACH Item Charge',
    'IP / IP Web ACH GS Item',
  ],
};

export const PayablesDataPoints = {
  Checks: [
    'Electronic Debit',
    'Controlled Disbursement Debits',
    'IP / IP Web Check Issue Printing',
  ],
  ACH: [
    'ACH Items Originated Same Day',
    'ACH Items Originated',
    'ACH GS Item',
    'IP / IP Web ACH Item Charge',
    'IP / IP Web ACH GS Item',
  ],
  Wires: [
    'TPA Wire/Account Transfer Service',
    'TPA Book Transfer Via Wire',
    'TPA Drawdown Wire',
    'TPA Multibank Wire',
    'TPA Outgoing Domestic Wire',
    'TPA Outgoing Intl Wire-FX-Our',
    'TPA Outgoing Intl Wire-FX-Shared',
    'TPA Outgoing Intl Wire-Out',
    'TPA Outgoing Intl Wire-Shared',
    'Automated Drawdown Wire',
    'Automated Standing Transfer',
    'Book Transfer Via Wire',
    'Domestic Outgoing Wire Non-Repet',
    'Intl Automated Standing Transfer',
    'Intl Outgoing Wire Consumer',
    'Intl Outgoing Wire-FX-Our',
    'Intl Outgoing Wire-FX-Shared',
    'Intl Outgoing Wire-Our',
    'Intl Outgoing Wire-Shared',
    'Outgoing Wire Repetitive Automated Drawdown Wire',
    'IP / IP Web Auto Domestic Wire',
    'IP / IP Web Auto Multibank Wire',
    'IP / IP Web Book Transfer Via Wire',
    'IP / IP Web Out Intl Wire-FX-Our',
    'IP / IP Web Out Intl Wire-FX-Shared',
    'IP / IP Web Out Intl Wire-Shared',
    'IP / IP Web Outgoing Intl Wire-Our',
  ],
};

export const EstimatedTotalReceivablesPoints = {
  Receivables: [
    'Domestic Incoming Wire',
    'International Incoming Wire',
    'Electronic Credit',
    'ACH Intl Transaction Received',
    'Credit',
    'Items Deposited',
  ],
};

export const ReceivablesDataPointsV2 = {
  // G
  'Checks Paid': ['Domestic Incoming Wire', 'International Incoming Wire'],
  // H
  'Integrated Payables ACH': [
    'Electronic Credit',
    'ACH Intl Transaction Received',
    'Credit',
    'Items Deposited',
  ],
  // I
  'Positive Pay Usage': [
    'ARP Maintenance-Full Img Pos Pay',
    'Image Positive Pay Maint Wo Recon',
    'Positive Pay Maintenance',
    'Web Positive Pay Maintenance',
  ],
  // J
  'ACH Positive Pay Usage': ['ACH Positive Pay Monthly Maint'],
};

export const PaymentRisksDataPoints = {
  // G
  'Incoming Wires': ['Domestic Incoming Wire', 'International Incoming Wire'],
  // H
  'Incoming ACH/Check': [
    'Electronic Credit',
    'ACH Intl Transaction Received',
    'Credit',
    'Items Deposited',
  ],
  // I
  'Cash Vault': ['Cash Vault Currency Deposited'],
  // J
  'Integrated Receivables': [
    'INR Monthly Maintenance',
    'INR Items',
    'INR Data Transmission',
    'INR Data Transmission With Images',
    'INR File Download',
    'INR File Download Items',
  ],
};

export const ReceivablesDataPoints = {
  Checks: [
    'Remote Deposit Item',
    'BDC Mobile Per Item Fee',
    'Credit',
    'Electronic Credit',
  ],
  ACH: ['Electronic Credit', 'ACH Intl Transaction Received'],
  Wires: ['Domestic Incoming Wire', 'International Incoming Wire'],
};

export const InputType = {
  Currency: 1,
  Comma: 2,
};

export const ReportTypes = {
  Treasury: 'Treasury',
  WorkingCapital: 'WorkingCapital',
  Merchant: 'Merchant',
};

export const PayableBlockTypes = {
  DSO: {
    key: 'days_sales_out',
    short: 'DSO',
    title: 'Days Sales Outstanding',
  },
  DPO: {
    key: 'days_payable_out',
    short: 'DPO',
    title: 'Days Payable Outstanding',
  },
};

export const ActionTypes = {
  ADD: 1,
  UPDATE: 2,
  REMOVE: 3,
  CLEAR: 4,
};

export const CenturyBankMapping = {
  PayablesDataPoints: {
    'TPA Wire': [
      // B
      'Outgoing Wire Domestic - online',
      'Outgoing International Wire - online',
      'Outgoing International Wire transfer-transfermate',
      'Outgoing FX Wire Transfer-Transfermate',
      'Outgoing wire Domestic - Agent Assisted',
      'Outgoing International Wire transfer - Branch',
      'Drawdown Request',
    ],
    // C
    'ACH Origination': [
      'ACH Originated Item',
      'Payables Hub ACH Transaction Fee',
      'ACH Originated Item-Same Day',
      'Payables Hub Same Day ACH Fee',
    ],
    // D
    'Checks Paid': ['Paid Checks', 'Payables Hub Check Outsourcing Fee'],
    // E
    'Integrated Payables ACH': [
      'Payables Hub Monthly Base',
      'Payables Hub Same Day File Fee',
      'Payables Hub-Late ACH File Fee',
    ],
  },
  EstimatedTotalPayablesPoints: {
    Payables: [
      'Outgoing Wire Domestic - online',
      'Outgoing International Wire - online',
      'Outgoing International Wire transfer-transfermate',
      'Outoing FX Wire Transfer-Transfermate',
      'Outgoing wire Domestic - Agent Assisted',
      'Outgoing International Wire transfer - Branch',
      'Drawdown Request',
      'ACH Originated Item',
      'Payables Hub ACH Transaction Fee',
      'ACH Originated Item-Same Day',
      'Payables Hub Same Day ACH Fee',
      'Paid Checks',
      'Payables Hub Check Outsourcing Fee',
    ],
  },
  ReceivablesDataPoints: {
    // G
    'Checks Paid': ['Incoming wire transfer (Domestic/International)'],
    // H
    'Integrated Payables ACH': [
      'Checks Deposited On-Us',
      'Checks deposited Not On-Us',
      'Xpress Deposit Item',
      'ACH debit received fee',
      'ACH credit received fee',
    ],
    // I
    'Positive Pay Usage': [
      'Cash Vault Monthly Base Fee',
      'Currency/coin deposit(per$100)',
      'Cash Vault Deposit',
    ],
    // J
    'ACH Positive Pay Usage': [
      'AR File Transmission',
      'R-hub Transmission Fee',
      'R-Hub Monthly Maintenance Fee',
      'R-hub Transaction Fee',
    ],
  },
  EstimatedTotalReceivablesPoints: {
    Receivables: [
      'Checks Deposited On-Us',
      'Checks deposited not On-Us',
      'Xpress Deposit Item',
      'Incoming wire transfer (Domestic/International)',
      'ACH debit received fee',
      'ACH credit received fee',
    ],
  },
  PaymentRisksDataPoints: {
    // G
    'Incoming Wires': [
      'Fraud Control Item Reviewed',
      'Fraud Control Monthly Base',
    ],
    // H
    'Incoming ACH/Check': [
      'Fraud Control Item Reviewed',
      'Fraud Control Monthly Base',
    ],
  },
};

export const SVBMapping = {
  PayablesDataPoints: {
    // B
    'TPA Wire': [
      'Out WT Dom Online',
      'Out WT Intl USD Online',
      'Out WT Intl FX Online',
      'Out WT Auto Drawdown',
      'Out WT Standing Wire',
    ],
    // C
    'ACH Origination': [
      'ACH Credit Originated',
      'ACH Debit Originated',
      'ACH CR IAT Orig Prem',
      'ACH DR IAT Orig Prem',
      'ACH CR Same Day Orig Prem',
      'ACH DR Same Day Orig Prem',
    ],
    // D
    'Checks Paid': ['Checks Paid'],
    // E
    'Integrated Payables ACH': [
      'Check Print US Per Check',
      'Tag Payment Monthly Service',
    ],
  },
  EstimatedTotalPayablesPoints: {
    Payables: [
      'Out WT Dom Online',
      'Out WT Intl USD Online',
      'Out WT Intl FX Online',
      'Out WT Auto Drawdown',
      'Out WT Standing Wire',
      'ACH Credit Originated',
      'ACH Debit Originated',
      'ACH CR IAT Orig Prem',
      'ACH DR IAT Orig Prem',
      'ACH CR Same Day Orig Prem',
      'ACH DR Same Day Orig Prem',
      'Checks Paid',
    ],
  },
  ReceivablesDataPoints: {
    // G
    'Checks Paid': ['In Wire Transfer'],
    // H
    'Integrated Payables ACH': [
      'ACH Credit Received',
      'ACH Debit Received',
      'Lockbox Automated per item',
      'Checks Deposited',
      'Mobile Deposit Item',
    ],
    // I
    'Positive Pay Usage': ['Cash Vault', 'Cash Vault Deposit'],
    // J
    'ACH Positive Pay Usage': ['Tag IR Monthly Service'],
  },
  EstimatedTotalReceivablesPoints: {
    // K
    Receivables: [
      'In Wire Transfer',
      'ACH Credit Received',
      'ACH Debit Received',
      'Lockbox Automated per item',
      'Checks Deposited',
      'Mobile Deposit Item',
    ],
  },
  PaymentRisksDataPoints: {
    'Incoming Wires': [
      'Check PosPay w/Payee Per Item',
      'Check PosPay w/Payee Monthly',
      'Check PosPay w/o Payee Per Item',
      'Check PosPay w/o Payee Monthly',
    ],
    'Incoming ACH/Check': [
      'ACH Filter Monthly Maintenance',
      'ACH Block Account Maint',
    ],
  },
};

export const DemoTenantsKeys = {
  eb: 'eb',
  cb: 'cb',
  sb: 'sb',
  svb: 'svb',
};
export const DemoTenants = [
  { key: DemoTenantsKeys.eb, name: 'EB', tip: 'Excel Bank' }, // uses comerica mapping in mozilla
  { key: DemoTenantsKeys.cb, name: 'CB', tip: 'Comerica Bank' }, // uses comerica mapping in mozilla
  { key: DemoTenantsKeys.sb, name: 'SB', tip: 'Synovus Bank' }, // uses comerica mapping in mozilla
  { key: DemoTenantsKeys.svb, name: 'SVB', tip: 'Silicon Valley Bank' }, // uses svb mapping in mozilla
];
