import moment from 'moment-timezone';
import { useEffect, useState } from 'react';

import PipelineCard from './PipelineCard';
import PipelineForm from './PipelineForm';
import Alert from '../../../components/Alert/Alert';
import AlertWrapper from '../../../components/Alert/AlertWrapper';
import dealService from '../../../services/deal.service';
import {
  DEAL_TITLE,
  DEAL_UPDATED,
  PRIMARY_OWNER,
  SOMETHING_IS_WRONG,
  CANT_UPDATE_OVERVIEW_INFO,
} from '../../../utils/constants';
import {
  setDateFormat,
  isToFixedNoRound,
  DATE_FORMAT,
} from '../../../utils/Utils';
import fieldService from '../../../services/field.service';
import { Col, ListGroupItem, Row } from 'reactstrap';
import { groupBy } from 'lodash';
import { removeCustomFieldsFromActivityForm } from '../contacts/utils';

const PipelineOverview = ({
  deal,
  getDeal,
  isPrincipalOwner,
  moduleMap,
  moduleData,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isFieldsData, setIsFieldsData] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [dealFormData, dispatch] = useState({});
  useEffect(() => {
    dispatch(deal);
  }, [deal]);
  const groupBySection = (fieldsList) => {
    setIsFieldsData(groupBy(fieldsList, 'section'));
  };
  const currentView = 'deal';
  const getFields = async () => {
    const { data } = await fieldService.getFields(currentView, {
      usedField: true,
    });
    groupBySection(data);
  };
  const { name, amount, date_closed, assigned_user } = deal || {};

  const onHandleSubmit = async (dealFormData) => {
    const {
      name,
      amount,
      currency,
      tenant_deal_stage_id,
      date_closed,
      assigned_user_id,
      sales_stage,
    } = dealFormData || {};

    const parsedAmount = parseInt(amount);

    const formOverview = {
      name,
      amount: Number.isFinite(parsedAmount) ? parsedAmount : undefined,
      currency,
      tenant_deal_stage_id,
      date_closed: date_closed
        ? moment(date_closed).tz('utc').startOf('day').toISOString()
        : undefined,
      assigned_user_id,
      sales_stage,
    };
    const updateFields = removeCustomFieldsFromActivityForm(
      formOverview,
      customFields
    );
    const resp = await dealService
      .updateDeal(deal.id, updateFields)
      .catch(() => setErrorMessage(SOMETHING_IS_WRONG));
    await Promise.all(
      customFields?.map(async (item) => {
        if (item.value === '$' || item.value === '') {
          await dealService.deleteCustomField(data.id, item.field_id);
        } else {
          await new Promise((resolve) => {
            dealService.updateCustomField(deal?.id, item).then(resolve);
          });
        }
      })
    );
    if (resp?.response?.data?.errors[0]?.message) {
      setEditMode(false);
      return setErrorMessage(CANT_UPDATE_OVERVIEW_INFO);
    }
    const { data } = resp || {};

    if (data.length) {
      setSuccessMessage(DEAL_UPDATED);
      getDeal();
      setEditMode(false);
    }
    setLoading(false);
  };
  useEffect(() => {
    getFields();
  }, []);

  const PipelineOverviewRow = ({ left, right }) => {
    return (
      <ListGroupItem className="w-100">
        <Row>
          <Col md={5}>{left}</Col>
          <Col md={7} className="text-right">
            {right}
          </Col>
        </Row>
      </ListGroupItem>
    );
  };

  const pipelineInfo = (moduleMap) => {
    if (editMode)
      return (
        <PipelineForm
          moduleMap={moduleMap}
          moduleData={moduleData}
          setEditMode={setEditMode}
          deal={deal}
          loading={loading}
          setLoading={setLoading}
          dealFormData={dealFormData}
          dispatch={dispatch}
          customDataFields={customFields}
          setCustomDataFields={setCustomFields}
          fields={isFieldsData}
          onHandleSubmit={onHandleSubmit}
        />
      );

    return (
      <div className="card-body py-2">
        <ul className="list-group list-group-flush list-group-no-gutters">
          <PipelineOverviewRow
            left={<span className="text-muted">{DEAL_TITLE}</span>}
            right={<span className="font-weight-medium">{name}</span>}
          />
          <PipelineOverviewRow
            left={<span className="text-muted">Amount</span>}
            right={
              <span className="font-weight-medium">
                {isToFixedNoRound(amount, 2)}
              </span>
            }
          />
          <PipelineOverviewRow
            left={<span className="text-muted">Closing Date</span>}
            right={
              <span className="font-weight-medium">
                {date_closed && setDateFormat(date_closed, DATE_FORMAT)}
              </span>
            }
          />
          <PipelineOverviewRow
            left={<span className="text-muted">{PRIMARY_OWNER}</span>}
            right={
              <span className="font-weight-medium">{`${
                assigned_user?.first_name || ''
              } ${assigned_user?.last_name || ''}`}</span>
            }
          />
        </ul>
      </div>
    );
  };

  return (
    <>
      <PipelineCard
        title="Overview"
        customFields={deal}
        onClick={() => {
          setEditMode((prev) => !prev);
        }}
        isPrincipalOwner={isPrincipalOwner}
      >
        {pipelineInfo(moduleMap)}
      </PipelineCard>
      <AlertWrapper>
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
        <Alert
          color="success"
          message={successMessage}
          setMessage={setSuccessMessage}
        />
      </AlertWrapper>
    </>
  );
};

export default PipelineOverview;
