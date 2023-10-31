/* eslint-disable no-constant-condition */
import React, { useState, useEffect, useContext } from 'react';
import Heading from '../../components/heading';
import { Form } from 'reactstrap';
import { useHistory } from 'react-router';
import ButtonFilterDropdown from '../../components/commons/ButtonFilterDropdown';
import ButtonIcon from '../../components/commons/ButtonIcon';
import {
  AddComponentOptions,
  isMatchInCommaSeperated,
  overflowing,
  isPermissionAllowed,
} from '../../utils/Utils';
import NoDataFound from '../../components/commons/NoDataFound';
import MaterialIcon from '../../components/commons/MaterialIcon';
import {
  getComponentByDisplayType,
  getDisplayTypePretty,
} from './dashboard/dashboard.constants';
import { TenantContext } from '../../contexts/TenantContext';
import DashboardService from '../../services/dashboard.service';
import RightPanelModal from '../../components/modal/RightPanelModal';
import ButtonIconDropdownWrapper from '../../components/commons/ButtonIconDropdownWrapper';
import KpiWidgets from './dashboard/components/KpiWidgets';
import ChartWidgets from './dashboard/components/ChartWidgets';
import AddComponentForm from './dashboard/AddComponentForm';
import DeleteConfirmationModal from '../../components/modal/DeleteConfirmationModal';
import DashboardComponent from './dashboard/DashboardComponent';
import DashboardComponentLoader from './dashboard/DashboardComponentLoader';
import routes from '../../utils/routes.json';
import Skeleton from 'react-loading-skeleton';
import { useForm } from 'react-hook-form';
import InputValidation from '../../components/commons/InputValidation';
import { useProfileContext } from '../../contexts/profileContext';
import TooltipComponent from '../../components/lesson/Tooltip';
import MoreActions from '../../components/MoreActions';
import { usePagesContext } from '../../contexts/pagesContext';
import { SidebarMenuConstants } from '../../components/sidebar/constants/Sidebar.constants';
import DashboardGrid from './dashboard/DashboardGrid';

