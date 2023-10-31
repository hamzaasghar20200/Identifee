import ProspectSaveSearch from './ProspectSaveSearch';
import { numbersWithComma } from '../../../utils/Utils';

const ProspectResults = ({
  filter,
  pagination,
  type,
  setErrorMessage,
  setSuccessMessage,
}) => {
  return (
    <div className="d-flex align-items-center">
      <span className="text-gray-900 fs-7 mr-1">
        {' '}
        {numbersWithComma(pagination?.total || '0')} results.
      </span>
      <ProspectSaveSearch
        filter={filter}
        type={type}
        setSuccessMessage={setSuccessMessage}
        setErrorMessage={setErrorMessage}
      />
    </div>
  );
};

export default ProspectResults;
