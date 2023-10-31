export const Messages = {
  Field: 'Field is created.',
  FieldUpdated: 'Field is updated.',
  FieldRemoved: 'Field is removed.',
  FieldLabelEmpty: 'Error: Field Label is Empty',
  FieldError: 'Error creating field. Please check console for details.',
  FieldExists: 'Error: Field label already exists.',
  FieldDefaultError:
    'Error creating default fields for $$type$$. Please check console for details.',
  FieldMoved: 'Field moved to default list.',
  FieldUnused: 'Field marked as unused.',
  FieldUpdateError: 'Error updating field. Please check console for details.',
  FieldLoadError:
    'Error getting fields for $$type$$. Please check console for details.',
  FieldQuickCreatePref: 'Fields are saved. They will be available in modal.',
  FieldQuickCreatePrefError:
    'Error creating quick preference fields. Please check console for errors.',
};

export const FIELD_NEW_KEY = 'FieldNew';

export const FieldTypeEnum = {
  organization: 'organization',
  contact: 'contact',
  deal: 'deal',
  product: 'product',
  task: 'task',
  call: 'call',
  event: 'event',
};

export const Actions = {
  Add: 'ADD',
  Edit: 'EDIT',
  Update: 'UPDATE',
  Save: 'SAVE',
  Remove: 'REMOVE',
  Delete: 'DELETE',
  Clone: 'CLONE',
  Default: 'DEFAULT',
  Move: 'MOVE',
};

// making it static, for now, will load dynamic when integrating with APIs
export const SECTIONS_WITH_FIELDS = [
  {
    name: 'Deals',
    nameDisplay: 'Pipeline',
    isDraggable: false,
    type: FieldTypeEnum.deal,
    fields: [],
  },
  {
    name: 'Contacts',
    isDraggable: false,
    type: FieldTypeEnum.contact,
    fields: [],
  },
  {
    name: 'Companies',
    isDraggable: false,
    type: FieldTypeEnum.organization,
    fields: [],
  },
  {
    name: 'Products',
    isDraggable: false,
    type: FieldTypeEnum.product,
    fields: [],
  },
  {
    name: 'Tasks',
    isDraggable: false,
    type: FieldTypeEnum.task,
    fields: [],
  },
  {
    name: 'Calls',
    isDraggable: false,
    type: FieldTypeEnum.call,
    fields: [],
  },
  {
    name: 'Events',
    isDraggable: false,
    type: FieldTypeEnum.event,
    fields: [],
  },
];

export const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  result.forEach((obj, index) => {
    obj.order = index + 1;
  });
  return result;
};
