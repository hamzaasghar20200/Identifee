import React, { useEffect, useState } from 'react';
import { Col, Row } from 'reactstrap';
import fieldService from '../services/field.service';
import { iconByTypeField } from '../components/peoples/constantsPeople';
import Alert from '../components/Alert/Alert';
import AlertWrapper from '../components/Alert/AlertWrapper';
import FieldSection from '../components/fields/FieldSection';
import {
  Actions,
  SECTIONS_WITH_FIELDS,
} from '../components/fields/fields.constants';

const ModuleFields = ({ filter }) => {
  const [fieldSections, setFieldSections] = useState(
    SECTIONS_WITH_FIELDS.filter(filter)
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const updateFieldSections = (action, fieldSection) => {
    switch (action) {
      case Actions.Update:
        setFieldSections(
          [...fieldSections].map((fs) =>
            fs.name === fieldSection.name ? { ...fieldSection } : { ...fs }
          )
        );
        break;
    }
  };

  const [options, setOptions] = useState([]);

  const getFieldOptions = async () => {
    try {
      const { data } = await fieldService.getOptions();

      const fieldsOption = data
        ?.map((item) => {
          const iconObj = iconByTypeField(item.field_type);
          return {
            ...item,
            name: iconObj.name || item.name,
            icon: iconObj.icon,
          };
        })
        .filter((field) => field.field_type !== 'PICKLIST_MULTI');

      setOptions(fieldsOption);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getFieldOptions();
  }, []);

  return (
    <>
      <AlertWrapper className="alert-position">
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
        <Alert
          color="success"
          message={successMessage}
          setMessage={setSuccessMessage}
        />
      </AlertWrapper>
      <div>
        <Row className="vertical-section-board flex-nowrap overflow-x-auto pb-2">
          {fieldSections.map((fieldSection, index) => (
            <Col
              key={index}
              className={`vertical-section ${index > 0 ? 'pl-0' : ''}`}
            >
              <FieldSection
                fieldSection={fieldSection}
                updateFieldSections={updateFieldSections}
                setErrorMessage={setErrorMessage}
                setSuccessMessage={setSuccessMessage}
                options={options}
                setOptions={setOptions}
              />
            </Col>
          ))}
        </Row>
      </div>
    </>
  );
};

export default ModuleFields;
