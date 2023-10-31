import { useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import RightPanelModal from '../../../components/modal/RightPanelModal';
import ProspectLookupTabs from './ProspectLookupTabs';
import MaterialIcon from '../../commons/MaterialIcon';
import { PROSPECT_RIGHT_PANEL_WIDTH } from '../../../utils/Utils';

const ProspectLookupPanel = ({
  prospectModal,
  setProspectModal,
  profileInfo,
}) => {
  return (
    <RightPanelModal
      showModal={prospectModal}
      setShowModal={setProspectModal}
      profileInfo={profileInfo}
      containerWidth={PROSPECT_RIGHT_PANEL_WIDTH}
      Title={
        <div className="d-flex py-2 align-items-center">
          <MaterialIcon
            icon="person"
            clazz="font-size-xl text-white bg-secondary p-1 icon-circle mr-2"
          />
          <h4 className="mb-0">Prospect Lookup</h4>
        </div>
      }
    >
      <ProspectLookupTabs profileInfo={profileInfo} />
    </RightPanelModal>
  );
};

const ProspectLookup = ({ profileInfo }) => {
  const [prospectModal, setProspectModal] = useState(false);

  const onSearchProspect = () => {
    setProspectModal(true);
  };

  return (
    <>
      <OverlayTrigger
        key="prospectLookup"
        placement="bottom"
        overlay={
          <Tooltip
            id={`tooltip-niacs}`}
            className={`tooltip-profile font-weight-bold`}
          >
            <p>Prospect Lookup</p>
          </Tooltip>
        }
      >
        <div className="nav-item mb-2" onClick={onSearchProspect}>
          <div className="nav-icon cursor-pointer">
            <span className="material-icons-outlined text-white bg-green rounded-circle p-1">
              person
            </span>
          </div>
        </div>
      </OverlayTrigger>
      {prospectModal && (
        <ProspectLookupPanel
          prospectModal={prospectModal}
          setProspectModal={setProspectModal}
          profileInfo={profileInfo}
        />
      )}
    </>
  );
};

export default ProspectLookup;
