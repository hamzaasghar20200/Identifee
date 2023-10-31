import { useState, useEffect, useRef } from 'react';
import { Dropdown } from 'react-bootstrap';

import './ActivitiesHistory.css';
import AddActivity from '../peopleProfile/contentFeed/AddActivity';
import Activity from '../steps/Activity';
import stringConstants from '../../utils/stringConstants.json';
import RightPanelModal from '../modal/RightPanelModal';
import fieldService from '../../services/field.service';
import Loading from '../Loading';
import { groupBy } from 'lodash';
import {
  RIGHT_PANEL_WIDTH,
  isPermissionAllowed,
  overflowing,
} from '../../utils/Utils';
import { useProfileContext } from '../../contexts/profileContext';
import MaterialIcon from '../commons/MaterialIcon';
import IdfTooltip from '../idfComponents/idfTooltip';
import activityService from '../../services/activity.service';
import Alert from '../Alert/Alert';
import AlertWrapper from '../Alert/AlertWrapper';

const ActivitiesHistory = ({
  className,
  icon,
  contactId,
  organization,
  deal,
  organizationId,
  dealId,
  owner,
  limit = 3,
  response,
  activities = [],
}) => {
  const withoutActivities = 'activities-without-activities';
  const activitiesPlanned = 'activities-planned';
  const activitiesOverdue = 'activities-overdue';
  const constants = stringConstants.deals.contacts.profile;
  const isMounted = useRef(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { profileInfo } = useProfileContext();
  const [showModalActivity, setShowModalActivity] = useState(false);
  const [title, setTitle] = useState(constants.withoutPlanned);
  const [btn, setBtn] = useState(null);
  const [currentFeed, setCurrentFeed] = useState({});
  const [isFieldsData, setIsFieldsData] = useState([]);
  const [btnType, setIsBtnType] = useState('');
  const [loading, setLoading] = useState(false);
  const groupBySection = (fieldsList) => {
    setIsFieldsData(groupBy(fieldsList, 'section'));
  };
  const getFields = async (item) => {
    setLoading(true);
    const fieldsData = await fieldService.getFields(item, {
      preferred: true,
    });
    groupBySection(fieldsData?.data);
    setLoading(false);
  };
  const EditFields = async (item, response) => {
    setLoading(true);
    const fieldsData = await fieldService.getFields(item?.type, {
      usedField: true,
    });
    const {
      data: { data: customFields },
    } = await activityService.getCustomField(item?.id, {
      page: 1,
      limit: 50,
    });
    let customValues = {};
    fieldsData?.data.forEach((field) => {
      if (field.isCustom) {
        customFields.forEach((item) => {
          if (field.key === item.field.key && field.field_type !== 'DATE') {
            customValues = {
              ...customValues,
              [field.key?.toLowerCase().replace(/\s+/g, '')]:
                field.field_type === 'CURRENCY'
                  ? item.value.substring(1)
                  : item.value,
            };
          } else if (
            field.key === item.field.key &&
            field.field_type === 'DATE'
          ) {
            customValues = {
              ...customValues,
              [field.key?.toLowerCase().replace(/\s+/g, '')]: new Date(
                item.value
              ),
            };
          }
        });
      }
    });
    customValues = { ...response?.data, ...customValues };
    setCurrentFeed(customValues);
    groupBySection(fieldsData?.data);
    setLoading(false);
  };
  const confirm = (msg) => {
    setShowModalActivity(false);
    response(msg);
  };

  useEffect(() => {
    const el = document.getElementById(`btn-${dealId}`);
    el.classList.add(withoutActivities);
    setBtn(el);
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      if (activities.length) {
        for (let i = 0; i < activities.length; i++) {
          const activity = activities[i];
          if (new Date(activity.start_date) < new Date()) {
            setTitle(constants.overdue);
            btn.classList.replace(withoutActivities, activitiesOverdue);
            break;
          } else if (
            new Date(activity.start_date).getDay() === new Date().getDay()
          ) {
            if (new Date(activity.start_date) >= new Date()) {
              setTitle(constants.today);
              btn.classList.replace(withoutActivities, activitiesPlanned);
              break;
            }
          } else if (i === activities.length - 1) {
            if (constants.today !== title) {
              setTitle(constants.planned);
              btn.classList.replace(withoutActivities, activitiesPlanned);
              break;
            }
          }
        }
      }
    } else isMounted.current = true;
  }, [activities, isMounted.current]);

  const onHandleShowEditActivity = async (obj) => {
    const response = await activityService.getSingleActivity(obj?.id);
    setShowModalActivity(true);
    setIsBtnType(obj?.type);
    EditFields(obj, response);
  };
  const handleShow = (item) => {
    getFields(item);
    setIsBtnType(`${item}`);
    setCurrentFeed({});
    setShowModalActivity(true);
  };
  const handleCloseModal = () => {
    setShowModalActivity(false);
    setIsFieldsData([]);
  };
  const loader = () => {
    if (loading) return <Loading />;
  };
  const permission = {
    collection: 'activities',
    action: 'create',
  };

  return (
    <>
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
      <div className="activities-btn">
        <Dropdown>
          <Dropdown.Toggle
            id={`btn-${dealId}`}
            as="a"
            className={
              'dropdown-hide-arrow text-secondary cursor-pointer action-items bg-hover-gray position-relative'
            }
            style={{ border: 0 }}
          >
            <IdfTooltip text="Add">
              <a
                className="position-relative icon-hover-bg text-primary"
                style={{ top: -5 }}
              >
                <MaterialIcon icon={icon} symbols clazz={className} />
              </a>
            </IdfTooltip>
          </Dropdown.Toggle>
          <Dropdown.Menu
            className={`modal-history-activities rounded z-index-99`}
          >
            <div>
              {activities.length
                ? activities.map((item, i) => {
                    if (i < limit) {
                      return (
                        <Activity
                          key={item.id}
                          data={item}
                          confirm={confirm}
                          onHandleEdit={onHandleShowEditActivity}
                        />
                      );
                    } else return null;
                  })
                : null}
            </div>

            <div className="max-w-200 min-width-200 px-0">
              {isPermissionAllowed(
                permission?.collection,
                permission.action
              ) ? (
                <>
                  <button
                    className="btn btn-light p-2_1 text-left font-size-sm2 cursor-pointer bg-hover-gray btn-lg rounded-0 btn-block w-100"
                    onClick={() => {
                      handleShow('task');
                    }}
                  >
                    <span className={className}>{'task_alt'}</span>
                    <span className="ml-1 font-weight-medium">
                      Create a Task
                    </span>
                  </button>
                  <button
                    className="btn btn-light p-2_1 mt-0 text-left font-size-sm2 border-top-0 border-bottom-0 cursor-pointer bg-hover-gray btn-lg rounded-0 btn-block w-100"
                    onClick={() => {
                      handleShow('event');
                    }}
                  >
                    <span className={className}>{'event'}</span>
                    <span className="ml-1 font-weight-medium">
                      Create an Event
                    </span>
                  </button>
                  <button
                    className="btn btn-light p-2_1 mt-0 text-left font-size-sm2 cursor-pointer bg-hover-gray btn-lg btn-block rounded-0 w-100"
                    onClick={() => {
                      handleShow('call');
                    }}
                  >
                    <span className={className}>{'phone'}</span>
                    <span className="ml-1 font-weight-medium">Log a Call</span>
                  </button>
                </>
              ) : (
                <div className="px-3">
                  <span className="font-weight-bold">No Access</span>
                </div>
              )}
            </div>
          </Dropdown.Menu>
        </Dropdown>
        <RightPanelModal
          showModal={showModalActivity}
          setShowModal={() => {
            overflowing();
            handleCloseModal();
          }}
          showOverlay={true}
          containerBgColor={'pb-0'}
          containerWidth={RIGHT_PANEL_WIDTH}
          containerPosition={'position-fixed'}
          headerBgColor="bg-gray-5"
          Title={
            <div className="d-flex py-2 align-items-center">
              <h3 className="mb-0 text-capitalize">
                {currentFeed?.id ? `Edit ${btnType}` : `Add ${btnType}`}
              </h3>
            </div>
          }
        >
          {loading ? (
            loader()
          ) : (
            <AddActivity
              organizationId={organizationId}
              dealId={dealId}
              contactIs={'organization'}
              getProfileInfo={profileInfo}
              profileRefresh={confirm}
              isModal={true}
              btnType={btnType}
              dataType={'deal'}
              allFields={isFieldsData}
              feedInfo={currentFeed}
              setErrorMessage={setErrorMessage}
              setSuccessMessage={setSuccessMessage}
              feedId={currentFeed?.id}
              activityData={currentFeed}
              closeModal={() => setShowModalActivity(false)}
              organization={organization}
              deal={deal}
              owner={owner}
            />
          )}
        </RightPanelModal>
      </div>
    </>
  );
};

export default ActivitiesHistory;
