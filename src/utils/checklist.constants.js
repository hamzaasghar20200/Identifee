export const CHECKLIST_STORAGE_KEY = 'achCheckLists';
export const ChecklistFieldsTabs = {
  Internal: 'internal',
  Client: 'client',
};

export const CHECKLIST_ACTIONS = [
  { name: 'Acknowledge', value: 'ack', icon: 'visibility' },
  { name: 'Upload', value: 'upload', icon: 'description' },
  { name: 'Signature', value: 'esign', icon: 'draw' },
];
export const getClientListStatus = (checklist) => {
  if (checklist && checklist?.items) {
    const clientItems = checklist?.items.filter(
      (it) => it.type === ChecklistFieldsTabs.Client
    );
    return clientItems.every(
      (it) => it.status.value === ChecklistStatuses.Completed.value
    )
      ? ChecklistStatuses.Completed
      : ChecklistStatuses.Pending;
  }
  return {};
};

export const getChecklistStatus = (checklist) => {
  if (checklist && checklist?.items) {
    return checklist?.items.every(
      (it) => it.status.value === ChecklistStatuses.Completed.value
    )
      ? ChecklistStatuses.Completed
      : checklist.status;
  }
  return {};
};
export const ChecklistStatuses = {
  Pending: { value: 'pending', text: 'Pending', color: 'bg-yellow' },
  InProgress: {
    value: 'in-progress',
    text: 'In Progress',
    color: 'bg-warning',
  },
  NotViewed: { value: 'not-viewed', text: 'Not Viewed', color: 'bg-gray-400' },
  Completed: {
    value: 'completed',
    text: 'Completed',
    color: 'bg-success text-white',
  },
};

