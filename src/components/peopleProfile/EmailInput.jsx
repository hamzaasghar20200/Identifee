import React, { useState, useEffect } from 'react';

import DropdownSelect from '../DropdownSelect';

const maxEmails = 3;
const defaultLabels = [
  { key: 'email_work', value: 'Work' },
  { key: 'email_other', value: 'Other' },
  { key: 'email_fax', value: 'Fax' },
  { key: 'email_mobile', value: 'Mobile' },
  { key: 'email_home', value: 'Personal' },
];

const EmailInput = ({
  data,
  setInputs,
  selectedInput,
  validationConfig,
  fieldState,
}) => {
  const [count, setCount] = useState(1);
  const [emailInputs, setEmailInputs] = useState(undefined);

  useEffect(() => {
    const dataEmails = {
      email_work: data?.email_work,
      email_other: data?.email_other,
      email_home: data?.email_home,
      email_fax: data?.email_fax,
      email_mobile: data?.email_mobile,
    };

    if (dataEmails && Object.values(dataEmails).length > 0) {
      const newData = Object.entries(dataEmails).filter(([_, value]) => value);
      if (newData.length > 0) {
        setEmailInputs(
          newData.map((item) => ({
            name: item[0],
            value: item[1],
            index: item[0],
          }))
        );
      }
    }
  }, [data]);

  useEffect(() => {
    if (!emailInputs || emailInputs.length === 0) {
      setEmailInputs([
        {
          name: 'email_1',
          value: '',
          index: defaultLabels[0].key,
        },
      ]);
    }
    updateGlobalForm();
  }, [emailInputs]);

  const addInput = () => {
    setEmailInputs((prev) => [
      ...prev,
      {
        name: `email_${count + 1}`,
        value: '',
        index: defaultLabels[prev.length].key,
      },
    ]);
    setCount(count + 1);
  };

  const updateGlobalForm = () => {
    const defaultEmails = {
      email_work: '',
      email_home: '',
      email_other: '',
    };

    const newData = emailInputs?.reduce((acc, item) => {
      acc[item.index] = item.value;
      return acc;
    }, defaultEmails);
    setInputs(newData);
  };

  const removeInput = (name) => {
    setCount(count + 1);
    const newInputs = emailInputs.filter((input) => input.name !== name);
    setEmailInputs(newInputs);
  };

  const handleChange = (event) => {
    const { name, value } = event?.target;
    setEmailInputs(
      emailInputs.map((item) => {
        if (item.name === name) {
          item.value = value;
        }
        return item;
      })
    );
  };

  const handleChangeSelect = (name, newItem) => {
    setEmailInputs(
      emailInputs.map((item) => {
        if (item.name === name) {
          item.index = newItem.name;
        }
        return item;
      })
    );
  };

  const getOptions = () => {
    return defaultLabels.map((item) => ({
      id: item.key,
      name: item.key,
      title: item.value,
    }));
  };

  return (
    <>
      <div className="form-group mb-0">
        {emailInputs &&
          emailInputs?.map((input) => (
            <div
              key={input.name}
              className={`input-group position-relative mb-2 input-group-sm-down-break align-items-center show-on-hover ${
                validationConfig?.required
                  ? 'border-left-4 border-left-danger'
                  : ''
              } ${
                fieldState?.invalid && !fieldState?.error?.ref?.value
                  ? 'border-danger'
                  : ''
              }`}
            >
              <input
                className="form-control border-right-0 input-dropGroup"
                type="text"
                name={input.name}
                value={input.value}
                placeholder="Email"
                onChange={handleChange}
              />
              <div className="w-25">
                <DropdownSelect
                  isSmall
                  onHandleSelect={(selected) => {
                    handleChangeSelect(input.name, selected);
                  }}
                  data={getOptions()}
                  customTitle="title"
                  select={selectedInput || input.index}
                  group
                />
              </div>

              <span
                onClick={removeInput.bind(null, input.name)}
                style={{ right: '-23px' }}
                className="material-icons-outlined position-absolute icon-hover-bg remove-additional-field-icon"
              >
                delete
              </span>
            </div>
          ))}

        <button
          type="button"
          className="js-create-field form-link mt-0 px-0 mb-2 btn btn-sm btn-no-focus btn-ghost-primary"
          disabled={emailInputs?.length >= maxEmails}
          onClick={addInput}
        >
          <i className="material-icons-outlined">add</i> Add Email
        </button>
      </div>
    </>
  );
};

EmailInput.defaultProps = {
  data: {
    email_work: '',
    email_home: '',
    email_other: '',
  },
};

export default EmailInput;
