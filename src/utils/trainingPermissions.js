export const trainingPermissions = [
  {
    name: 'courses',
    label: 'Courses',
    tenantModule: 'courses',
    group: [
      {
        name: 'view',
        label: 'View',
        permissions: [
          {
            label: 'View',
            collection: 'courses',
            action: 'view',
          },
        ],
      },
      {
        name: 'create',
        label: 'Create',
        permissions: [
          {
            label: 'Create',
            collection: 'courses',
            action: 'create',
          },
        ],
      },
      {
        name: 'edit',
        label: 'Edit',
        permissions: [
          {
            label: 'Edit',
            collection: 'courses',
            action: 'edit',
          },
        ],
      },
      {
        name: 'delete',
        label: 'Delete',
        permissions: [
          {
            label: 'Delete',
            collection: 'courses',
            action: 'delete',
          },
        ],
      },
    ],
  },
  {
    name: 'categories',
    label: 'Categories',
    tenantModule: 'categories',
    group: [
      {
        name: 'view',
        label: 'View',
        permissions: [
          {
            label: 'View',
            collection: 'categories',
            action: 'view',
          },
        ],
      },
      {
        name: 'create',
        label: 'Create',
        permissions: [
          {
            label: 'Create',
            collection: 'categories',
            action: 'create',
          },
        ],
      },
      {
        name: 'edit',
        label: 'Edit',
        permissions: [
          {
            label: 'Edit',
            collection: 'categories',
            action: 'edit',
          },
        ],
      },
      {
        name: 'delete',
        label: 'Delete',
        permissions: [
          {
            label: 'Delete',
            collection: 'categories',
            action: 'delete',
          },
        ],
      },
    ],
  },
];
