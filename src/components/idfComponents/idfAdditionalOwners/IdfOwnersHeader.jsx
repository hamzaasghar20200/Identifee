import { useContext } from 'react';

import IdfPrincipalOwnerAvatar from './IdfPrincipalOwnerAvatar';
import IdfAdditionalOwnersListAvatars from './IdfAdditionalOwnersListAvatars';
import AlertWrapper from '../../Alert/AlertWrapper';
import Alert from '../../Alert/Alert';
import { AlertMessageContext } from '../../../contexts/AlertMessageContext';
import './IdfAdditionalOwners.css';

const IdfOwnersHeader = (props) => {
  const { successMessage, setSuccessMessage, errorMessage, setErrorMessage } =
    useContext(AlertMessageContext);

  return (
    <>
      <div className="d-flex align-items-end gap-1 section-owners-header mr-3">
        <IdfPrincipalOwnerAvatar
          mainOwner={props?.me}
          {...props}
          isClickable={props.isClickable}
        />

        <IdfAdditionalOwnersListAvatars
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          successMessage={successMessage}
          setSuccessMessage={setSuccessMessage}
          allowDelete={props.allowDelete}
          activity={props?.activity}
          ownerOption={props?.ownerOption}
          ownerData={props.ownerData}
          setOwnerData={props?.setOwnerData}
          mainOwner={props.me}
          isClickable={props.isClickable}
          onClick={props.onClick}
          {...props}
        />
      </div>

      <AlertWrapper>
        <Alert
          message={errorMessage}
          setMessage={setErrorMessage}
          color="danger"
        />
        <Alert
          message={successMessage}
          setMessage={setSuccessMessage}
          color="success"
        />
      </AlertWrapper>
    </>
  );
};

export default IdfOwnersHeader;