const SelectDashboards = ({
  loading,
  dashboardList,
  permissions,
  selectedDashboard,
  handleSelectedDashboard,
  handleAddDashboard,
  toggleDashboardNameEdit,
}) => {
  return (
    <div className="d-flex hover-actions align-items-center">
      {loading ? (
        <Skeleton height="15" width={150} />
      ) : (
        <>
          <ButtonFilterDropdown
            buttonText="Dashboards"
            options={dashboardList}
            filterOptionSelected={selectedDashboard}
            handleFilterSelect={handleSelectedDashboard}
            menuClass="drop-menu-card"
            btnAddConfig={
              isPermissionAllowed(permissions.collection, permissions.action)
                ? {
                    text: 'New Dashboard',
                    icon: 'add',
                    onClick: handleAddDashboard,
                  }
                : ''
            }
          />
          {dashboardList?.length > 0 && (
            <>
              {isPermissionAllowed(
                permissions.collection,
                permissions.action
              ) ? (
                <a
                  onClick={toggleDashboardNameEdit}
                  className="btn action-items btn-link"
                >
                  Edit
                </a>
              ) : (
                ''
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

const DashboardNameEdit = ({
  selectedDashboard,
  toggleFormEdit,
  refreshDashboardList,
}) => {
  const { profileInfo } = useProfileContext();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '' },
  });
  const [loaded, setLoaded] = useState({ ...selectedDashboard });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoaded(selectedDashboard);
    setValue('name', selectedDashboard.name);
  }, [selectedDashboard]);

  const handleOnChangeName = (e) => {
    const { value } = e.target;
    setLoaded({ ...loaded, name: value });
    setValue('name', value);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    const updatedDashboard = { ...loaded };
    let newOrUpdated = { ...loaded };
    let mode = 'add';
    if (loaded?.id) {
      // update request
      await DashboardService.updateDashboard(loaded.id, {
        name: updatedDashboard.name,
      });
      mode = 'edit';
    } else {
      updatedDashboard.enabled = true;
      updatedDashboard.type = 'dashboard';
      updatedDashboard.organizationId = profileInfo?.organization?.id;
      newOrUpdated = await DashboardService.createDashboard(updatedDashboard);
    }
    setSubmitting(false);
    toggleFormEdit();
    reset({ name: '' });
    setValue('name', '');
    refreshDashboardList(newOrUpdated, mode);
  };

  const handleEnter = async (e) => {
    if (e.code === 'Enter') {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <div className="d-flex align-items-center w-100 justify-content-between">
        <div className="d-flex align-items-center w-30">
          <InputValidation
            name="name"
            type="input"
            autoFocus
            placeholder="Dashboard Name"
            value={loaded.name || ''}
            onKeyDown={(e) => handleEnter(e)}
            classNames="mr-2"
            errorDisplay="position-absolute error-show-right"
            validationConfig={{
              required: true,
              inline: true,
              onChange: handleOnChangeName,
            }}
            errors={errors}
            register={register}
          />
        </div>
        <div className="d-flex align-items-center">
          <ButtonIcon
            color="white"
            onclick={toggleFormEdit}
            label="Cancel"
            classnames="px-3 mx-2 btn-sm"
          />
          <ButtonIcon
            color="primary"
            label="Save"
            type="submit"
            classnames="px-3 btn-sm"
            loading={submitting}
          />
        </div>
      </div>
    </Form>
  );
};

const Overview = () => {
  const [dashboardList, setDashboardList] = useState([]);
  const [selectedDashboard, setSelectedDashboard] = useState({});
  const [currentDashboard, setCurrentDashboard] = useState({});
  const [dashboardComponents, setDashboardComponents] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toggleNameEdit, setToggleNameEdit] = useState(false);
  const { tenant } = useContext(TenantContext);
  const [showAddComponentModal, setShowAddComponentModal] = useState(false);
  const [showSelectComponentModal, setShowSelectComponentModal] =
    useState(false);
  const [addComponentOption, setAddComponentOption] = useState({});
  const [selectedComponent, setSelectedComponent] = useState({});
  const [showDeleteComponentModal, setShowDeleteComponentModal] =
    useState(false);
  const [showDeleteDashboardModal, setShowDeleteDashboardModal] =
    useState(false);
  const [componentsToDelete, setComponentsToDelete] = useState([]);
  const [componentData, setComponentData] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const history = useHistory();
  const { pageContext, setPageContext } = usePagesContext();

  const getDashboardComponents = async () => {
    if (selectedDashboard?.id) {
      const { data } = await DashboardService.getDashboardsComponents(
        selectedDashboard.id
      );

      // this each widget config w: width, h: height wise so that grid adjust them automatically
      const widthByType = {
        kpi_standard: { w: 1, h: 1 },
        kpi_scorecard: { w: 1, h: 2 },
        kpi_growth_index: { w: 1, h: 1 },
        kpi_rankings: { w: 1, h: 2 },
        kpi_basic: { w: 1, h: 1 },
        chart_column: { w: 2, h: 2 },
        chart_donut: { w: 1, h: 2 },
        chart_pie: { w: 1, h: 2 },
        chart_bar: { w: 2, h: 2 },
        chart_line: { w: 2, h: 2 },
        chart_table: { w: 1, h: 2 },
        chart_funnel: { w: 1, h: 2 },
        chart_area: { w: 2, h: 2 },
        chart_heat: { w: 2, h: 2 },
      };

      setDashboardComponents(
        [...data].map((comp) => {
          return {
            ...comp,
            width: widthByType[comp.component.analytic.displayType].w,
            height: widthByType[comp.component.analytic.displayType].h,
            dComponent: (
              <DashboardComponent
                key={comp.id}
                item={comp}
                onHandleRemove={onHandleRemoveComponent}
                onHandleEdit={onHandleEditComponent}
                onHandleView={onHandleViewComponent}
              />
            ),
          };
        })
      );
      setLoading(false);
    }
  };

  const getDashboards = async () => {
    setLoadingDashboard(true);
    const { data } = await DashboardService.getDashboards();
    let dashboards = data?.map((a) => ({
      ...a,
      key: a.id,
    }));

    if (dashboards.length <= 0) {
      const dashboardCreated = await DashboardService.createDefaultDashboards(
        tenant.id,
        {
          type: 'dashboard',
        }
      );
      if (dashboardCreated.length > 0) {
        dashboards = dashboardCreated?.map((a) => ({
          ...a,
          key: a.id,
        }));
      }
    }

    const dashboardsFiltered = dashboards.filter((dashboard) => {
      const settingsInput = 'Dashboard_' + dashboard?.name;
      return (
        tenant.modules === '*' ||
        isMatchInCommaSeperated(tenant.modules, settingsInput)
      );
    });

    setDashboardList(dashboardsFiltered);
    setLoadingDashboard(false);
    if (dashboardsFiltered.length > 0) {
      setSelectedDashboard(
        pageContext[SidebarMenuConstants.Dashboards]?.selectedDashboard ||
          dashboardsFiltered[0]
      );
    }
  };
  const permissions = {
    collection: 'dashboard',
    action: 'manage',
  };
  const refreshDashboardList = (updatedDashboard, mode) => {
    if (mode === 'edit') {
      setDashboardList([
        ...dashboardList.map((d) =>
          d.id === updatedDashboard.id ? { ...updatedDashboard } : d
        ),
      ]);
    } else {
      setDashboardList([...dashboardList, updatedDashboard]);
    }
    setSelectedDashboard(updatedDashboard);
  };

  useEffect(() => {
    if (tenant.modules) {
      getDashboards();
    }
  }, [tenant.modules]);

  useEffect(() => {
    if (selectedDashboard?.id) {
      setLoading(true);
      setDashboardComponents([]);
      getDashboardComponents();
    }
  }, [selectedDashboard, refresh]);

  const handleSelectedDashboard = (e, selected) => {
    setSelectedDashboard(selected);
    setPageContext({
      ...pageContext,
      [SidebarMenuConstants.Dashboards]: {
        selectedDashboard: selected,
      },
    });
  };

  const toggleDashboardNameEdit = (e, addOrUpdate) => {
    setCurrentDashboard(addOrUpdate);
    setToggleNameEdit(!toggleNameEdit);
  };

  const toggleDashboardFormEdit = () => {
    setToggleNameEdit(!toggleNameEdit);
  };

  const onHandleRemoveComponent = (component) => {
    setComponentsToDelete([{ ...component, title: component.component.name }]);
    setShowDeleteComponentModal(true);
  };

  const onHandleEditComponent = (component) => {
    const displayType = component.component.analytic.displayType;
    const optionIndex = displayType.toLowerCase().includes('kpi') ? 0 : 1;

    // right panel modal title icon
    setAddComponentOption(AddComponentOptions[optionIndex]);

    // that is left side static widget for display
    setSelectedComponent(getComponentByDisplayType(displayType));

    setComponentData({
      ...component.component,
      component: { name: component.component.analytic.name },
    });

    setShowSelectComponentModal(false);
    setShowAddComponentModal(true);
  };

  const onHandleViewComponent = (component) => {
    history.push(
      `${routes.insights}?dashboard=${selectedDashboard.id}&component=${component.componentId}`
    );
  };

  const handleOptionSelect = (option) => {
    setAddComponentOption(option);
    setComponentData(null);
    setShowSelectComponentModal(true);
  };

  const handleComponentSelect = (component) => {
    setSelectedComponent(component);
    setShowSelectComponentModal(false);
    setShowAddComponentModal(true);
  };

  const handleChangeStyle = () => {
    setShowSelectComponentModal(true);
    setShowAddComponentModal(false);
  };

  const handleDeleteComponent = async () => {
    await DashboardService.deleteDashboardComponent(
      selectedDashboard.id,
      componentsToDelete[0].component.id
    );
    setShowDeleteComponentModal(false);
    setRefresh((prevState) => prevState + 1);
  };

  const handleDeleteDashboard = async () => {
    await DashboardService.deleteDashboard(selectedDashboard.id);
    setShowDeleteDashboardModal(false);
    // if you are on current dashboard that has just deleted then remove it from the context
    setPageContext({
      ...pageContext,
      [SidebarMenuConstants.Dashboards]: {
        selectedDashboard: null,
      },
    });
    getDashboards();
    setRefresh((prevState) => prevState + 1);
  };

  const handleRefreshComponents = () => {
    setRefresh((prevState) => prevState + 1);
  };

  const AddYourFirstDashboard = () => {
    return (
      <>
        {permissions?.collection
          ? isPermissionAllowed(permissions.collection, permissions.action) && (
              <div className="text-center">
                <div>To get started, add your first dashboard.</div>
                <ButtonIcon
                  icon="add"
                  label="New Dashboard"
                  classnames="btn-sm my-2"
                  onclick={toggleDashboardFormEdit}
                />
              </div>
            )
          : ''}
      </>
    );
  };

  const onHandleRemoveDashboard = () => {
    setComponentsToDelete([
      { ...selectedDashboard, title: selectedDashboard.name },
    ]);
    setShowDeleteDashboardModal(true);
  };

  return (
    <>
      <Heading
        useBc={false}
        showGreeting={true}
        pageHeaderDivider="border-0 mb-2 pb-0"
      >
        {toggleNameEdit ? (
          <>
            {permissions?.collection ? (
              isPermissionAllowed(
                permissions.collection,
                permissions.action
              ) ? (
                <DashboardNameEdit
                  selectedDashboard={currentDashboard}
                  toggleFormEdit={toggleDashboardFormEdit}
                  refreshDashboardList={refreshDashboardList}
                />
              ) : (
                ''
              )
            ) : (
              ''
            )}
          </>
        ) : (
          <div className="d-flex justify-content-between">
            <SelectDashboards
              permissions={permissions}
              loading={loadingDashboard}
              dashboardList={dashboardList}
              handleSelectedDashboard={handleSelectedDashboard}
              selectedDashboard={selectedDashboard}
              handleAddDashboard={(e) => toggleDashboardNameEdit(e, {})}
              toggleDashboardNameEdit={(e) =>
                toggleDashboardNameEdit(e, selectedDashboard)
              }
            />
            {selectedDashboard?.id && (
              <div className="d-flex align-items-center">
                <TooltipComponent title="Refresh">
                  <a
                    onClick={handleRefreshComponents}
                    className="refresh-icon cursor-pointer icon-hover-bg mr-2"
                  >
                    <MaterialIcon
                      icon="refresh"
                      clazz="text-gray-700 avatar-icon-font-size-sm"
                    />{' '}
                  </a>
                </TooltipComponent>
                {permissions?.collection &&
                  isPermissionAllowed(
                    permissions.collection,
                    permissions.action
                  ) && (
                    <>
                      {' '}
                      <ButtonIconDropdownWrapper
                        options={AddComponentOptions}
                        handleOptionSelect={handleOptionSelect}
                      >
                        <ButtonIcon
                          icon="add"
                          color="primary"
                          classnames="btn-sm"
                          label="Add Component"
                        />
                      </ButtonIconDropdownWrapper>
                      <MoreActions
                        icon="more_horiz"
                        items={[
                          {
                            id: 'remove',
                            icon: 'delete',
                            name: 'Delete',
                          },
                        ]}
                        onHandleRemove={() =>
                          onHandleRemoveDashboard(selectedDashboard)
                        }
                        toggleClassName="w-auto ml-2 p-0 h-auto icon-hover-bg"
                        iconStyle="avatar-icon-font-size-sm"
                      />
                    </>
                  )}
              </div>
            )}
          </div>
        )}
      </Heading>
      {showDeleteComponentModal && (
        <DeleteConfirmationModal
          showModal={showDeleteComponentModal}
          setShowModal={setShowDeleteComponentModal}
          setSelectedCategories={setComponentsToDelete}
          event={handleDeleteComponent}
          itemsConfirmation={componentsToDelete}
          itemsReport={[]}
        />
      )}

      {showDeleteDashboardModal && (
        <DeleteConfirmationModal
          showModal={showDeleteDashboardModal}
          setShowModal={setShowDeleteDashboardModal}
          setSelectedCategories={setComponentsToDelete}
          event={handleDeleteDashboard}
          itemsConfirmation={componentsToDelete}
          itemsReport={[]}
        />
      )}

      {showSelectComponentModal && (
        <RightPanelModal
          showModal={showSelectComponentModal}
          setShowModal={setShowSelectComponentModal}
          containerWidth={1150}
          showOverlay={true}
          containerBgColor={'bg-gray-200 pb-0'}
          containerPosition={'position-fixed'}
          Title={
            <div className="d-flex py-2 align-items-center">
              <MaterialIcon
                icon={addComponentOption?.icon}
                clazz="font-size-2xl text-white bg-primary icon-circle p-1 mr-2"
              />
              <h3 className="mb-0">Choose {addComponentOption?.name} Style</h3>
            </div>
          }
        >
          {addComponentOption?.key === 'KPI' ? (
            <KpiWidgets onComponentSelect={handleComponentSelect} />
          ) : (
            <ChartWidgets onComponentSelect={handleComponentSelect} />
          )}
        </RightPanelModal>
      )}

      {showAddComponentModal && (
        <RightPanelModal
          showModal={showAddComponentModal}
          setShowModal={setShowAddComponentModal}
          containerWidth={1150}
          containerBgColor={'bg-gray-200'}
          containerPosition={'position-fixed'}
          showOverlay={true}
          Title={
            <div className="d-flex py-2 align-items-center">
              <MaterialIcon
                icon={addComponentOption?.icon}
                clazz="font-size-2xl text-white bg-primary icon-circle p-1 mr-2"
              />
              <h3 className="mb-0">
                Add{' '}
                {showAddComponentModal &&
                  getDisplayTypePretty(
                    selectedComponent?.displayType,
                    selectedComponent?.displayType.includes('chart')
                      ? ' Chart'
                      : ' KPI'
                  )}
              </h3>
            </div>
          }
        >
          {showAddComponentModal && (
            <AddComponentForm
              componentData={componentData}
              componentStyle={selectedComponent}
              selectedDashboard={selectedDashboard}
              handleChangeStyle={handleChangeStyle}
              hideAddComponentModal={() => {
                setShowAddComponentModal(false);
                setRefresh((prevState) => prevState + 1);
                overflowing();
              }}
              hideBothModals={() => {
                setShowSelectComponentModal(false);
                setShowAddComponentModal(false);
                overflowing();
              }}
            />
          )}
        </RightPanelModal>
      )}

      {(loading || loadingDashboard) && <DashboardComponentLoader />}

      {!loading && dashboardComponents?.length ? (
        <>
          {dashboardComponents.length > 0 && (
            <DashboardGrid items={dashboardComponents} cols={3} />
          )}
        </>
      ) : (
        <>
          {!loading && !loadingDashboard && (
            <>
              {dashboardList?.length > 0 ? (
                <>
                  <NoDataFound
                    title="No components available."
                    description="To get started, add component from top right."
                    icon="dashboard"
                    containerStyle="text-gray-900 my-6 py-6"
                  />
                </>
              ) : (
                <>
                  {permissions?.collection ? (
                    isPermissionAllowed(
                      permissions.collection,
                      permissions.action
                    ) ? (
                      <NoDataFound
                        title="No dashboard and components available."
                        description={<AddYourFirstDashboard />}
                        icon="dashboard"
                        containerStyle="text-gray-900 my-6 py-6"
                      />
                    ) : (
                      ''
                    )
                  ) : (
                    ''
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default Overview;
