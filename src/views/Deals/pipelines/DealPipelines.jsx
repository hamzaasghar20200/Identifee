import React, { useEffect, useState, useRef } from 'react';

import ButtonIcon from '../../../components/commons/ButtonIcon';
import Board from '../../../components/deals/Board';
import {
  DEALS_LABEL_BUTTON,
  OWNER,
  SEARCH,
  paginationDefault,
  NEW_STAGE_ID,
} from '../../../utils/constants';
import dealService from '../../../services/deal.service';
import pipelineService from '../../../services/pipeline.services';
import AlertWrapper from '../../../components/Alert/AlertWrapper';
import Alert from '../../../components/Alert/Alert';
import DealList from './DealList';
import userService from '../../../services/user.service';
import { DataFilters } from '../../../components/DataFilters';
import AddDeal from '../../../components/peopleProfile/deals/AddDeal';
import { sortingTable } from '../../../utils/sortingTable';
import stageService from '../../../services/stage.service';
import Skeleton from 'react-loading-skeleton';
import { usePipelineBoardContext } from '../../../contexts/PipelineBoardContext';
import moment from 'moment';
import TooltipComponent from '../../../components/lesson/Tooltip';
import { isPermissionAllowed } from '../../../utils/Utils';
import ButtonFilterDropdown from '../../../components/commons/ButtonFilterDropdown';
import FilterTabsButtonDropdown from '../../../components/commons/FilterTabsButtonDropdown';
import { usePagesContext } from '../../../contexts/pagesContext';
import { useModuleContext } from '../../../contexts/moduleContext';

const initialFiltersItems = [];

const DEALS_FILTER_OPTIONS_LIST = [
  { id: 2, key: 'MyDeals', name: 'My Deals' },
  { id: 3, key: 'AllDeals', name: 'All Deals' },
  { id: 4, key: 'opened', name: 'Open Deals' },
  { id: 5, key: 'closed', name: 'Closed Deals' },
  { id: 6, key: 'won', name: 'Won Deals' },
  { id: 7, key: 'lost', name: 'Lost Deals' },
  { id: 9, key: 'OneMonth', name: 'Deals created in this month' },
  { id: 10, key: 'ThreeMonths', name: 'More than 3 months old deals' },
];
const defaultFilter = {
  id: 4,
  key: 'opened',
  name: 'Open Deals',
};

const BoardLoader = ({ count }) => {
  const [loaderCount] = useState(Array(count).fill(0));
  const ColumnLoader = () => {
    return (
      <div className="px-1 text-center pipeline-board-edit">
        <Skeleton
          count={6}
          height={80}
          className="my-2 d-block w-100 deal-col"
        />
      </div>
    );
  };
  return (
    <div className="d-flex justify-content-between flex-row w-100 parent-column">
      {loaderCount.map((_, index) => (
        <ColumnLoader key={index} />
      ))}
    </div>
  );
};

const SaveCancelPipelineRow = ({
  togglePipelineEdit,
  onSavePipeline,
  loading,
  refreshBoard,
}) => {
  const handleCancel = () => {
    refreshBoard();
  };

  return (
    <div className="d-flex justify-content-end w-100 align-items-center">
      <button
        value="cancel"
        className="btn btn-sm btn-white mr-2"
        onClick={handleCancel}
      >
        Cancel
      </button>
      <ButtonIcon
        icon="save"
        classnames="btn-sm ml-1 border-0"
        loading={loading}
        label="Save Pipeline"
        onclick={onSavePipeline}
      />
    </div>
  );
};

