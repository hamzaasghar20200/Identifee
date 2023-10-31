import React, { useEffect, useState } from 'react';
import { findIndex } from 'lodash';
import { ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import stageService from '../../../services/stage.service';
import routes from '../../../utils/routes.json';
import ActivitiesHistory from '../../ActivitiesHistory/ActivitiesHistory';
import stringConstant from '../../../utils/stringConstants.json';
import AlertWrapper from '../../Alert/AlertWrapper';
import Alert from '../../Alert/Alert';
import OwnerAvatar from '../../ActivitiesTable/OwnerAvatar';
import TooltipComponent from '../../lesson/Tooltip';

const DealCard = ({ item, formatNumber, onGetDeals }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState(0);
  const [stages, setStages] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const constants = stringConstant.deals.contacts.profile;

  const responseActivity = (msg) => {
    onGetDeals();
    switch (msg) {
      case constants.activityAdded:
        return setSuccessMessage(constants.activityAdded);
      case constants.updatedActivity:
        return setSuccessMessage(constants.updatedActivity);
      case constants.activityError:
        return setErrorMessage(constants.activityError);
      case constants.errorUpdatedActivity:
        return setErrorMessage(constants.errorUpdatedActivity);
      default:
        return false;
    }
  };

  const getStages = async () => {
    const pipelineId = item?.stage?.pipeline?.id;
    const stages = await stageService.getStages(pipelineId);
    setStages(stages);
  };

  const classnames = (index, stages, currentDeal) => {
    const stageIndex = findIndex(stages, {
      id: currentDeal.tenant_deal_stage_id || 'cold',
    });

    if (index <= stageIndex) {
      if (item.status === 'lost') return 'bg-red';

      return 'bg-green';
    }

    return 'bg-gray-400';
  };

  useEffect(() => {
    setName(item.name);
    setAmount(formatNumber(item.amount, 2));
    getStages();
  }, []);
  return (
    <div className="border rounded row w-100 m-auto">
      <AlertWrapper>
        <Alert message={successMessage} setMessage={setSuccessMessage} />
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
      </AlertWrapper>
      <div className="col-12">
        <div className="d-flex position-relative">
          <Link to={`${routes.dealsPipeline}/${item.id}`} className="w-100">
            <div className="w-100">
              <h4 className="ml-auto mt-2">{name}</h4>
              <span className="d-flex align-items-start">
                {' '}
                <OwnerAvatar
                  item={item?.assigned_user}
                  isMultiple={true}
                />{' '}
                <h6 className="mr-auto mt-1 ml-2">{amount}</h6>
              </span>
            </div>
          </Link>

          <span className="mt-2" onClick={(e) => e.stopPropagation()}>
            <ActivitiesHistory
              className="material-icons-outlined"
              icon={'add_circle'}
              organizationId={item?.organization?.id}
              response={responseActivity}
              dealId={item?.id}
              deal={item}
              owner={item?.assigned_user}
              organization={item?.organization}
              activities={item?.activities}
            />
          </span>
        </div>
        <div>
          <ProgressBar className="mb-2" style={{ height: '10px' }}>
            {stages?.map((stage, index) => {
              return (
                <TooltipComponent key={stage.id} title={stage.name}>
                  <ProgressBar
                    key={stage.id}
                    className={classnames(index, stages, item)}
                    now={100 / stages.length}
                    isChild={true}
                    style={
                      stages.length !== index && {
                        borderRight: '3px solid #fff',
                        borderRadius: '0 50px 50px 0',
                      }
                    }
                  />
                </TooltipComponent>
              );
            })}
          </ProgressBar>
        </div>
      </div>
    </div>
  );
};
export default DealCard;
