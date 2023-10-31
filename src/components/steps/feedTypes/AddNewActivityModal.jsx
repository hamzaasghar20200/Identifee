import { useEffect, useState } from 'react';

import RightPanelModal from '../../modal/RightPanelModal';
import AddActivity from '../../peopleProfile/contentFeed/AddActivity';
import fieldService from '../../../services/field.service';
import Loading from '../../Loading';
import { groupBy } from 'lodash';
import { RIGHT_PANEL_WIDTH, overflowing } from '../../../utils/Utils';
import { useProfileContext } from '../../../contexts/profileContext';

const AddNewActivityModal = ({
  event,
  task,
  call,
  children,
  openActivity,
  setOpenActivity,
  successMessage,
  setSuccessMessage,
  errorMessage,
  setErrorMessage,
  fromNavbar,
  setOpenList,
  searchValue,
  btnType,
  dealItem,
  shortcut,
}) => {
  const [isFieldsData, setIsFieldsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { profileInfo } = useProfileContext();

  const groupBySection = (fieldsList) => {
    setIsFieldsData(groupBy(fieldsList, 'section'));
  };
  const getFields = async (item) => {
    setLoading(true);
    const { data } = await fieldService.getFields(item, {
      preferred: true,
    });
    groupBySection(data);
    setLoading(false);
  };
  useEffect(() => {
    if (openActivity === true) {
      getFields(btnType);
    }
  }, [openActivity === true]);

  const toggle = () => {
    setOpenActivity(!openActivity);
    setOpenList && setOpenList(false);
    overflowing();
  };
  const loader = () => {
    if (loading) return <Loading />;
  };
  return (
    <>
      {children}
      <RightPanelModal
        showModal={openActivity}
        setShowModal={() => setOpenActivity(false)}
        showOverlay={true}
        containerBgColor={'pb-0'}
        containerWidth={RIGHT_PANEL_WIDTH}
        containerPosition={'position-fixed'}
        headerBgColor="bg-gray-5"
        Title={
          <div className="d-flex py-2 align-items-center text-capitalize">
            <h3 className="mb-0">
              Add{' '}
              {btnType
                .replace(/Call/g, call)
                .replace(/Task/g, task)
                .replace(/Event/g, event)}
            </h3>
          </div>
        }
      >
        {loading ? (
          loader()
        ) : (
          <AddActivity
            task={task}
            call={call}
            event={event}
            componentId={`add-${btnType}`}
            isModal={true}
            btnType={btnType}
            contactIs={'profile'}
            closeModal={toggle}
            getProfileInfo={profileInfo}
            successMessage={successMessage}
            setSuccessMessage={setSuccessMessage}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
            fromNavbar={fromNavbar}
            allFields={isFieldsData}
            searchValue={searchValue}
          />
        )}
      </RightPanelModal>
    </>
  );
};

export default AddNewActivityModal;
