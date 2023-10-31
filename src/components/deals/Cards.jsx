import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { useHistory } from 'react-router-dom';
import { Col, Row } from 'react-bootstrap';

import dealService from '../../services/deal.service';
import ModalConfirm from '../modal/ModalConfirmDefault';
import { getProductsTotalAmount, isToFixedNoRound } from '../../utils/Utils';
import routes from '../../utils/routes.json';
import stringConstants from '../../utils/stringConstants.json';
import ActivitiesHistory from '../ActivitiesHistory/ActivitiesHistory';

import {
  CANT_REMOVE_DEAL,
  DEAL_DELETE_CONFIRMATION,
  DEAL_REMOVED,
  paginationDefault,
} from '../../utils/constants';
import Loading from '../Loading';
import Alert from '../Alert/Alert';
import AlertWrapper from '../Alert/AlertWrapper';
import MaterialIcon from '../commons/MaterialIcon';
import OwnerAvatar from '../ActivitiesTable/OwnerAvatar';
import TooltipComponent from '../lesson/Tooltip';

const Card = ({
  deal,
  index,
  onGetDeals,
  setNotification,
  loading,
  onAddDeal,
}) => {
  const history = useHistory();
  const {
    id,
    name,
    assigned_user,
    organization,
    contact,
    deal_products,
    amount,
    activities,
    deal_type,
    tenant_deal_stage_id,
  } = deal;

  const constants = stringConstants.deals.contacts.profile;
  const [removeDeal, setRemoveDeal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const contactName =
    organization?.name ||
    `${contact?.first_name || ''} ${contact?.last_name || ''}`;

  const onHandleRemove = async () => {
    setModalLoading(true);
    const resp = await dealService.deleteDeal(deal.id).catch((res) => {
      setNotification('error', res.message);

      setModalLoading(false);
    });

    if (resp?.response?.status === 401) {
      setNotification('error', CANT_REMOVE_DEAL);
    }

    if (resp.data) {
      setNotification('success', DEAL_REMOVED);
      setModalLoading(false);
    }

    toggleModal();
    onGetDeals(deal_type, tenant_deal_stage_id, paginationDefault.page);
  };

  const toggleModal = () => {
    setRemoveDeal((prev) => !prev);
  };

  const onHandleEdit = () => history.push(`${routes.dealsPipeline}/${id}`);

  // const onHandleAdd = () => {
  //   onAddDeal();
  // };

  const responseActivity = (msg) => {
    onGetDeals(
      deal?.tenant_deal_stage?.name,
      deal.tenant_deal_stage_id,
      deal.position,
      paginationDefault.page
    );
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

  return (
    <div style={{ position: 'relative' }}>
      <AlertWrapper>
        <Alert message={successMessage} setMessage={setSuccessMessage} />
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
      </AlertWrapper>
      {loading === id && (
        <div
          style={{
            position: 'absolute',
            top: '-30%',
            left: '45%',
            zIndex: 100,
          }}
        >
          <Loading />
        </div>
      )}

      <Draggable
        key={id}
        draggableId={`id-${id}-name-${name}`}
        index={index}
        isDragDisabled={Boolean(loading)}
      >
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="card mb-1 rounded"
          >
            <div
              className="card-body p-3 pb-0 position-relative"
              style={{
                background: loading === id && 'rgba(0,0,0,0.2)',
                opacity: loading === id && '0.8',
              }}
            >
              <Row className="d-flex hover-actions">
                <Col className="mr-2 deal-card">
                  <div onClick={onHandleEdit}>
                    <h5 className="text-wrap position-relative d-inline-flex gap-1 mb-0 fs-7">
                      <TooltipComponent title={contactName}>
                        <p
                          className="text-truncate mb-0"
                          style={{ maxWidth: 150 }}
                        >
                          {name}
                        </p>
                      </TooltipComponent>
                      <TooltipComponent title="View">
                        <a
                          className="position-absolute icon-hover-bg"
                          style={{ top: -7, right: -30 }}
                        >
                          <MaterialIcon
                            icon="visibility"
                            clazz="action-items cursor-pointer"
                          />
                        </a>
                      </TooltipComponent>
                    </h5>
                    <TooltipComponent title={contactName}>
                      <p
                        className="text-muted text-truncate fs-8 mb-2"
                        style={{ maxWidth: 150 }}
                      >
                        {contactName}
                      </p>
                    </TooltipComponent>
                  </div>
                  <Row className="pb-0">
                    <Col className="col">
                      <div className="media pb-2">
                        <OwnerAvatar item={assigned_user} isMultiple={true} />
                        <span className="text-primary font-weight-semi-bold mr-auto mt-1 ml-2 fs-8">
                          {deal_products?.length
                            ? isToFixedNoRound(
                                getProductsTotalAmount(deal_products),
                                2
                              )
                            : isToFixedNoRound(amount, 2)}
                        </span>
                      </div>
                    </Col>
                  </Row>
                </Col>
                <div className="d-flex flex-column justify-content-center align-items-center mh-100 pb-2 pr-1">
                  <span className="flex-grow-1 align-items-start">
                    <ActivitiesHistory
                      className="material-icons-outlined text-icon"
                      icon={'add_circle'}
                      organizationId={organization?.id}
                      response={responseActivity}
                      dealId={id}
                      activities={activities}
                      organization={organization}
                      deal={deal}
                      owner={assigned_user}
                    />
                  </span>
                  <span
                    className={`label alert mb-1 text-center mr-2 alert-sm fs-9 fw-bold text-uppercase text-white py-1 px-2 deal-types ${deal.status}`}
                  >
                    {deal.status}
                  </span>
                </div>
              </Row>
            </div>
          </div>
        )}
      </Draggable>

      <ModalConfirm
        open={removeDeal}
        onHandleConfirm={onHandleRemove}
        onHandleClose={toggleModal}
        textBody={DEAL_DELETE_CONFIRMATION}
        iconButtonConfirm="people"
        colorButtonConfirm={'outline-danger'}
        icon="report_problem"
        loading={modalLoading}
      />
    </div>
  );
};

export default Card;
