import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import routes from '../../../utils/routes.json';

import dealService from '../../../services/deal.service';
import {
  ALL_LABEL,
  DEAL_CONTACT,
  EMPTY_CURRENCY,
} from '../../../utils/constants';
import AlertWrapper from '../../Alert/AlertWrapper';
import DealForm from '../../deals/DealForm';
import Alert from '../../../components/Alert/Alert';
import fieldService from '../../../services/field.service';
import RightPanelModal from '../../modal/RightPanelModal';
import { useForm } from 'react-hook-form';
import { RIGHT_PANEL_WIDTH, overflowing } from '../../../utils/Utils';
import { groupBy } from 'lodash';
import stageService from '../../../services/stage.service';
import pipelineServices from '../../../services/pipeline.services';
import { removeCustomFieldsFromActivityForm } from '../../../views/Deals/contacts/utils';
import { useModuleContext } from '../../../contexts/moduleContext';

const AddDeal = ({
  organizationId,
  onGetDeals,
  children,
  setOpenDeal,
  contactProfile,
  openDeal,
  profileInfo,
  errorMessage,
  setErrorMessage = () => {},
  successMessage,
  setSuccessMessage = () => {},
  fromNavbar,
  setOpenList,
  searchValue,
  initialDeals,
  selectedStage,
  pipeline,
}) => {
  const dealsObj = {
    name: '',
    currency: 'USD',
    tenant_deal_stage_id: '',
    contact_organization_id: '',
    date_closed: '',
    assigned_user_id: '',
  };
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preOwners, setPreOwners] = useState([]);
  const [selectOrganization, setSelectOrganization] = useState({});
  const [selectContactPerson, setSelectContactPerson] = useState({});
  const [selectedPipeline, setSelectedPipeline] = useState({});
  const [pipelineStages, setPipelineStages] = useState([]);
  const [selectTitle, setSelectTitle] = useState(ALL_LABEL);
  const [pipelines, setPipelines] = useState([]);
  const [, setLoadingPipelines] = useState(false);
  const [getOrganizationId, setOrganizationsId] = useState('');
  const [getContactId, setContactId] = useState('');
  const [dealFormData, dispatchFormData] = useState(dealsObj);
  const [isLoading, setIsLoading] = useState(false);
  const [isFieldsData, setIsFieldsData] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState({ orgName: '' });
  const [selectedPipelineStage, setSelectedPipelineStage] = useState('');

  const { moduleMap } = useModuleContext();
  const [searchOrg, setSearchOrg] = useState({
    search: '',
  });
  const [searchContact, setSearchContact] = useState({
    search: '',
  });
  const currentView = 'deal';
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getFieldState,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: dealsObj,
  });
  const groupBySection = (fieldsList) => {
    setIsFieldsData(groupBy(fieldsList, 'section'));
  };
  const getFields = async () => {
    setIsLoading(true);
    const { data } = await fieldService.getFields(currentView, {
      preferred: true,
    });
    if (data.length > 0) {
      groupBySection(data);
      setIsLoading(false);
    } else {
      const { data } = await fieldService.createDefaultFields(currentView);
      groupBySection(data);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (openDeal === true) {
      getFields();
    }
  }, [openDeal]);

  const toggle = () => {
    setOpenDeal(!openDeal);
    setOpenList && setOpenList(false);
    overflowing();
    setCustomFields([]);
  };
  const onClose = () => {
    setSelectOrganization();
    setSelectContactPerson();
    toggle();
    setIsFieldsData([]);
    overflowing();
    setCustomFields([]);
    const dealsReset = {
      name: '',
      currency: 'USD',
      tenant_deal_stage_id: '',
      contact_organization_id: '',
      date_closed: '',
      assigned_user_id: '',
    };
    reset(dealsReset);
    dispatchFormData(dealsReset);
  };

  const onHandleSubmit = async () => {
    setLoading(true);
    if (dealFormData.amount && !dealFormData.currency) {
      setLoading(false);
      setErrorMessage(EMPTY_CURRENCY);
      return setError(EMPTY_CURRENCY);
    }
    dealFormData.sales_stage = dealFormData.deal_type || 'cold';
    let products;
    if (dealFormData?.products?.length) {
      products = dealFormData?.products.filter(({ product_id }) => product_id);
    }
    const parsedAmount = parseInt(dealFormData.amount);

    const dataDeal = {
      ...dealFormData,
      amount: Number.isFinite(parsedAmount) ? parsedAmount : undefined,
      date_closed: new Date(dealFormData.date_closed),
      position: 0,
      products,
    };
    const updateFields = removeCustomFieldsFromActivityForm(
      dataDeal,
      customFields
    );
    const newDeal = await dealService.createDeal(updateFields).catch((err) => {
      setErrorMessage(err.messgae);
      setError(err.message);
    });

    if (newDeal) {
      await Promise.all(
        customFields?.map(async (item) => {
          await new Promise((resolve) => {
            if (item?.value !== '')
              dealService
                .updateCustomField(newDeal?.data?.id, item)
                .then(resolve);
          });
        }),
        preOwners?.map(async (item) => {
          await new Promise((resolve) => {
            dealService.addOwner(newDeal?.data?.id, item.user_id).then(resolve);
          });
        })
      );
      setSelectedPipeline();
      setPipelineStages();
      setSelectTitle();
      setPipelines();
      setSelectOrganization();
      setSelectContactPerson();
      setSearchOrg({
        search: '',
      });
      setSearchContact({
        search: '',
      });
      onClose();
      setPreOwners([]);
      setSuccessMessage(DEAL_CONTACT);
      setSuccess(DEAL_CONTACT);
      history.push(`${routes.dealsPipeline}/${newDeal?.data?.id}`);
      setOrganizationsId('');
      setContactId('');
      if (fromNavbar) {
        history.push(`${routes.dealsPipeline}/${newDeal?.data?.id}`);
      }
    }

    setTimeout(() => {
      setLoading(false);
      onGetDeals && onGetDeals();
    }, 3000);
  };
  const getPipelineStages = async () => {
    const pipelineId = selectedPipeline?.id;
    if (pipelineId || pipeline) {
      const stages = await stageService.getPipelineStages(
        pipelineId || pipeline?.id
      );
      const newStages = stages.map((stage) => {
        return {
          id: stage.id,
          name: stage.name,
          title: stage.name,
          stagePosition: stage.position,
        };
      });
      const newStage = selectedStage || newStages[0];
      setSelectedPipelineStage(newStage);
      dispatchFormData({
        ...dealFormData,
        tenant_deal_stage_id: newStage?.id,
      });
      setValue('tenant_deal_stage_id', newStage?.id);
      setPipelineStages(newStages);
      setSelectedStageOrFirst(newStage);
    }
  };
  useEffect(() => {
    getPipelineStages();
    setSelectedPipelineStage(selectedStage);
  }, [pipeline, selectedStage]);
  function setSelectedStageOrFirst(firstStage) {
    let initialLabel = '';

    // setting pre-selected stage if the component gets it from some other component
    if (firstStage && Object.hasOwn(firstStage, 'title')) {
      initialLabel = {
        id: firstStage.id,
        title: firstStage.title,
      };
    } else {
      initialLabel = find(initialDeals) || firstStage;
    }
    setSelectTitle(initialLabel?.title || 'Select Pipeline Stage');
  }
  useEffect(() => {
    (async () => {
      setLoadingPipelines(true);
      const { data } = await pipelineServices.getPipelines();
      const updatedPipelines = data?.map((p) => ({ ...p, key: p.id }));
      setPipelines(updatedPipelines);
      // when open this from navbar look for default pipeline first, if found select it
      // if (fromNavbar) {
      const defaultPipeline = updatedPipelines.find((p) => p.isDefault);
      setSelectedPipeline(
        pipeline?.id
          ? pipeline
          : updatedPipelines?.length
          ? defaultPipeline || updatedPipelines[0]
          : {}
      );
      setLoadingPipelines(false);
    })();
  }, [openDeal]);
  const [containerWidth, setContainerWidth] = useState(RIGHT_PANEL_WIDTH);
  useEffect(() => {
    const groups = Object.keys(isFieldsData);
    if (groups.length) {
      for (const grp of groups) {
        const field = isFieldsData[grp];
        field.forEach((item) => {
          const { columnName, key } = item;
          const fieldName = columnName
            ? columnName.toLowerCase()
            : key?.toLowerCase().replace(/\s+/g, '');
          setValue(fieldName, dealFormData[fieldName]);
        });
      }
    }
  }, [isFieldsData]);

  useEffect(() => {
    if (profileInfo?.name || contactProfile?.first_name) {
      setSelectedOrg({
        orgName:
          selectOrganization?.name ||
          profileInfo?.name ||
          contactProfile?.organization?.name,
      });
    }
  }, [profileInfo, contactProfile]);
  return (
    <>
      <RightPanelModal
        showModal={openDeal}
        setShowModal={() => onClose()}
        showOverlay={true}
        containerBgColor={'pb-0'}
        containerWidth={containerWidth}
        containerPosition={'position-fixed'}
        headerBgColor="bg-gray-5"
        Title={
          <div className="d-flex py-2 align-items-center">
            {moduleMap.deal && (
              <h3 className="mb-0">{`Add ${moduleMap.deal.singular}`}</h3>
            )}
          </div>
        }
      >
        {moduleMap.deal && (
          <DealForm
            moduleData={moduleMap}
            moduleMap={moduleMap.deal.singular}
            dispatch={dispatchFormData}
            dealFormData={dealFormData}
            profileInfo={profileInfo}
            searchValue={searchValue}
            isprincipalowner="true"
            pipeline={pipeline}
            prevalue="true"
            register={register}
            handleSubmit={handleSubmit(onHandleSubmit)}
            errors={errors}
            selectedOrg={selectedOrg}
            setSelectedOrg={setSelectedOrg}
            loading={loading}
            contactProfile={contactProfile}
            selectOrganization={selectOrganization}
            setSelectOrganization={setSelectOrganization}
            selectContactPerson={selectContactPerson}
            setSelectContactPerson={setSelectContactPerson}
            isLoading={isLoading}
            getPipelineStages={getPipelineStages}
            setValue={setValue}
            getFieldState={getFieldState}
            control={control}
            getOrganizationId={getOrganizationId}
            setOrganizationsId={setOrganizationsId}
            getContactId={getContactId}
            setContactId={setContactId}
            pipelines={pipelines}
            searchOrg={searchOrg}
            setSearchOrg={setSearchOrg}
            searchContact={searchContact}
            setSearchContact={setSearchContact}
            fields={isFieldsData}
            preowners={preOwners}
            onClose={onClose}
            customDataFields={customFields}
            setCustomDataFields={setCustomFields}
            selectedPipeline={selectedPipeline}
            setSelectedPipeline={setSelectedPipeline}
            pipelineStages={pipelineStages}
            setPipelineStages={setPipelineStages}
            selectTitle={selectTitle}
            setSelectTitle={setSelectTitle}
            setPreOwners={setPreOwners}
            initialDeals={initialDeals}
            fromNavbar={fromNavbar}
            selectedStage={selectedPipelineStage}
            setContainerWidth={setContainerWidth}
          />
        )}
      </RightPanelModal>
      {children}

      <AlertWrapper className="alert-position">
        <Alert
          color="danger"
          message={error || errorMessage}
          setMessage={setError || setErrorMessage}
        />
        <Alert
          color="success"
          message={success || successMessage}
          setMessage={setSuccess || setSuccessMessage}
        />
      </AlertWrapper>
    </>
  );
};

export default AddDeal;
