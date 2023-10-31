import React from 'react';
import { DATE_FORMAT, setDateFormatUTC } from '../../utils/Utils';
import IdfTimePicker from '../idfComponents/idfDateTime/IfdTimePicker';
import { PricingField } from '../PricingFieldComponent';
import IdfDatePicker from '../idfComponents/idfDateTime/IdfDatePicker';
import { CheckboxInput } from '../layouts/CardLayout';
import InputValidationAdvance from '../commons/InputValidationAdvance';

export const VIEW_CARD = 'card';
export const VIEW_CUSTOM = 'custom';
export const VIEW_FORM = 'form';

export const dataInit = {
  name: '',
  type: {},
};

export const reducer = (state = [], { type, payload }) => {
  switch (type) {
    case 'create': {
      return payload;
    }
    case 'save': {
      return [...state, payload];
    }
    case 'edit': {
      const temp = [...state];
      const { index, data } = payload;
      temp[index] = data;

      return temp;
    }
    case 'delete': {
      const clone = [...state];
      clone.splice(payload, 1);

      return clone;
    }
    default:
      return state;
  }
};

export const iconByTypeField = (type) => {
  // TODO: i believe these should come from backend API, but for now it is like that
  switch (type) {
    case 'CURRENCY':
      return {
        icon: 'attach_money',
      };
    case 'EMAIL':
      return {
        icon: 'email',
      };
    case 'PHONE':
      return {
        icon: 'phone',
      };
    case 'URL':
      return {
        name: 'URL',
        icon: 'link',
      };
    case 'CHECKBOX':
      return {
        icon: 'check_box',
      };
    case 'CHAR': {
      return {
        name: 'Text',
        description: 'Text field is used to store texts up to 255 characters',
        field_type: 'CHAR',
        value_type: 'string',
        icon: 'text_rotation_none',
      };
    }
    case 'TEXT': {
      return {
        name: 'Large Text',
        description:
          'Long text field is used to store texts longer than usual.',
        field_type: 'TEXT',
        value_type: 'string',
        icon: 'text_fields',
      };
    }
    case 'NUMBER': {
      return {
        name: 'Numerical',
        description:
          'Number field is used to store data such as amount of commission or other custom numerical data.',
        field_type: 'NUMBER',
        icon: 'numbers',
        value_type: 'number',
      };
    }
    case 'TIME': {
      return {
        name: 'Time',
        description: 'Time field is used to store times.',
        field_type: 'TIME',
        value_type: 'date',
        icon: 'access_time',
      };
    }
    case 'DATE': {
      return {
        name: 'Date',
        description: 'Date field is used to store dates.',
        field_type: 'DATE',
        value_type: 'date',
        icon: 'today',
      };
    }
    case 'PICKLIST': {
      return {
        name: 'Picklist',
        description:
          'Picklist field is used to store a selected value from value_option.',
        field_type: 'PICKLIST',
        value_type: 'object',
        icon: 'checklist',
      };
    }
    case 'PICKLIST_MULTI': {
      return {
        name: 'Picklist Multi-Select',
        description:
          'Picklist Multi field is used to store a multiple selected value from value_option.',
        field_type: 'PICKLIST_MULTI',
        value_type: 'object',
        icon: 'checklist',
      };
    }
    default:
      return {
        name: 'Date',
        description: 'Date field is used to store dates.',
        field_type: 'DATE',
        value_type: 'date',
        icon: 'access_time',
      };
  }
};

export const renderValueField = (type, value) => {
  let val = '';
  switch (type) {
    case 'TIME': {
      return setDateFormatUTC(value, 'hh:mm A');
    }
    case 'DATE': {
      return setDateFormatUTC(new Date(value), DATE_FORMAT);
    }
    case 'PICKLIST':
      return value[0]?.value;
    case 'PICKLIST_MULTI':
      value.map((item) => (val = val + ', ' + item.value));
      return val.substring(1);
    case 'CHECKBOX':
      return value.toString();
    default:
      return value;
  }
};

export const renderComponent = (type, { children, ...props }) => {
  switch (type) {
    case 'TIME': {
      return React.cloneElement(<IdfTimePicker {...props} />);
    }
    case 'CHAR': {
      return React.cloneElement(<InputValidationAdvance {...props} />);
    }
    case 'DATE': {
      return React.cloneElement(<IdfDatePicker {...props} />);
    }
    case 'NUMBER': {
      return React.cloneElement(<InputValidationAdvance {...props} />);
    }
    case 'CURRENCY': {
      return React.cloneElement(<PricingField {...props} />);
    }
    case 'EMAIL': {
      return React.cloneElement(<InputValidationAdvance {...props} />);
    }
    case 'PHONE': {
      return React.cloneElement(<InputValidationAdvance {...props} />);
    }
    case 'URL': {
      return React.cloneElement(<InputValidationAdvance {...props} />);
    }
    case 'CHECKBOX': {
      return React.cloneElement(<CheckboxInput {...props} />);
    }
    case 'NUMERIC': {
      return React.cloneElement(<InputValidationAdvance {...props} />);
    }
    case 'TEXT': {
      return React.cloneElement(<InputValidationAdvance {...props} />);
    }
    default:
      return <InputValidationAdvance {...props} />;
  }
};
