import {
  getChecklist,
  getChecklistStatus,
} from '../../utils/checklist.constants';
import MaterialIcon from '../commons/MaterialIcon';
import moment from 'moment/moment';
import { useProfileContext } from '../../contexts/profileContext';
import { useState } from 'react';
import ViewChecklist from '../fields/modals/ViewChecklist';
import useIsTenant from '../../hooks/useIsTenant';
import ChecklistStatus from './ChecklistStatus';

const ActivityChecklist = ({ organization }) => {
  const { profileInfo } = useProfileContext();
  const checklistFromStorage = getChecklist();
  const isGlobal = checklistFromStorage?.global;
  const isActive = checklistFromStorage?.active;
  const [viewChecklist, setViewChecklist] = useState(false);
  const { isExcelBank } = useIsTenant();

  const handleChecklistView = () => {
    setViewChecklist(true);
  };
  return (
    <>
      {isGlobal && isActive && isExcelBank ? (
        <div
          className="bg-gray-300 py-4 cursor-pointer border-bottom p-3"
          onClick={handleChecklistView}
        >
          <div className="d-flex align-items-center gap-1">
            <MaterialIcon icon="inventory" clazz="font-size-2em" />
            <div className="flex-fill">
              <div className="d-flex gap-1 justify-content-between align-items-center">
                <div className="d-flex gap-1 align-items-center">
                  <h5 className="mb-0">{checklistFromStorage.title}</h5>
                  <span className="text-muted fs-8">
                    Created on{' '}
                    {moment(
                      checklistFromStorage?.createdDate || new Date()
                    ).format('MM/DD/YYYY')}
                  </span>
                  <span className="font-weight-medium fs-8">
                    {organization?.name}
                  </span>
                </div>
                <ChecklistStatus
                  item={{
                    ...checklistFromStorage,
                    status: getChecklistStatus(checklistFromStorage),
                  }}
                />
              </div>
              <div className="fs-8">
                <span className="font-weight-medium">Due Date: </span>{' '}
                <span className="font-weight-bold">09/01/2023</span>
              </div>
              <div className="fs-8">
                <span className="font-weight-medium">Task Owner(s): </span>{' '}
                <span className="font-weight-bold">{profileInfo?.name}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <ViewChecklist
        openModal={viewChecklist}
        setOpenModal={setViewChecklist}
        organization={organization}
      />
    </>
  );
};

export default ActivityChecklist;