const Nav = ({ active = false, onclick, togglePipelineEdit }) => {
  return (
    <div className="mx-3">
      <ul
        className="nav nav-segment border bg-white p-0"
        id="leadsTab"
        role="tablist"
      >
        <li className="nav-item">
          <TooltipComponent title="Column view">
            <a
              className={`btn-sm btn rounded-0 hover-icon bg-hover-gray ${
                active ? 'bg-gray-300 fw-bold text-primary' : ''
              }`}
              id="pipeline-tab"
              data-toggle="tab"
              role="tab"
              aria-controls="pipeline"
              aria-selected="true"
              onClick={onclick}
            >
              <i
                className="material-icons-outlined font-size-xxl"
                data-uw-styling-context="true"
              >
                view_week
              </i>
            </a>
          </TooltipComponent>
        </li>
        <li className="nav-item">
          <TooltipComponent title="List view">
            <a
              className={`btn-sm btn rounded-0 hover-icon bg-hover-gray ${
                !active ? 'bg-gray-300 fw-bold text-primary' : ''
              }`}
              id="list-tab"
              data-toggle="tab"
              role="tab"
              aria-controls="list"
              aria-selected="false"
              onClick={onclick}
            >
              <i className="material-icons-outlined font-size-xxl">menu</i>
            </a>
          </TooltipComponent>
        </li>
      </ul>
    </div>
  );
};

