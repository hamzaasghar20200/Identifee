import { useEffect, useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import RightPanelModal from '../../../components/modal/RightPanelModal';
import MaterialIcon from '../../commons/MaterialIcon';
import Write from '../../../pages/Write';
import { overflowing, PROSPECT_RIGHT_PANEL_WIDTH } from '../../../utils/Utils';

const WriteAIPanel = ({ newsstandModal, setNewsstandModal, profileInfo }) => {
  return (
    <RightPanelModal
      showModal={newsstandModal}
      setShowModal={setNewsstandModal}
      profileInfo={profileInfo}
      containerWidth={PROSPECT_RIGHT_PANEL_WIDTH}
      Title={
        <div className="d-flex py-2 align-items-center">
          <MaterialIcon
            icon="draw"
            clazz="font-size-xl text-white bg-orange p-1 icon-circle mr-2"
          />
          <h4 className="mb-0">Write</h4>
        </div>
      }
    >
      <Write layout="vertical" />
    </RightPanelModal>
  );
};

const WriteAI = ({ profileInfo }) => {
  const [showWriteAIPanel, setShowWriteAIPanel] = useState(false);

  const onNewsClick = () => {
    setShowWriteAIPanel(true);
  };

  useEffect(() => {
    return () => {
      setShowWriteAIPanel(false);
      overflowing();
    };
  }, []);
  return (
    <>
      <OverlayTrigger
        key="newsStand"
        placement="bottom"
        overlay={
          <Tooltip
            id={`tooltip-niacs}`}
            className={`tooltip-profile font-weight-bold`}
          >
            <p>Write</p>
          </Tooltip>
        }
      >
        <div className="nav-item" onClick={onNewsClick}>
          <div className="nav-icon cursor-pointer">
            <span className="material-icons-outlined text-white bg-orange rounded-circle p-1">
              draw
            </span>
          </div>
        </div>
      </OverlayTrigger>
      {showWriteAIPanel && (
        <WriteAIPanel
          newsstandModal={showWriteAIPanel}
          setNewsstandModal={setShowWriteAIPanel}
          profileInfo={profileInfo}
        />
      )}
    </>
  );
};

export default WriteAI;
