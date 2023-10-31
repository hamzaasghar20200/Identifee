/** Right Panel Modal, it will popup from right side of window , it takes Title , ShowModal, Children to render and Title as propgs. */

import React, { useEffect } from 'react';
import { overflowing } from '../../utils/Utils';
import TableActions from '../commons/TableActions';

const insightRightPanel = ({
  task,
  showModal,
  setShowModal,
  children,
  Title,
  settingIcon,
  headerBgColor = '',
  containerWidth = 625,
  containerBgColor = 'sidebar-footer-fixed bg-white',
  containerPosition = 'position-absolute',
  showOverlay = false,
  fromActivity = false,
  tableActions = false,
  activityObj = false,
}) => {
  const closeDialoge = async (e) => {
    setShowModal(false);
    overflowing();
  };

  useEffect(() => {
    if (showModal) {
      document.body.classList.remove('overflow-auto');
      document.body.classList.add('overflow-hidden');
    } else {
      overflowing();
    }
  }, [showModal]);

  return (
    <>
      <div
        id="linkedinSidebar"
        className={`hs-unfold-content transition sidebar sidebar-lg sidebar-bordered sidebar-box-shadow hs-unfold-content-initialized ${containerPosition} hs-unfold-simple ${
          showModal ? '' : 'hs-unfold-hidden'
        }`}
        data-hs-target-height="0"
        data-hs-unfold-content=""
        style={{ minWidth: containerWidth }}
      >
        <div className={`card sidebar-card overflow-auto ${containerBgColor}`}>
          <div
            className={`card-header ${
              fromActivity ? 'pt-2 pb-0' : 'py-2'
            } ${headerBgColor}`}
          >
            <h3 className={`card-header-title ${fromActivity ? 'w-100' : ''}`}>
              {Title}
            </h3>
            {fromActivity ? (
              <div className="align-self-start">
                <div className="d-flex py-2">
                  <TableActions
                    item={{ ...activityObj, title: name }}
                    actions={tableActions}
                  />
                  <a
                    className="js-hs-unfold-invoker btn icon-hover-bg btn-icon btn-sm"
                    onClick={(e) => closeDialoge(e)}
                  >
                    <i className="material-icons-outlined">clear</i>
                  </a>
                </div>
              </div>
            ) : (
              <div className="d-flex align-items-center">
                {settingIcon}
                <a
                  className="js-hs-unfold-invoker btn icon-hover-bg btn-icon btn-xs"
                  onClick={(e) => closeDialoge(e)}
                >
                  <i className="material-icons-outlined">clear</i>
                </a>
              </div>
            )}
          </div>
          {children}
        </div>
      </div>
      {showModal && showOverlay && (
        <div
          className={'position-fixed z-index-100 top-0 left-0 h-100 w-100'}
          style={{ background: 'rgba(0,0,0,0.45)' }}
        ></div>
      )}
    </>
  );
};

export default insightRightPanel;
