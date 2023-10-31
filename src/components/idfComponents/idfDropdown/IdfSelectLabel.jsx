import { useState, useEffect, useContext } from 'react';
import Alert from '../../Alert/Alert';
import AlertWrapper from '../../Alert/AlertWrapper';
import DropdownLabels from '../../inputs/DropdownLabels/DropdownLabels';
import stringConstants from '../../../utils/stringConstants.json';
import labelServices from '../../../services/labels.service';
import { AlertMessageContext } from '../../../contexts/AlertMessageContext';

const IdfSelectLabel = ({
  value = null,
  type,
  onChange,
  validationConfig,
  fieldState,
  refresh,
  labelName = '',
}) => {
  const constantsOrg = stringConstants.deals.organizations;

  const { setSuccessMessage, setErrorMessage, successMessage, errorMessage } =
    useContext(AlertMessageContext);
  const [label, setLabel] = useState([]);
  const [checkGetDeals, setCheckGetDeals] = useState(false);

  useEffect(() => {
    (async () => {
      const labels = await getLabels().catch((err) => console.log(err));

      setLabel(labels || []);
    })();
  }, [checkGetDeals]);

  const getLabels = async () => {
    return await labelServices.getLabels(type).catch((err) => console.log(err));
  };

  const fieldInFields = (item) => {
    onChange({
      item,
      target: {
        name: 'label_id',
        value: item.id,
      },
    });
  };

  return (
    <>
      <DropdownLabels
        value={value}
        options={label}
        getLabels={() => setCheckGetDeals(!checkGetDeals)}
        placeholder={constantsOrg.placeholderDropdownLabels}
        onHandleSelect={(item) => fieldInFields(item)}
        refresh={refresh}
        validationConfig={validationConfig}
        fieldState={fieldState}
        btnAddLabel={constantsOrg.buttonAddLabels}
        type={type}
      />

      <AlertWrapper>
        <Alert message={successMessage} setMessage={setSuccessMessage} />
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
      </AlertWrapper>
    </>
  );
};

export default IdfSelectLabel;
