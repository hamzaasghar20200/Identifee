import React, { useEffect, useState } from 'react';
import fieldService from '../../services/field.service';
import { Messages } from './fields.constants';
import FieldSkeletonLoader from './FieldSkeletonLoader';
import NoDataFound from '../commons/NoDataFound';
import NoDataFoundTitle from './NoDataFoundTitle';
import MaterialIcon from '../commons/MaterialIcon';
import Search from '../manageUsers/Search';
import TooltipComponent from '../lesson/Tooltip';

const UnusedFieldsList = ({
  parentFields,
  setParentFields,
  groupBySection,
  setErrorMessage,
  setSuccessMessage,
  fieldSection,
  fieldTypes,
  onHandleMoveToDefault,
}) => {
  const [loader, setLoader] = useState(false);
  const [fields, setFields] = useState([]);
  const [searchUsedField, setSearchUsedField] = useState('');

  const getIconByFieldType = (fieldType) => {
    return fieldTypes.find((f) => f.field_type === fieldType).icon;
  };

  const loadFields = async () => {
    setLoader(true);
    try {
      const { data } = await fieldService.getFields(fieldSection.type, {
        usedField: false,
      });
      setFields(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoader(false);
    }
  };

  const updateFieldsLoading = (field, isLoading) => {
    setFields([
      ...fields.map((f) => (f.id === field.id ? { ...f, isLoading } : f)),
    ]);
  };

  // eslint-disable-next-line no-unused-vars
  const handleMoveToDefaultField = async (field) => {
    updateFieldsLoading(field, true);
    try {
      const updatingField = {
        ...field,
        usedField: !field.usedField,
      };
      const data = await fieldService.updateField(field.id, updatingField);

      const updatedFields = [
        ...fields
          .map((f) => (f.id === field.id ? { ...data, isLoading: false } : f))
          .filter((f) => f.id !== field.id),
      ];
      setFields(updatedFields);
      const newFields = [...parentFields, updatingField];
      setParentFields(newFields);
      groupBySection(newFields);
      setSuccessMessage(
        updatingField.usedField ? Messages.FieldMoved : Messages.FieldUnused
      );
    } catch (err) {
      setErrorMessage(Messages.FieldUpdateError);
      console.log(err);
    }
  };

  useEffect(() => {
    loadFields();
  }, [parentFields]);

  return (
    <div>
      {loader ? (
        <div className="my-1 px-3">
          <FieldSkeletonLoader rows={5} />
        </div>
      ) : (
        <>
          <div className="px-3">
            <h4 className="mt-4">Unused Fields</h4>
            {fields.length > 0 && (
              <Search
                classnames="col-xs col-md-12 p-0"
                searchPlaceholder={'Search'}
                value={searchUsedField}
                onHandleChange={(e) => {
                  setSearchUsedField(e.target.value);
                }}
              />
            )}
          </div>
          {fields.length > 0 ? (
            <div>
              {fields
                ?.filter((f) => !f.usedField)
                ?.filter((f) => f.key.toLowerCase().includes(searchUsedField))
                ?.map((field, index) => (
                  <div
                    key={index}
                    className="d-flex bg-hover-gray align-items-center gap-1 px-3"
                  >
                    <div className="d-flex my-2 flex-fill gap-1 position-relative setting-item border bg-white rounded align-items-center">
                      <p className="mb-0 p-2 border-right bg-gray-5 text-center">
                        <MaterialIcon
                          icon={getIconByFieldType(
                            field.field_type === 'PICKLIST_MULTI'
                              ? 'PICKLIST'
                              : field.field_type
                          )}
                          clazz="font-size-xl"
                        />
                      </p>
                      <div className="flex-fill px-2 font-size-sm2">
                        {field.key}
                        <div
                          className="position-absolute refresh-icon abs-center-y"
                          style={{ right: 10 }}
                        >
                          <TooltipComponent title="Move to Default Fields">
                            <a
                              onClick={() =>
                                onHandleMoveToDefault(field, fieldSection)
                              }
                              className={`icon-hover-bg d-flex align-items-center justify-content-center cursor-pointer`}
                            >
                              <MaterialIcon
                                icon="line_start_arrow"
                                symbols
                                clazz="text-gray-700 font-size-lg"
                              />{' '}
                            </a>
                          </TooltipComponent>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <NoDataFound
              icon="edit_note"
              containerStyle="text-gray-search my-6 py-6"
              title={
                <NoDataFoundTitle
                  str={`No unused ${(
                    fieldSection?.nameDisplay || fieldSection?.name
                  ).toLowerCase()} fields found.`}
                />
              }
            />
          )}
        </>
      )}
    </div>
  );
};

export default UnusedFieldsList;