export const saveChecklist = (checklist) => {
  localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(checklist));
};
export const getChecklist = () => {
  const checklist = localStorage.getItem(CHECKLIST_STORAGE_KEY) || null;
  if (checklist) {
    try {
      return JSON.parse(checklist);
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const checklistTimelineStaticData = {
  pagination: {
    limit: 15,
    page: 1,
    totalPages: 1,
    count: 2,
  },
  feed: [
    {
      id: '91d81d8a-4082-45ac-837e-d922a6bd050f',
      summary: 'Checklist item updated',
      type: 'updated',
      object_data: {
        deleted: false,
        do_not_call: false,
        is_customer: false,
        label_id: null,
        id: '69232e3f-38ea-457c-9a9e-d14512a290ab',
        first_name: 'Vikhyath',
        last_name: 'Rao',
        email_work: 'vikhyath@gmail.com',
        phone_work: '',
        avatar: null,
        title: 'Senior Software Engineer',
        primary_address_city: 'Sunnyvale',
        primary_address_state: 'CA ',
        external_id: '57844468',
        organization_id: '1f37d66b-bccf-4624-89b1-81b5ccde2303',
        date_entered: '2023-08-25T06:34:51.742Z',
        date_modified: '2023-08-25T06:34:51.742Z',
      },
      content: null,
      created_by: 'fccd3e90-9cbf-43a5-bca4-9329625819f7',
      updated_by: null,
      contact_id: null,
      organization_id: '1f37d66b-bccf-4624-89b1-81b5ccde2303',
      deal_id: null,
      tenant_id: 'cacadeee-0000-4000-a000-000000000001',
      created_at: '2023-08-25T06:34:51.752Z',
      updated_at: '2023-08-25T06:34:51.752Z',
      deleted_at: null,
      total_comments: 0,
      activity_id: null,
      created_by_info: {
        id: 'fccd3e90-9cbf-43a5-bca4-9329625819f7',
        first_name: 'Michael',
        last_name: 'Grey',
        email: 'osa.mammursleen@gmail.com',
        title: 'Software Developer Relations',
        avatar: 'ec557892-7d0c-44fc-8bc9-4e35a005fd4d',
        status: 'active',
        roleId: '26769639-0616-41f8-8379-68650cfc26c8',
        groupId: '6543ec45-eb27-4ad6-8a63-3bd7a483ea78',
        last_access: '2023-08-30T08:14:48.080Z',
        last_page: null,
        phone: null,
        tenant_id: 'cacadeee-0000-4000-a000-000000000001',
        created_at: '2023-01-19T07:26:00.311Z',
        updated_at: '2023-08-30T08:14:48.080Z',
      },
      updated_by_info: null,
      deal: null,
      contact: null,
      organization: {
        id: '1f37d66b-bccf-4624-89b1-81b5ccde2303',
        name: 'Google Inc',
        date_entered: '2023-08-03T06:20:54.424Z',
        date_modified: '2023-08-03T06:20:54.424Z',
        modified_user_id: '2f589eff-46a5-453c-b971-692ae21fc1d8',
        created_by: '2f589eff-46a5-453c-b971-692ae21fc1d8',
        deleted: false,
        assigned_user_id: '2f589eff-46a5-453c-b971-692ae21fc1d8',
        industry: 'Search Engines & Internet Portals',
        annual_revenue: '5000000',
        annual_revenue_merchant: null,
        annual_revenue_treasury: null,
        annual_revenue_business_card: null,
        total_revenue: '5000000',
        phone_fax: null,
        billing_address_street: null,
        billing_address_city: null,
        billing_address_state: null,
        billing_address_postalcode: null,
        billing_address_country: null,
        rating: null,
        phone_office: '(626) 244-8533',
        phone_alternate: null,
        website: 'imcardboard.com',
        employees: 18,
        ticker_symbol: null,
        address_street: '128 E Palm Avenue Suite 100',
        address_suite: null,
        address_city: 'Monrovia',
        address_state: 'California',
        address_postalcode: null,
        address_country: 'US',
        sic_code: null,
        status: null,
        naics_code: '32213',
        is_customer: false,
        cif: null,
        branch: null,
        external_id: '26271962',
        avatar: 'https://media.rocketreach.co/logo_url/i-am-cardboard-eb28c494',
        label_id: null,
        tenant_id: 'cacadeee-0000-4000-a000-000000000001',
      },
    },
    {
      id: 'b89313b5-c396-4576-9151-c800198b11e8',
      summary: 'Compliance file uploaded by',
      type: 'file',
      object_data: {
        deleted: false,
        do_not_call: false,
        is_customer: false,
        label_id: null,
        id: '7ec5979b-6975-41ef-b1fd-097daaff312d',
        first_name: 'Maaz',
        last_name: 'Contractor',
        email_work: 'maaz.contractor@gmail.com',
        phone_work: '323-620-0166',
        avatar: null,
        title: 'Software Engineer',
        primary_address_city: 'San Mateo',
        primary_address_state: 'CA ',
        external_id: '95886706',
        organization_id: '1f37d66b-bccf-4624-89b1-81b5ccde2303',
        date_entered: '2023-08-25T06:34:13.402Z',
        date_modified: '2023-08-25T06:34:13.402Z',
        created_by: 'fccd3e90-9cbf-43a5-bca4-9329625819f7',
        modified_user_id: 'fccd3e90-9cbf-43a5-bca4-9329625819f7',
        assigned_user_id: 'fccd3e90-9cbf-43a5-bca4-9329625819f7',
        tenant_id: 'cacadeee-0000-4000-a000-000000000001',
        filename_download: 'compliance.pdf',
      },
      content: null,
      created_by: 'fccd3e90-9cbf-43a5-bca4-9329625819f7',
      updated_by: null,
      contact_id: null,
      organization_id: '1f37d66b-bccf-4624-89b1-81b5ccde2303',
      deal_id: null,
      tenant_id: 'cacadeee-0000-4000-a000-000000000001',
      created_at: '2023-08-25T06:34:13.414Z',
      updated_at: '2023-08-25T06:34:13.414Z',
      deleted_at: null,
      total_comments: 0,
      activity_id: null,
      created_by_info: {
        id: 'fccd3e90-9cbf-43a5-bca4-9329625819f7',
        first_name: 'John',
        last_name: 'Doe',
        email: 'osa.mammursleen@gmail.com',
        title: 'Software Developer Relations',
        avatar: 'ec557892-7d0c-44fc-8bc9-4e35a005fd4d',
        status: 'active',
        roleId: '26769639-0616-41f8-8379-68650cfc26c8',
        groupId: '6543ec45-eb27-4ad6-8a63-3bd7a483ea78',
        last_access: '2023-08-30T08:14:48.080Z',
        last_page: null,
        phone: null,
        tenant_id: 'cacadeee-0000-4000-a000-000000000001',
        created_at: '2023-01-19T07:26:00.311Z',
        updated_at: '2023-08-30T08:14:48.080Z',
      },
      updated_by_info: null,
      deal: null,
      contact: null,
      organization: {
        id: '1f37d66b-bccf-4624-89b1-81b5ccde2303',
        name: 'Google Inc',
        date_entered: '2023-08-03T06:20:54.424Z',
        date_modified: '2023-08-03T06:20:54.424Z',
        modified_user_id: '2f589eff-46a5-453c-b971-692ae21fc1d8',
        created_by: '2f589eff-46a5-453c-b971-692ae21fc1d8',
        deleted: false,
        assigned_user_id: '2f589eff-46a5-453c-b971-692ae21fc1d8',
        industry: 'Search Engines & Internet Portals',
        annual_revenue: '5000000',
        annual_revenue_merchant: null,
        annual_revenue_treasury: null,
        annual_revenue_business_card: null,
        total_revenue: '5000000',
        phone_fax: null,
        billing_address_street: null,
        billing_address_city: null,
        billing_address_state: null,
        billing_address_postalcode: null,
        billing_address_country: null,
        rating: null,
        phone_office: '(626) 244-8533',
        phone_alternate: null,
        website: 'imcardboard.com',
        employees: 18,
        ticker_symbol: null,
        address_street: '128 E Palm Avenue Suite 100',
        address_suite: null,
        address_city: 'Monrovia',
        address_state: 'California',
        address_postalcode: null,
        address_country: 'US',
        sic_code: null,
        status: null,
        naics_code: '32213',
        is_customer: false,
        cif: null,
        branch: null,
        external_id: '26271962',
        avatar: 'https://media.rocketreach.co/logo_url/i-am-cardboard-eb28c494',
        label_id: null,
        tenant_id: 'cacadeee-0000-4000-a000-000000000001',
      },
    },
    {
      id: 'b89313b5-c396-4576-9151-c800198b11e8',
      summary: 'Compliance file uploaded by',
      type: 'file',
      object_data: {
        deleted: false,
        do_not_call: false,
        is_customer: false,
        label_id: null,
        id: '7ec5979b-6975-41ef-b1fd-097daaff312d',
        first_name: 'Maaz',
        last_name: 'Contractor',
        email_work: 'maaz.contractor@gmail.com',
        phone_work: '323-620-0166',
        avatar: null,
        title: 'Software Engineer',
        primary_address_city: 'San Mateo',
        primary_address_state: 'CA ',
        external_id: '95886706',
        organization_id: '1f37d66b-bccf-4624-89b1-81b5ccde2303',
        date_entered: '2023-08-25T06:34:13.402Z',
        date_modified: '2023-08-25T06:34:13.402Z',
        created_by: 'fccd3e90-9cbf-43a5-bca4-9329625819f7',
        modified_user_id: 'fccd3e90-9cbf-43a5-bca4-9329625819f7',
        assigned_user_id: 'fccd3e90-9cbf-43a5-bca4-9329625819f7',
        tenant_id: 'cacadeee-0000-4000-a000-000000000001',
        filename_download: 'ach terms of service.pdf',
      },
      content: null,
      created_by: 'fccd3e90-9cbf-43a5-bca4-9329625819f7',
      updated_by: null,
      contact_id: null,
      organization_id: '1f37d66b-bccf-4624-89b1-81b5ccde2303',
      deal_id: null,
      tenant_id: 'cacadeee-0000-4000-a000-000000000001',
      created_at: '2023-08-25T06:34:13.414Z',
      updated_at: '2023-08-25T06:34:13.414Z',
      deleted_at: null,
      total_comments: 0,
      activity_id: null,
      created_by_info: {
        id: 'fccd3e90-9cbf-43a5-bca4-9329625819f7',
        first_name: 'John',
        last_name: 'Doe',
        email: 'osa.mammursleen@gmail.com',
        title: 'Software Developer Relations',
        avatar: 'ec557892-7d0c-44fc-8bc9-4e35a005fd4d',
        status: 'active',
        roleId: '26769639-0616-41f8-8379-68650cfc26c8',
        groupId: '6543ec45-eb27-4ad6-8a63-3bd7a483ea78',
        last_access: '2023-08-30T08:14:48.080Z',
        last_page: null,
        phone: null,
        tenant_id: 'cacadeee-0000-4000-a000-000000000001',
        created_at: '2023-01-19T07:26:00.311Z',
        updated_at: '2023-08-30T08:14:48.080Z',
      },
      updated_by_info: null,
      deal: null,
      contact: null,
      organization: {
        id: '1f37d66b-bccf-4624-89b1-81b5ccde2303',
        name: 'Google Inc',
        date_entered: '2023-08-03T06:20:54.424Z',
        date_modified: '2023-08-03T06:20:54.424Z',
        modified_user_id: '2f589eff-46a5-453c-b971-692ae21fc1d8',
        created_by: '2f589eff-46a5-453c-b971-692ae21fc1d8',
        deleted: false,
        assigned_user_id: '2f589eff-46a5-453c-b971-692ae21fc1d8',
        industry: 'Search Engines & Internet Portals',
        annual_revenue: '5000000',
        annual_revenue_merchant: null,
        annual_revenue_treasury: null,
        annual_revenue_business_card: null,
        total_revenue: '5000000',
        phone_fax: null,
        billing_address_street: null,
        billing_address_city: null,
        billing_address_state: null,
        billing_address_postalcode: null,
        billing_address_country: null,
        rating: null,
        phone_office: '(626) 244-8533',
        phone_alternate: null,
        website: 'imcardboard.com',
        employees: 18,
        ticker_symbol: null,
        address_street: '128 E Palm Avenue Suite 100',
        address_suite: null,
        address_city: 'Monrovia',
        address_state: 'California',
        address_postalcode: null,
        address_country: 'US',
        sic_code: null,
        status: null,
        naics_code: '32213',
        is_customer: false,
        cif: null,
        branch: null,
        external_id: '26271962',
        avatar: 'https://media.rocketreach.co/logo_url/i-am-cardboard-eb28c494',
        label_id: null,
        tenant_id: 'cacadeee-0000-4000-a000-000000000001',
      },
    },
    {
      id: 'b89313b5-c396-4576-9151-c800198b11e8',
      summary: 'Compliance file uploaded by',
      type: 'file',
      object_data: {
        deleted: false,
        do_not_call: false,
        is_customer: false,
        label_id: null,
        id: '7ec5979b-6975-41ef-b1fd-097daaff312d',
        first_name: 'Maaz',
        last_name: 'Contractor',
        email_work: 'maaz.contractor@gmail.com',
        phone_work: '323-620-0166',
        avatar: null,
        title: 'Software Engineer',
        primary_address_city: 'San Mateo',
        primary_address_state: 'CA ',
        external_id: '95886706',
        organization_id: '1f37d66b-bccf-4624-89b1-81b5ccde2303',
        date_entered: '2023-08-25T06:34:13.402Z',
        date_modified: '2023-08-25T06:34:13.402Z',
        created_by: 'fccd3e90-9cbf-43a5-bca4-9329625819f7',
        modified_user_id: 'fccd3e90-9cbf-43a5-bca4-9329625819f7',
        assigned_user_id: 'fccd3e90-9cbf-43a5-bca4-9329625819f7',
        tenant_id: 'cacadeee-0000-4000-a000-000000000001',
        filename_download: 'compliance_v2.pdf',
      },
      content: null,
      created_by: 'fccd3e90-9cbf-43a5-bca4-9329625819f7',
      updated_by: null,
      contact_id: null,
      organization_id: '1f37d66b-bccf-4624-89b1-81b5ccde2303',
      deal_id: null,
      tenant_id: 'cacadeee-0000-4000-a000-000000000001',
      created_at: '2023-08-25T06:34:13.414Z',
      updated_at: '2023-08-25T06:34:13.414Z',
      deleted_at: null,
      total_comments: 0,
      activity_id: null,
      created_by_info: {
        id: 'fccd3e90-9cbf-43a5-bca4-9329625819f7',
        first_name: 'John',
        last_name: 'Doe',
        email: 'osa.mammursleen@gmail.com',
        title: 'Software Developer Relations',
        avatar: 'ec557892-7d0c-44fc-8bc9-4e35a005fd4d',
        status: 'active',
        roleId: '26769639-0616-41f8-8379-68650cfc26c8',
        groupId: '6543ec45-eb27-4ad6-8a63-3bd7a483ea78',
        last_access: '2023-08-30T08:14:48.080Z',
        last_page: null,
        phone: null,
        tenant_id: 'cacadeee-0000-4000-a000-000000000001',
        created_at: '2023-01-19T07:26:00.311Z',
        updated_at: '2023-08-30T08:14:48.080Z',
      },
      updated_by_info: null,
      deal: null,
      contact: null,
      organization: {
        id: '1f37d66b-bccf-4624-89b1-81b5ccde2303',
        name: 'Google Inc',
        date_entered: '2023-08-03T06:20:54.424Z',
        date_modified: '2023-08-03T06:20:54.424Z',
        modified_user_id: '2f589eff-46a5-453c-b971-692ae21fc1d8',
        created_by: '2f589eff-46a5-453c-b971-692ae21fc1d8',
        deleted: false,
        assigned_user_id: '2f589eff-46a5-453c-b971-692ae21fc1d8',
        industry: 'Search Engines & Internet Portals',
        annual_revenue: '5000000',
        annual_revenue_merchant: null,
        annual_revenue_treasury: null,
        annual_revenue_business_card: null,
        total_revenue: '5000000',
        phone_fax: null,
        billing_address_street: null,
        billing_address_city: null,
        billing_address_state: null,
        billing_address_postalcode: null,
        billing_address_country: null,
        rating: null,
        phone_office: '(626) 244-8533',
        phone_alternate: null,
        website: 'imcardboard.com',
        employees: 18,
        ticker_symbol: null,
        address_street: '128 E Palm Avenue Suite 100',
        address_suite: null,
        address_city: 'Monrovia',
        address_state: 'California',
        address_postalcode: null,
        address_country: 'US',
        sic_code: null,
        status: null,
        naics_code: '32213',
        is_customer: false,
        cif: null,
        branch: null,
        external_id: '26271962',
        avatar: 'https://media.rocketreach.co/logo_url/i-am-cardboard-eb28c494',
        label_id: null,
        tenant_id: 'cacadeee-0000-4000-a000-000000000001',
      },
    },
    {
      id: '91d81d8a-4082-45ac-837e-d922a6bd050f',
      summary: 'Checklist item updated',
      type: 'updated',
      object_data: {
        deleted: false,
        do_not_call: false,
        is_customer: false,
        label_id: null,
        id: '69232e3f-38ea-457c-9a9e-d14512a290ab',
        first_name: 'Vikhyath',
        last_name: 'Rao',
        email_work: 'vikhyath@gmail.com',
        phone_work: '',
        avatar: null,
        title: 'Senior Software Engineer',
        primary_address_city: 'Sunnyvale',
        primary_address_state: 'CA ',
        external_id: '57844468',
        organization_id: '1f37d66b-bccf-4624-89b1-81b5ccde2303',
        date_entered: '2023-08-25T06:34:51.742Z',
        date_modified: '2023-08-25T06:34:51.742Z',
      },
      content: null,
      created_by: 'fccd3e90-9cbf-43a5-bca4-9329625819f7',
      updated_by: null,
      contact_id: null,
      organization_id: '1f37d66b-bccf-4624-89b1-81b5ccde2303',
      deal_id: null,
      tenant_id: 'cacadeee-0000-4000-a000-000000000001',
      created_at: '2023-08-25T06:34:51.752Z',
      updated_at: '2023-08-25T06:34:51.752Z',
      deleted_at: null,
      total_comments: 0,
      activity_id: null,
      created_by_info: {
        id: 'fccd3e90-9cbf-43a5-bca4-9329625819f7',
        first_name: 'John',
        last_name: 'Doe',
        email: 'osa.mammursleen@gmail.com',
        title: 'Software Developer Relations',
        avatar: 'ec557892-7d0c-44fc-8bc9-4e35a005fd4d',
        status: 'active',
        roleId: '26769639-0616-41f8-8379-68650cfc26c8',
        groupId: '6543ec45-eb27-4ad6-8a63-3bd7a483ea78',
        last_access: '2023-08-30T08:14:48.080Z',
        last_page: null,
        phone: null,
        tenant_id: 'cacadeee-0000-4000-a000-000000000001',
        created_at: '2023-01-19T07:26:00.311Z',
        updated_at: '2023-08-30T08:14:48.080Z',
      },
      updated_by_info: null,
      deal: null,
      contact: null,
      organization: {
        id: '1f37d66b-bccf-4624-89b1-81b5ccde2303',
        name: 'Google Inc',
        date_entered: '2023-08-03T06:20:54.424Z',
        date_modified: '2023-08-03T06:20:54.424Z',
        modified_user_id: '2f589eff-46a5-453c-b971-692ae21fc1d8',
        created_by: '2f589eff-46a5-453c-b971-692ae21fc1d8',
        deleted: false,
        assigned_user_id: '2f589eff-46a5-453c-b971-692ae21fc1d8',
        industry: 'Search Engines & Internet Portals',
        annual_revenue: '5000000',
        annual_revenue_merchant: null,
        annual_revenue_treasury: null,
        annual_revenue_business_card: null,
        total_revenue: '5000000',
        phone_fax: null,
        billing_address_street: null,
        billing_address_city: null,
        billing_address_state: null,
        billing_address_postalcode: null,
        billing_address_country: null,
        rating: null,
        phone_office: '(626) 244-8533',
        phone_alternate: null,
        website: 'imcardboard.com',
        employees: 18,
        ticker_symbol: null,
        address_street: '128 E Palm Avenue Suite 100',
        address_suite: null,
        address_city: 'Monrovia',
        address_state: 'California',
        address_postalcode: null,
        address_country: 'US',
        sic_code: null,
        status: null,
        naics_code: '32213',
        is_customer: false,
        cif: null,
        branch: null,
        external_id: '26271962',
        avatar: 'https://media.rocketreach.co/logo_url/i-am-cardboard-eb28c494',
        label_id: null,
        tenant_id: 'cacadeee-0000-4000-a000-000000000001',
      },
    },
    {
      id: '91d81d8a-4082-45ac-837e-d922a6bd050f',
      summary: 'Checklist item updated',
      type: 'updated',
      object_data: {
        deleted: false,
        do_not_call: false,
        is_customer: false,
        label_id: null,
        id: '69232e3f-38ea-457c-9a9e-d14512a290ab',
        first_name: 'Vikhyath',
        last_name: 'Rao',
        email_work: 'vikhyath@gmail.com',
        phone_work: '',
        avatar: null,
        title: 'Senior Software Engineer',
        primary_address_city: 'Sunnyvale',
        primary_address_state: 'CA ',
        external_id: '57844468',
        organization_id: '1f37d66b-bccf-4624-89b1-81b5ccde2303',
        date_entered: '2023-08-25T06:34:51.742Z',
        date_modified: '2023-08-25T06:34:51.742Z',
      },
      content: null,
      created_by: 'fccd3e90-9cbf-43a5-bca4-9329625819f7',
      updated_by: null,
      contact_id: null,
      organization_id: '1f37d66b-bccf-4624-89b1-81b5ccde2303',
      deal_id: null,
      tenant_id: 'cacadeee-0000-4000-a000-000000000001',
      created_at: '2023-08-25T06:34:51.752Z',
      updated_at: '2023-08-25T06:34:51.752Z',
      deleted_at: null,
      total_comments: 0,
      activity_id: null,
      created_by_info: {
        id: 'fccd3e90-9cbf-43a5-bca4-9329625819f7',
        first_name: 'John',
        last_name: 'Doe',
        email: 'osa.mammursleen@gmail.com',
        title: 'Software Developer Relations',
        avatar: 'ec557892-7d0c-44fc-8bc9-4e35a005fd4d',
        status: 'active',
        roleId: '26769639-0616-41f8-8379-68650cfc26c8',
        groupId: '6543ec45-eb27-4ad6-8a63-3bd7a483ea78',
        last_access: '2023-08-30T08:14:48.080Z',
        last_page: null,
        phone: null,
        tenant_id: 'cacadeee-0000-4000-a000-000000000001',
        created_at: '2023-01-19T07:26:00.311Z',
        updated_at: '2023-08-30T08:14:48.080Z',
      },
      updated_by_info: null,
      deal: null,
      contact: null,
      organization: {
        id: '1f37d66b-bccf-4624-89b1-81b5ccde2303',
        name: 'Google Inc',
        date_entered: '2023-08-03T06:20:54.424Z',
        date_modified: '2023-08-03T06:20:54.424Z',
        modified_user_id: '2f589eff-46a5-453c-b971-692ae21fc1d8',
        created_by: '2f589eff-46a5-453c-b971-692ae21fc1d8',
        deleted: false,
        assigned_user_id: '2f589eff-46a5-453c-b971-692ae21fc1d8',
        industry: 'Search Engines & Internet Portals',
        annual_revenue: '5000000',
        annual_revenue_merchant: null,
        annual_revenue_treasury: null,
        annual_revenue_business_card: null,
        total_revenue: '5000000',
        phone_fax: null,
        billing_address_street: null,
        billing_address_city: null,
        billing_address_state: null,
        billing_address_postalcode: null,
        billing_address_country: null,
        rating: null,
        phone_office: '(626) 244-8533',
        phone_alternate: null,
        website: 'imcardboard.com',
        employees: 18,
        ticker_symbol: null,
        address_street: '128 E Palm Avenue Suite 100',
        address_suite: null,
        address_city: 'Monrovia',
        address_state: 'California',
        address_postalcode: null,
        address_country: 'US',
        sic_code: null,
        status: null,
        naics_code: '32213',
        is_customer: false,
        cif: null,
        branch: null,
        external_id: '26271962',
        avatar: 'https://media.rocketreach.co/logo_url/i-am-cardboard-eb28c494',
        label_id: null,
        tenant_id: 'cacadeee-0000-4000-a000-000000000001',
      },
    },
    {
      id: '91d81d8a-4082-45ac-837e-d922a6bd050f',
      summary: 'Checklist item updated',
      type: 'updated',
      object_data: {
        deleted: false,
        do_not_call: false,
        is_customer: false,
        label_id: null,
        id: '69232e3f-38ea-457c-9a9e-d14512a290ab',
        first_name: 'Vikhyath',
        last_name: 'Rao',
        email_work: 'vikhyath@gmail.com',
        phone_work: '',
        avatar: null,
        title: 'Senior Software Engineer',
        primary_address_city: 'Sunnyvale',
        primary_address_state: 'CA ',
        external_id: '57844468',
        organization_id: '1f37d66b-bccf-4624-89b1-81b5ccde2303',
        date_entered: '2023-08-24T06:34:51.742Z',
        date_modified: '2023-08-24T06:34:51.742Z',
      },
      content: null,
      created_by: 'fccd3e90-9cbf-43a5-bca4-9329625819f7',
      updated_by: null,
      contact_id: null,
      organization_id: '1f37d66b-bccf-4624-89b1-81b5ccde2303',
      deal_id: null,
      tenant_id: 'cacadeee-0000-4000-a000-000000000001',
      created_at: '2023-08-24T06:34:51.752Z',
      updated_at: '2023-08-24T06:34:51.752Z',
      deleted_at: null,
      total_comments: 0,
      activity_id: null,
      created_by_info: {
        id: 'fccd3e90-9cbf-43a5-bca4-9329625819f7',
        first_name: 'John',
        last_name: 'Doe',
        email: 'osa.mammursleen@gmail.com',
        title: 'Software Developer Relations',
        avatar: 'ec557892-7d0c-44fc-8bc9-4e35a005fd4d',
        status: 'active',
        roleId: '26769639-0616-41f8-8379-68650cfc26c8',
        groupId: '6543ec45-eb27-4ad6-8a63-3bd7a483ea78',
        last_access: '2023-08-30T08:14:48.080Z',
        last_page: null,
        phone: null,
        tenant_id: 'cacadeee-0000-4000-a000-000000000001',
        created_at: '2023-01-19T07:26:00.311Z',
        updated_at: '2023-08-30T08:14:48.080Z',
      },
      updated_by_info: null,
      deal: null,
      contact: null,
      organization: {
        id: '1f37d66b-bccf-4624-89b1-81b5ccde2303',
        name: 'Google Inc',
        date_entered: '2023-08-03T06:20:54.424Z',
        date_modified: '2023-08-03T06:20:54.424Z',
        modified_user_id: '2f589eff-46a5-453c-b971-692ae21fc1d8',
        created_by: '2f589eff-46a5-453c-b971-692ae21fc1d8',
        deleted: false,
        assigned_user_id: '2f589eff-46a5-453c-b971-692ae21fc1d8',
        industry: 'Search Engines & Internet Portals',
        annual_revenue: '5000000',
        annual_revenue_merchant: null,
        annual_revenue_treasury: null,
        annual_revenue_business_card: null,
        total_revenue: '5000000',
        phone_fax: null,
        billing_address_street: null,
        billing_address_city: null,
        billing_address_state: null,
        billing_address_postalcode: null,
        billing_address_country: null,
        rating: null,
        phone_office: '(626) 244-8533',
        phone_alternate: null,
        website: 'imcardboard.com',
        employees: 18,
        ticker_symbol: null,
        address_street: '128 E Palm Avenue Suite 100',
        address_suite: null,
        address_city: 'Monrovia',
        address_state: 'California',
        address_postalcode: null,
        address_country: 'US',
        sic_code: null,
        status: null,
        naics_code: '32213',
        is_customer: false,
        cif: null,
        branch: null,
        external_id: '26271962',
        avatar: 'https://media.rocketreach.co/logo_url/i-am-cardboard-eb28c494',
        label_id: null,
        tenant_id: 'cacadeee-0000-4000-a000-000000000001',
      },
    },
    {
      id: '91d81d8a-4082-45ac-837e-d922a6bd050f',
      summary: 'Checklist item updated',
      type: 'updated',
      object_data: {
        deleted: false,
        do_not_call: false,
        is_customer: false,
        label_id: null,
        id: '69232e3f-38ea-457c-9a9e-d14512a290ab',
        first_name: 'Vikhyath',
        last_name: 'Rao',
        email_work: 'vikhyath@gmail.com',
        phone_work: '',
        avatar: null,
        title: 'Senior Software Engineer',
        primary_address_city: 'Sunnyvale',
        primary_address_state: 'CA ',
        external_id: '57844468',
        organization_id: '1f37d66b-bccf-4624-89b1-81b5ccde2303',
        date_entered: '2023-08-24T07:30:51.742Z',
        date_modified: '2023-08-24T07:30:51.742Z',
      },
      content: null,
      created_by: 'fccd3e90-9cbf-43a5-bca4-9329625819f7',
      updated_by: null,
      contact_id: null,
      organization_id: '1f37d66b-bccf-4624-89b1-81b5ccde2303',
      deal_id: null,
      tenant_id: 'cacadeee-0000-4000-a000-000000000001',
      created_at: '2023-08-24T03:34:51.752Z',
      updated_at: '2023-08-24T03:34:51.752Z',
      deleted_at: null,
      total_comments: 0,
      activity_id: null,
      created_by_info: {
        id: 'fccd3e90-9cbf-43a5-bca4-9329625819f7',
        first_name: 'Michael',
        last_name: 'Grey',
        email: 'osa.mammursleen@gmail.com',
        title: 'Software Developer Relations',
        avatar: 'ec557892-7d0c-44fc-8bc9-4e35a005fd4d',
        status: 'active',
        roleId: '26769639-0616-41f8-8379-68650cfc26c8',
        groupId: '6543ec45-eb27-4ad6-8a63-3bd7a483ea78',
        last_access: '2023-08-30T08:14:48.080Z',
        last_page: null,
        phone: null,
        tenant_id: 'cacadeee-0000-4000-a000-000000000001',
        created_at: '2023-01-19T07:26:00.311Z',
        updated_at: '2023-08-30T08:14:48.080Z',
      },
      updated_by_info: null,
      deal: null,
      contact: null,
      organization: {
        id: '1f37d66b-bccf-4624-89b1-81b5ccde2303',
        name: 'Google Inc',
        date_entered: '2023-08-03T06:20:54.424Z',
        date_modified: '2023-08-03T06:20:54.424Z',
        modified_user_id: '2f589eff-46a5-453c-b971-692ae21fc1d8',
        created_by: '2f589eff-46a5-453c-b971-692ae21fc1d8',
        deleted: false,
        assigned_user_id: '2f589eff-46a5-453c-b971-692ae21fc1d8',
        industry: 'Search Engines & Internet Portals',
        annual_revenue: '5000000',
        annual_revenue_merchant: null,
        annual_revenue_treasury: null,
        annual_revenue_business_card: null,
        total_revenue: '5000000',
        phone_fax: null,
        billing_address_street: null,
        billing_address_city: null,
        billing_address_state: null,
        billing_address_postalcode: null,
        billing_address_country: null,
        rating: null,
        phone_office: '(626) 244-8533',
        phone_alternate: null,
        website: 'imcardboard.com',
        employees: 18,
        ticker_symbol: null,
        address_street: '128 E Palm Avenue Suite 100',
        address_suite: null,
        address_city: 'Monrovia',
        address_state: 'California',
        address_postalcode: null,
        address_country: 'US',
        sic_code: null,
        status: null,
        naics_code: '32213',
        is_customer: false,
        cif: null,
        branch: null,
        external_id: '26271962',
        avatar: 'https://media.rocketreach.co/logo_url/i-am-cardboard-eb28c494',
        label_id: null,
        tenant_id: 'cacadeee-0000-4000-a000-000000000001',
      },
    },
  ],
};

export const staticChecklist = {
  title: 'ACH Audit Automation',
  global: true,
  active: true,
  clientMessage:
    'Its again that time of year where we ask you to complete your ACH file. Please complete the following checklist at your earliest convenience.',
  items: [
    {
      id: 1,
      title: 'Complete Questionnaire',
      attachment: { name: 'questionnaire.pdf' },
      type: ChecklistFieldsTabs.Client,
      status: ChecklistStatuses.InProgress,
      action: CHECKLIST_ACTIONS[1],
    },
    {
      id: 2,
      title: 'Compliance Agreement',
      attachment: { name: 'compliance.pdf' },
      type: ChecklistFieldsTabs.Client,
      status: ChecklistStatuses.InProgress,
      action: CHECKLIST_ACTIONS[1],
    },
    {
      id: 3,
      title: 'ACH Terms',
      attachment: { name: 'terms.pdf' },
      type: ChecklistFieldsTabs.Client,
      status: ChecklistStatuses.InProgress,
      action: CHECKLIST_ACTIONS[0],
    },
    {
      id: 4,
      title: 'Answer ACH Questionnaire',
      attachment: { name: 'terms.pdf' },
      type: ChecklistFieldsTabs.Client,
      status: ChecklistStatuses.InProgress,
      action: CHECKLIST_ACTIONS[0],
    },
  ],
  status: ChecklistStatuses.Pending,
};