const Deals = () => {
  const { pageContext, setPageContext } = usePagesContext();
  const isMounted = useRef(false);
  const [active, setActive] = useState(
    pageContext?.PipelinePage?.selectedView ?? true
  );
  const [openDeal, setOpenDeal] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [allDeals, setAllDeals] = useState([]);
  const [filtersItems, setFiltersItems] = useState(initialFiltersItems);
  const [filterSelected, setFilterSelected] = useState({
    filter: { status: 'opened' },
  });
  const { moduleMap } = useModuleContext();
  const [searchTerm, setSearchTerm] = useState({});
  const [pagination, setPagination] = useState({
    page: paginationDefault.page,
  });
  const [paginationData, setPaginationData] = useState({
    page: paginationDefault.page,
  });
  const [addDealBtnLoading, setAddDealBtnLoading] = useState(false);
  const [infoDeals, setInfoDeals] = useState({});
  const [flagDeal, setFlagDeal] = useState([]);
  const [order, setOrder] = useState([]);
  const [initialDeals, setInitialDeals] = useState({});
  const [listDeals, setListDeals] = useState(initialDeals);
  const [pipelineEdit, setPipelineEdit] = useState(false);
  const [pipelineSaveLoader, setPipeLineSaveLoader] = useState(false);
  const { stages, setStages } = usePipelineBoardContext();
  const [refreshBoardHeader, setRefreshBoardHeader] = useState(1);
  const [selectedStage, setSelectedStage] = useState({});
  const [openFilter, setOpenFilter] = useState(false);
  const [dealFilterTab, setDealFilterTab] = useState('filters');
  const [dealFilterOptionSelected, setDealFilterOptionSelected] =
    useState(defaultFilter);
  const [me, setMe] = useState(null);
  const [title, setTitle] = useState({
    id: 4,
    key: 'opened',
    name: 'Open Deals',
  });

  const [pipelines, setPipelines] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState({});
  const [loadingPipelines, setLoadingPipelines] = useState(false);
  const getStageByName = (name) => {
    return stages.find((stage) => stage?.name === name);
  };

  useEffect(() => {
    (async () => {
      setListDeals({});
      const pipelineId = selectedPipeline?.id;
      if (pipelineId) {
        setShowLoading(true);
        const stages = await stageService.getStages(pipelineId);
        const getStages = {};
        stages.forEach((stage) => {
          getStages[stage?.name] = {
            loading: true,
            id: stage?.id,
            stagePosition: stage?.position,
            name: stage?.name,
            title: stage?.name,
          };
        });
        setStages(stages);
        setInitialDeals(getStages);
        setShowLoading(false);
      }
      onGetUsers();
    })();
  }, [refreshBoardHeader, selectedPipeline]);

  useEffect(() => {
    (async () => {
      setLoadingPipelines(true);
      const { data } = await pipelineService.getPipelines();
      const updatedPipelines = data?.map((p) => ({ ...p, key: p.id }));
      const defaultPipeline =
        updatedPipelines?.find((d) => d.isDefault) ||
        (updatedPipelines?.length && updatedPipelines[0]);
      setPipelines(updatedPipelines);
      const contextPipeline =
        pageContext?.PipelinePage?.selectedPipeline ?? defaultPipeline;
      setSelectedPipeline(contextPipeline || {});
      setLoadingPipelines(false);
    })();
  }, []);

  useEffect(() => {
    if (moduleMap.deal) {
      DEALS_FILTER_OPTIONS_LIST.forEach((option) => {
        if (option.key === 'AllDeals') {
          option.name = `All ${moduleMap.deal.plural}`;
        } else if (option.key === 'MyDeals')
          option.name = `My ${moduleMap.deal.plural}`;
        else if (option.key === 'opened')
          option.name = `Open ${moduleMap.deal.plural}`;
        else if (option.key === 'closed')
          option.name = `Closed ${moduleMap.deal.plural}`;
        else if (option.key === 'won')
          option.name = `Won ${moduleMap.deal.plural}`;
        else if (option.key === 'OneMonth')
          option.name = `${moduleMap.deal.plural} created in this month`;
        else if (option.key === 'ThreeMonths')
          option.name = `More than 3 months old ${moduleMap.deal.plural}`;

        defaultFilter.name = `All ${moduleMap.deal.plural}`;
      });
    }
  }, [moduleMap.deal]);

  useEffect(() => {
    (async () => {
      const me = await userService
        .getUserInfo()
        .catch((err) => console.log(err));
      setMe(me);
    })();
  }, []);

  useEffect(() => {
    if (active) {
      Object.values(initialDeals).forEach((item) => {
        getDeals(
          {
            name: item?.name,
            id: item?.id,
            stagePosition: item?.position || item?.stagePosition,
          },
          paginationDefault.page,
          order
        );
      });
    } else onGetDeals(true);
  }, [active, paginationData, flagDeal, order, initialDeals]);

  useEffect(() => {
    const summary = [];
    Object.keys(listDeals).forEach((key) => {
      if (listDeals[key]?.header?.total_amount) {
        summary.push(listDeals[key]?.header);
      }
      setInfoDeals({});
    });
  }, [listDeals]);

  async function onGetUsers() {
    const response = await userService
      .getUsers(
        {
          search: '',
          users: [],
          filters: '',
        },
        {}
      )
      .catch((err) => err);

    const { data } = response || {};

    const newFilterOptions = filtersItems.slice();

    newFilterOptions.push({
      id: 1,
      label: OWNER,
      name: 'assigned_user_id',
      options: data?.users,
      type: 'search',
    });

    setFiltersItems(newFilterOptions);
  }

  const filterID = (id, FList) => {
    return FList
      ? FList.includes(id)
        ? FList.filter((n) => n !== id)
        : [id, ...FList]
      : [id];
  };

  const onHandleFilterContact = (item, avatars = true) => {
    const prevFils = filterSelected.filter
      ? filterSelected.filter.assigned_user_id
      : null;
    setOpenFilter(false);

    if (item) setListDeals(initialDeals);
    setFilterSelected({
      ...filterSelected,
      filter: {
        assigned_user_id: avatars ? filterID(item.id, prevFils) : [item.id],
      },
    });

    setPaginationData({ page: paginationDefault.page });
  };

  const onHandleFilterDeal = (item) => {
    onHandleFilterContact(item, false);
  };

  useEffect(() => {
    if (!title.key) {
      // only update filter in FE in case if key:0 otherwise its breaking three months old and other deals filters
      setDealFilterOptionSelected(title);
    }
  }, [title]);

  useEffect(() => {
    (async () => {
      if (filterSelected.filter) {
        if (
          filterSelected.filter.assigned_user_id &&
          filterSelected.filter.assigned_user_id.length !== 0
        ) {
          const Len = filterSelected.filter.assigned_user_id.length;
          if (Len > 1) {
            setTitle({ key: 0, name: `${Len} Users` });
          }
        } else if (
          filterSelected.filter.status ||
          filterSelected.filter.recent_activity ||
          filterSelected.filter.start_date
        ) {
          // dont liking it :| not breaking faizan implementation
          const filterStatus = filterSelected.filter.recent_activity
            ? 'RecentlyViewed'
            : filterSelected.filter.discriminator
            ? filterSelected.filter.discriminator
            : filterSelected.filter.status;

          const Title = DEALS_FILTER_OPTIONS_LIST.filter(
            (status) => status.key === filterStatus
          )[0];
          setTitle(Title);
        } else {
          setTitle({ id: 4, key: 'opened', name: 'Open Deals' });
        }
      }
    })();
  }, [filterSelected]);

  const cleanFilter = () => {
    // this is trash
    const { filter } = filterSelected || { filter: {} };
    const { discriminator, ...rest } = filter || {};
    return rest;
  };

  const onGetDeals = async () => {
    setShowLoading(true);
    try {
      const { data, pagination } = await pipelineService.getPipelineDeals(
        selectedPipeline.id,
        paginationData.page,
        paginationData.limit,
        cleanFilter()
      );
      if (pagination) setPagination(pagination);
      setAllDeals(data);
      setInfoDeals({});
    } catch (e) {
      console.log(e);
    } finally {
      setShowLoading(false);
    }
  };

  const setNotification = async (notificationCode, description) => {
    const notificationsStatus = {
      success: setSuccessMessage,
      error: setErrorMessage,
    };

    notificationsStatus[notificationCode](description);
  };

  const getDeals = async (status, page) => {
    const foundStage = getStageByName(status?.name);

    try {
      const { data, pagination } = await pipelineService.getPipelineDeals(
        selectedPipeline?.id,
        page,
        10,
        { ...cleanFilter(), tenant_deal_stage_id: status.id }
      );

      // Concatenate the new data with the existing data
      setListDeals((prev) => {
        const items = prev[status.name]?.items || [];
        return {
          ...prev,
          [status.name]: {
            stageId: status.id,
            loading: false,
            stagePosition: foundStage?.position || status.stagePosition,
            items: [...items, ...data], // Concatenate new data with existing data
            pagination,
            header: {
              ...status,
              tenant_deal_stage_id: status.id,
              total_amount: calculateTotalAmount([...items, ...data]), // Recalculate total amount
            },
          },
        };
      });

      setInfoDeals({});
    } catch (e) {
      console.log(e);
    } finally {
      setShowLoading(false);
    }
  };

  // Function to calculate the total amount
  const calculateTotalAmount = (deals) => {
    return deals.reduce((acc, dt) => {
      return {
        amount: (acc?.amount || 0) + dt.amount,
      };
    }, 0).amount;
  };

  const dataFilter = (search) => {
    setListDeals(initialDeals);
    setFilterSelected(search);
    setPaginationData({ page: paginationDefault.page });
  };

  useEffect(() => {
    if (isMounted.current) {
      const delayTime = setTimeout(() => {
        dataFilter(searchTerm);
      }, [1000]);
      return () => clearTimeout(delayTime);
    } else isMounted.current = true;
  }, [searchTerm]);

  const editPipeline = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setPipelineEdit(!pipelineEdit);
  };

  const changeView = () => {
    setPaginationData({ page: paginationDefault.page });
    setListDeals(initialDeals);
    setActive(!active);
    setShowLoading(false);
    setPageContext({
      ...pageContext,
      PipelinePage: {
        ...pageContext.PipelinePage,
        selectedView: !active, // true means column, false means table
      },
    });
  };

  const refreshDeals = (type, page, load = false) => {
    if (load) getDeals(type, page);
    else {
      type.forEach((status) => {
        setListDeals((prev) => ({
          ...prev,
          [status.name]: {
            stageId: status.id,
            stagePosition: status.stagePosition,
            loading: true,
            items: [],
            pagination: page,
            header: [],
          },
        }));
        getDeals(status, paginationDefault.page);
      });
    }
  };

  const onAddDeal = async (stage) => {
    setAddDealBtnLoading(true);
    setOpenDeal(true);
    setAddDealBtnLoading(false);
  };

  const sortTable = ({ name }) => sortingTable({ name, order, setOrder });

  const handleRefreshBoardHeader = () => {
    setShowLoading(true);
    setRefreshBoardHeader((prevState) => prevState + 1);
    setPipelineEdit(!pipelineEdit);
    setListDeals({});
  };

  const handleSavePipeline = async () => {
    const dealStages = stages.map((stage) => ({
      id: stage.id.includes(NEW_STAGE_ID) ? undefined : stage.id,
      name: stage.name || stage?.name,
      position: stage.position || stage.stagePosition,
      probability: stage.probability || 0,
    }));
    setPipeLineSaveLoader(true);
    await stageService.updateStages({ deal_stages: dealStages });
    setPipeLineSaveLoader(false);
    handleRefreshBoardHeader();
  };

  const refreshBoard = () => {
    setFlagDeal(!flagDeal);
    setListDeals(initialDeals);
  };

  const handleAddDeal = async (stage) => {
    setSelectedStage(stage);
    setAddDealBtnLoading(true);
    setOpenDeal((prev) => !prev);
    setAddDealBtnLoading(false);
  };

  const handleFilterSelect = (e, status) => {
    e.preventDefault();
    setOpenFilter(!openFilter);
    setListDeals(initialDeals);
    setDealFilterOptionSelected(status);
    const { key } = status;
    if (key === 'MyDeals') {
      setFilterSelected({
        ...filterSelected,
        filter: { assigned_user_id: [me.id] },
      });
    } else if (key === 'OneMonth') {
      const now = moment().toISOString();
      const startOfMonth = moment().startOf('month').toISOString();
      setFilterSelected({
        ...filterSelected,
        filter: {
          start_date: startOfMonth,
          end_date: now,
          discriminator: 'OneMonth',
        },
      });
    } else if (key === 'ThreeMonths') {
      const startOfTime = moment(new Date(1970, 0, 1)).toISOString();
      const threeMonthsOld = moment().subtract(3, 'months').toISOString();
      setFilterSelected({
        ...filterSelected,
        filter: {
          start_date: startOfTime,
          end_date: threeMonthsOld,

          // this is soooooooo waccckkkkkkk.....
          // invalid `status` was being sent to api and is being used as a selector...
          discriminator: 'ThreeMonths',
        },
      });
    } else if (key === 'RecentlyViewed') {
      const oneHourBefore = moment().utc().subtract(1, 'hours').toISOString();
      const now = moment().utc().toISOString();
      setFilterSelected({
        ...filterSelected,
        filter: {
          recent_activity: true,
          start_date: oneHourBefore,
          end_date: now,
        },
      });
    } else if (key === 'AllDeals') {
      setFilterSelected({
        ...filterSelected,
        filter: {},
      });
    } else {
      setFilterSelected({
        ...filterSelected,
        filter: { status: status.key },
      });
    }
    setPaginationData({ page: paginationDefault.page });
  };

  const handleSelectedPipeline = (e, pipe) => {
    setSelectedPipeline(pipe);
    setPageContext({
      ...pageContext,
      PipelinePage: {
        selectedPipeline: pipe || {},
        selectedView: active, // true means column, false means table
      },
    });
  };
  const SelectPipelines = ({ loading, list, selected, handleSelected }) => {
    return (
      <div className="d-flex hover-actions align-items-center">
        {loading ? (
          <Skeleton height="10" width={150} />
        ) : (
          <>
            <ButtonFilterDropdown
              buttonText="Pipelines"
              options={list}
              filterOptionSelected={selected}
              handleFilterSelect={handleSelected}
              menuClass="drop-menu-card"
            />
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <div className={'pipeline-header'}>
        <div className="w-100 d-flex mb-2">
          {pipelineEdit ? (
            <SaveCancelPipelineRow
              togglePipelineEdit={editPipeline}
              onSavePipeline={handleSavePipeline}
              loading={pipelineSaveLoader}
              refreshBoard={handleRefreshBoardHeader}
            />
          ) : (
            <>
              <SelectPipelines
                loading={loadingPipelines}
                selected={selectedPipeline}
                list={pipelines}
                handleSelected={handleSelectedPipeline}
              />
              <div className="ml-auto mr-3">
                <DataFilters
                  filterSelected={filterSelected}
                  setFilterSelected={setSearchTerm}
                  searchPlaceholder={SEARCH}
                  infoDeals={infoDeals}
                  paginationPage={paginationData}
                  setPaginationPage={setPaginationData}
                  showSearch={false}
                  variant
                >
                  <FilterTabsButtonDropdown
                    options={DEALS_FILTER_OPTIONS_LIST}
                    openFilter={openFilter}
                    setOpenFilter={setOpenFilter}
                    filterOptionSelected={dealFilterOptionSelected}
                    filterSelected={filterSelected}
                    filterTabs={dealFilterTab}
                    handleFilterSelect={handleFilterSelect}
                    onHandleFilterOrg={onHandleFilterDeal}
                    setFilterOptionSelected={setDealFilterOptionSelected}
                    setFilterSelected={setFilterSelected}
                    setFilterTabs={setDealFilterTab}
                    defaultSelection={defaultFilter}
                  />
                  <Nav
                    active={active}
                    onclick={() => changeView()}
                    togglePipelineEdit={editPipeline}
                  />
                </DataFilters>
              </div>
              <AddDeal
                className="btn-transparent border-0"
                setOpenDeal={setOpenDeal}
                openDeal={openDeal}
                initialDeals={initialDeals}
                pipeline={selectedPipeline}
                onGetDeals={refreshBoard}
                setErrorMessage={setErrorMessage}
                setSuccessMessage={setSuccessMessage}
                selectedStage={selectedStage}
              >
                {isPermissionAllowed('deals', 'create') && (
                  <>
                    {moduleMap.deal && (
                      <ButtonIcon
                        icon="add"
                        classnames="btn-sm border-0"
                        loading={addDealBtnLoading}
                        label={DEALS_LABEL_BUTTON.replace(
                          /Pipeline/g,
                          moduleMap.deal.singular
                        )}
                        onClick={() => handleAddDeal(undefined)}
                      />
                    )}
                  </>
                )}
              </AddDeal>
            </>
          )}
        </div>

        <div className="tab-content">
          <div
            className={`tab-pane fade col-12 p-0 ${active && 'active show'}`}
          >
            {showLoading ? (
              <BoardLoader count={5} />
            ) : (
              <Board
                onGetDeals={(type, id, stagePosition, page) => {
                  setListDeals((prev) => ({
                    ...prev,
                    [type]: {
                      stageId: id,
                      stagePosition,
                      loading: true,
                      items: [],
                      pagination: page,
                      header: [],
                    },
                  }));
                  getDeals({ name: type, id, stagePosition }, page);
                }}
                setNotification={setNotification}
                listDeals={listDeals}
                onClick={refreshDeals}
                editPipeline={pipelineEdit}
                refreshBoard={refreshBoard}
                refreshBoardHeader={handleRefreshBoardHeader}
                onAddDeal={handleAddDeal}
                viewType={active ? 'column' : 'list'}
              />
            )}
          </div>
          <div
            className={`tab-pane fade col-12 p-0 ${!active && 'active show'}`}
          >
            <DealList
              allDeals={allDeals}
              pagination={pagination}
              service={dealService}
              showLoading={showLoading}
              onPaginationChange={(page) =>
                setPaginationData({ ...paginationData, page })
              }
              onAddDeal={onAddDeal}
              sortingTable={sortTable}
              sortingOrder={order}
            />
          </div>
        </div>
      </div>

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

export default Deals;
