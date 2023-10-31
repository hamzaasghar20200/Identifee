import React, { useContext, useEffect, useState } from 'react';
import { TabContent, TabPane } from 'reactstrap';
import { useHistory } from 'react-router';
import stringConstants from '../../utils/stringConstants.json';
import Heading from '../../components/heading';
import { TabsContext } from '../../contexts/tabsContext';
import TaskTable from '../../components/ActivitiesTable/TaskTable';
import CallTable from '../../components/ActivitiesTable/CallTable';
import EventTable from '../../components/ActivitiesTable/EventTable';
import RightPanelModal from '../../components/modal/RightPanelModal';
import fieldService from '../../services/field.service';
import {
  RIGHT_PANEL_WIDTH,
  TAB_KEYS,
  isPermissionAllowed,
  overflowing,
} from '../../utils/Utils';
import Loading from '../../components/Loading';
import AddActivity from '../../components/peopleProfile/contentFeed/AddActivity';
import { groupBy } from 'lodash';
import {
  ActivitiesFiltersList,
  paginationDefault,
} from '../../utils/constants';
import LayoutHead from '../../components/commons/LayoutHead';
import ButtonFilterDropdown from '../../components/commons/ButtonFilterDropdown';
import ButtonIcon from '../../components/commons/ButtonIcon';
import activityService from '../../services/activity.service';
import AnimatedTabs from '../../components/commons/AnimatedTabs';
import { useProfileContext } from '../../contexts/profileContext';
import AlertWrapper from '../../components/Alert/AlertWrapper';
import Alert from '../../components/Alert/Alert';
import AllActivitiesTable from '../../components/ActivitiesTable/AllActivitiesTable';
import ActivityStats from '../../components/ActivitiesTable/ActivityStats';
import ActivitiesChecklist from '../../components/checklist/ActivitiesChecklist';
import useIsTenant from '../../hooks/useIsTenant';

const AllActivities = (data) => {
  const { profileInfo } = useProfileContext();
  const [isShow, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isFieldsData, setIsFieldsData] = useState([]);
  const [btnType, setIsBtnType] = useState();
  const [tabType, setIsTabType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const history = useHistory();
  const [order, setOrder] = useState([]);
  const [filterSelected, setFilterSelected] = useState({});
  const [contacts, setContacts] = useState();
  const [deals, setDeals] = useState();
  const [allData, setAllData] = useState([]);
  const [organizations, setOrganizations] = useState();
  const { activatedTab, setActivatedTab } = useContext(TabsContext);
  const [showLoading, setShowLoading] = useState(false);
  const [pagination, setPagination] = useState(paginationDefault);
  const [dataInDB, setDataInDB] = useState(false);
  const [selectedData, setSelectedData] = useState([]);
  const [openFilter, setOpenFilter] = useState(false);
  const [filterTabs, setFilterTabs] = useState('filters');
  const [deleteResults, setDeleteResults] = useState();
  const [showDeleteOrgModal, setShowDeleteOrgModal] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [getActivityId, setGetActivityId] = useState();
  const [refreshRecentFiles, setRefreshRecentFiles] = useState(false);
  const { isExcelBank } = useIsTenant();
  const constants = stringConstants.tasks;
  const moduleMap = data.data;
  const TaskFiltersList = [
    {
      key: 'AllTasks',
      name: `All ${moduleMap.task && moduleMap.task.plural}`,
      filter: '',
    },
    {
      key: 'ClosedTasks',
      name: `Closed ${moduleMap.task && moduleMap.task.plural}`,
      filter: { done: true },
    },
    {
      key: 'MyOpenTasks',
      name: `My Open ${moduleMap.task && moduleMap.task.plural}`,
      filter: { self: true, done: false, startDate: new Date() },
    },
    {
      key: 'NextAndOverdueTasks',
      name: 'Next 7 Days + Overdue',
      filter: {
        done: false,
        endDate: new Date(
          new Date(new Date().setDate(new Date().getDate() + 7)).setHours(
            23,
            59,
            59,
            999
          )
        ),
      },
    },
    {
      key: 'OpenTasks',
      name: `Open ${moduleMap.task && moduleMap.task.plural}`,
      filter: { done: false, startDate: new Date() },
    },
    {
      key: 'OverdueTasks',
      name: `Overdue ${moduleMap.task && moduleMap.task.plural}`,
      filter: { done: false, endDate: new Date() },
    },
    {
      key: 'TodayOverdueTasks',
      name: `Today + Overdue ${moduleMap.task && moduleMap.task.plural}`,
      filter: {
        endDate: new Date(new Date().setHours(23, 59, 59, 999)),
        done: false,
      },
    },
    {
      key: 'TodayTasks',
      name: `Today's ${moduleMap.task && moduleMap.task.plural}`,
      filter: {
        startDate: new Date(new Date().setHours(0, 0, 0, 0)),
        endDate: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    },
    {
      key: 'TomorrowTasks',
      name: `Tomorrow's ${moduleMap.task && moduleMap.task.plural}`,
      filter: {
        startDate: new Date(
          new Date(new Date().setDate(new Date().getDate() + 1)).setHours(
            0,
            0,
            0,
            0
          )
        ),
        endDate: new Date(
          new Date(new Date().setDate(new Date().getDate() + 1)).setHours(
            23,
            59,
            59,
            999
          )
        ),
      },
    },
  ];

  const CallFiltersList = [
    {
      key: 'AllCalls',
      name: `All ${moduleMap.call && moduleMap.call.plural}`,
      filter: '',
    },

    {
      key: 'ClosedCalls',
      name: `Closed ${moduleMap.call && moduleMap.call.plural}`,
      filter: { done: true },
    },

    {
      key: 'MyOpenCalls',
      name: `My Open ${moduleMap.call && moduleMap.call.plural}`,
      filter: { self: true, done: false, startDate: new Date() },
    },
    {
      key: 'NextAndOverdueCalls',
      name: 'Next 7 Days + Overdue',
      filter: {
        done: false,
        endDate: new Date(
          new Date(new Date().setDate(new Date().getDate() + 7)).setHours(
            23,
            59,
            59,
            999
          )
        ),
      },
    },
    {
      key: 'OpenCalls',
      name: `Open ${moduleMap.call && moduleMap.call.plural}`,
      filter: { done: false, startDate: new Date() },
    },
    {
      key: 'OverdueCalls',
      name: `Overdue ${moduleMap.call && moduleMap.call.plural}`,
      filter: { done: false, endDate: new Date() },
    },
    {
      key: 'MyOverdueCalls',
      name: `My Overdue ${moduleMap.call && moduleMap.call.plural}`,
      filter: { self: true, endDate: new Date() },
    },
    {
      key: 'TodayOverdueCalls',
      name: `Today + Overdue ${moduleMap.call && moduleMap.call.plural}`,
      filter: {
        endDate: new Date(new Date().setHours(23, 59, 59, 999)),
        done: false,
      },
    },
    {
      key: 'TodayCalls',
      name: `Today's ${moduleMap.call && moduleMap.call.plural}`,
      filter: {
        startDate: new Date(new Date().setHours(0, 0, 0, 0)),
        endDate: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    },
    {
      key: 'TomorrowCalls',
      name: "Tomorrow's Calls",
      filter: {
        startDate: new Date(
          new Date(new Date().setDate(new Date().getDate() + 1)).setHours(
            0,
            0,
            0,
            0
          )
        ),
        endDate: new Date(
          new Date(new Date().setDate(new Date().getDate() + 1)).setHours(
            23,
            59,
            59,
            999
          )
        ),
      },
    },
  ];
  const EventFiltersList = [
    {
      key: 'AllEvents',
      name: `All ${moduleMap.event && moduleMap.event.plural}`,
      filter: '',
    },

    {
      key: 'ClosedEvent',
      name: `Closed ${moduleMap.event && moduleMap.event.plural}`,
      filter: { done: true },
    },

    {
      key: 'MyOpenEvent',
      name: `My Open ${moduleMap.event && moduleMap.event.plural}`,
      filter: { self: true, done: false, startDate: new Date() },
    },
    {
      key: 'NextAndOverdueEvent',
      name: 'Next 7 Days + Overdue',
      filter: {
        done: false,
        endDate: new Date(
          new Date(new Date().setDate(new Date().getDate() + 7)).setHours(
            23,
            59,
            59,
            999
          )
        ),
      },
    },
    {
      key: 'OpenEvent',
      name: `Open ${moduleMap.event && moduleMap.event.plural}`,
      filter: { done: false, startDate: new Date() },
    },
    {
      key: 'OverdueEvent',
      name: `Overdue ${moduleMap.event && moduleMap.event.plural}`,

      filter: { done: false, endDate: new Date() },
    },
    {
      key: 'MyOverdueEvent',
      name: `My Overdue ${moduleMap.event && moduleMap.event.plural}`,
      filter: { self: true, endDate: new Date() },
    },
    {
      key: 'TodayOverdueEvent',
      name: `Today + Overdue ${moduleMap.event && moduleMap.event.plural}`,
      filter: {
        endDate: new Date(new Date().setHours(23, 59, 59, 999)),
        done: false,
      },
    },
    {
      key: 'TodayEvent',
      name: `Today's ${moduleMap.event && moduleMap.event.plural}`,
      filter: {
        startDate: new Date(new Date().setHours(0, 0, 0, 0)),
        endDate: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    },
    {
      key: 'TomorrowEvent',
      name: `Tomorrow's ${moduleMap.event && moduleMap.event.plural}`,
      filter: {
        startDate: new Date(
          new Date(new Date().setDate(new Date().getDate() + 1)).setHours(
            0,
            0,
            0,
            0
          )
        ),
        endDate: new Date(
          new Date(new Date().setDate(new Date().getDate() + 1)).setHours(
            23,
            59,
            59,
            999
          )
        ),
      },
    },
  ];

  const defaultAllFilter = {
    key: 'AllActivities',
    name: `All Activities`,
    filter: '',
  };
  const defaultTaskFilter = {
    key: 'AllTasks',
    name: `All ${moduleMap.task.plural}`,
    filter: '',
  };
  const defaultCallFilter = {
    key: 'AllCall',
    name: `All ${moduleMap.call.plural}`,
    filter: '',
  };
  const defaultEventFilter = {
    key: 'AllEvents',
    name: `All ${moduleMap.event.plural}`,
    filter: '',
  };

  useEffect(() => {
    CallFiltersList.forEach((filterItem) => {
      filterItem.name = filterItem.name.replace(
        /Calls/g,
        moduleMap.call.plural
      );
    });
  }, [moduleMap.call.plural]);
  useEffect(() => {
    EventFiltersList.forEach((filterItem) => {
      filterItem.name = filterItem.name.replace(
        /Event/g,
        moduleMap.event.plural
      );
    });
  }, [moduleMap.event.plural]);
  const limit = 25;
  const [isFilterCheck, setIsFilterCheck] = useState(
    tabType === 'all'
      ? defaultAllFilter
      : tabType === 'task'
      ? TaskFiltersList[0]
      : tabType === 'call'
      ? CallFiltersList[0]
      : EventFiltersList[0]
  );
  const [activityData, setActivityData] = useState({});
  const [filterOptionSelected, setFilterOptionSelected] = useState(
    tabType === 'all'
      ? defaultAllFilter
      : tabType === 'task'
      ? defaultTaskFilter[0]
      : tabType === 'call'
      ? defaultCallFilter[0]
      : defaultEventFilter[0]
  );
  const [selectedCount, setSelectedCount] = useState('none');
  useEffect(() => {
    setActiveTab(1);
    if (activatedTab[location.pathname]) {
      setActiveTab(activatedTab[location.pathname]);
    }
    const tab = new URLSearchParams(history.location.search).get('tab');
    if (tab === 'task') {
      setActiveTab(2);
    } else if (tab === 'call') {
      setActiveTab(3);
    } else if (tab === 'event') {
      setActiveTab(4);
    }
  }, []);
  useEffect(() => {
    return () => {
      setActivatedTab({
        all: 1,
      });
    };
  }, []);
  const getData = async (dataType) => {
    setShowLoading(true);
    const params = {
      ...isFilterCheck?.filter,
      order,
    };
    try {
      const data = await activityService.getActivity(params, {
        type: dataType === 'all' ? '' : dataType || '',
        ...pagination,
        limit,
      });
      setIsTabType(dataType || '');
      setPagination(data?.pagination);
      setDataInDB(Boolean(data?.pagination?.totalPages));
      setAllData(data?.data);
      setShowLoading(false);
    } catch (err) {
      setErrorMessage(constants.create?.groupCreatedFailed);
    }
  };
  useEffect(() => {
    if (refreshRecentFiles) {
      getData(tabType);
      if (btnType === 'all') {
        setActiveTab(TAB_KEYS.all);
        setIsTabType('all');
      } else if (btnType === 'task') {
        setActiveTab(TAB_KEYS.task);
        setIsTabType('task');
      } else if (btnType === 'call') {
        setActiveTab(TAB_KEYS.call);
        setIsTabType('call');
      } else if (btnType === 'event') {
        setActiveTab(TAB_KEYS.event);
        setIsTabType('event');
      }
      setRefreshRecentFiles(false);
    }
  }, [refreshRecentFiles]);
  useEffect(() => {
    setIsFilterCheck(
      tabType === 'all'
        ? defaultAllFilter
        : tabType === 'task'
        ? defaultTaskFilter
        : tabType === 'call'
        ? defaultCallFilter
        : defaultEventFilter
    );
  }, [tabType, activeTab]);
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
  const handleClearSelection = () => {
    setSelectAll(false);
    setSelectedData([]);
  };
  const handleEditActivity = async (singleItem) => {
    try {
      const singleData = await activityService.getSingleActivity(
        singleItem?.id
      );
      setContacts(singleData?.data?.contact);
      setDeals(singleData?.data?.deal);
      setOrganizations(singleData?.data?.organization);
      setActivityData(singleData?.data);
      setIsBtnType(singleData?.data?.type);
      setShowModal(true);
      setGetActivityId(singleItem);
      const { data } = await fieldService.getFields(singleItem.type, {
        usedField: true,
      });
      const {
        data: { data: customFields },
      } = await activityService.getCustomField(singleItem?.id, {
        page: 1,
        limit: 50,
      });
      let customValues = {};
      data.forEach((field) => {
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
      customValues = { ...singleData?.data, ...customValues };
      setActivityData(customValues);
      groupBySection(data);
    } catch {
      setErrorMessage('Server Error');
    }
  };

  const capitalizeWithS = (string) => {
    if (string === 'task') {
      return (
        moduleMap.task.plural.charAt(0).toUpperCase() +
        moduleMap.task.plural.slice(1)
      );
    } else if (string === 'event') {
      return (
        moduleMap.event.plural.charAt(0).toUpperCase() +
        moduleMap.event.plural.slice(1)
      );
    } else {
      return (
        moduleMap.call.plural.charAt(0).toUpperCase() +
        moduleMap.call.plural.slice(1)
      );
    }
  };

  const updateFilter = (filterType, tabName) => {
    switch (filterType) {
      case 'all':
        if (selectedCount === 'all') {
          setSelectedCount('none');
        } else {
          setSelectedCount('all');
          handleFilterSelect({
            filter: {},
          });
        }
        break;
      case 'completed':
        if (selectedCount === 'completed') {
          setSelectedCount('none');
          handleFilterSelect({
            filter: {},
          });
        } else {
          setSelectedCount('completed');
          handleFilterSelect({
            filter: { done: true },
          });
        }
        break;
      case 'pending':
        if (selectedCount === 'pending') {
          setSelectedCount('none');
          handleFilterSelect({
            filter: {},
          });
        } else {
          setSelectedCount('pending');
          handleFilterSelect({
            filter: { done: false, startDate: new Date() },
          });
        }
        break;
      case 'overdue':
        if (selectedCount === 'overdue') {
          setSelectedCount('none');
          handleFilterSelect({
            filter: {},
          });
        } else {
          setSelectedCount('overdue');
          handleFilterSelect({
            filter: { done: false, endDate: new Date() },
          });
        }
        break;
      case 'changeTab':
        if (tabName === 'task') {
          toggle({ tabId: 2, key: 'task' });
        } else if (tabName === 'event') {
          toggle({ tabId: 4, key: 'event' });
        } else {
          toggle({ tabId: 3, key: 'call' });
        }
        break;
    }
  };

  const getStats = () => {
    return (
      <ActivityStats
        tab={tabType}
        task={moduleMap.task.plural}
        call={moduleMap.call.plural}
        event={moduleMap.event.plural}
        updateFilter={updateFilter}
        selectedCount={selectedCount}
      />
    );
  };

  const tabsData = [
    {
      title: 'All',
      key: 'all',
      component: (
        <AllActivitiesTable
          getData={getData}
          selectedData={selectedData}
          setSelectedData={setSelectedData}
          setShowLoading={setShowLoading}
          setDataInDB={setDataInDB}
          tabType={tabType}
          allData={allData}
          setActivatedTab={setActivatedTab}
          handleEditActivity={handleEditActivity}
          isFilterCheck={isFilterCheck}
          setErrorMessage={setErrorMessage}
          setSuccessMessage={setSuccessMessage}
          deleteResults={deleteResults}
          showDeleteOrgModal={showDeleteOrgModal}
          setDeleteResults={setDeleteResults}
          setShowDeleteOrgModal={setShowDeleteOrgModal}
          selectAll={selectAll}
          setSelectAll={setSelectAll}
          order={order}
          handleClearSelection={handleClearSelection}
          setOrder={setOrder}
          pagination={pagination}
          showLoading={showLoading}
          setRefreshRecentFiles={setRefreshRecentFiles}
          dataInDB={dataInDB}
          setPagination={setPagination}
          getStats={getStats}
        />
      ),
      tabId: 1,
    },
    {
      title: moduleMap.task.plural,
      key: 'task',
      component: (
        <TaskTable
          getData={getData}
          selectedData={selectedData}
          setSelectedData={setSelectedData}
          setShowLoading={setShowLoading}
          setDataInDB={setDataInDB}
          tabType={tabType}
          allData={allData}
          setActivatedTab={setActivatedTab}
          handleEditActivity={handleEditActivity}
          isFilterCheck={isFilterCheck}
          setErrorMessage={setErrorMessage}
          setSuccessMessage={setSuccessMessage}
          deleteResults={deleteResults}
          showDeleteOrgModal={showDeleteOrgModal}
          setDeleteResults={setDeleteResults}
          setShowDeleteOrgModal={setShowDeleteOrgModal}
          selectAll={selectAll}
          setSelectAll={setSelectAll}
          order={order}
          handleClearSelection={handleClearSelection}
          setOrder={setOrder}
          pagination={pagination}
          showLoading={showLoading}
          setRefreshRecentFiles={setRefreshRecentFiles}
          dataInDB={dataInDB}
          setPagination={setPagination}
          getStats={getStats}
        />
      ),
      tabId: 2,
    },
    {
      title: moduleMap.event.plural,
      key: 'event',
      component: (
        <EventTable
          getData={getData}
          selectedData={selectedData}
          allData={allData}
          setActivatedTab={setActivatedTab}
          setShowLoading={setShowLoading}
          setSelectedData={setSelectedData}
          openFilter={openFilter}
          setDataInDB={setDataInDB}
          setRefreshRecentFiles={setRefreshRecentFiles}
          tabType={tabType}
          isFilterCheck={isFilterCheck}
          setErrorMessage={setErrorMessage}
          setSuccessMessage={setSuccessMessage}
          setOpenFilter={setOpenFilter}
          handleEditActivity={handleEditActivity}
          deleteResults={deleteResults}
          showDeleteOrgModal={showDeleteOrgModal}
          filterTabs={filterTabs}
          setDeleteResults={setDeleteResults}
          setShowDeleteOrgModal={setShowDeleteOrgModal}
          selectAll={selectAll}
          setSelectAll={setSelectAll}
          setFilterTabs={setFilterTabs}
          filterOptionSelected={filterOptionSelected}
          setFilterOptionSelected={setFilterOptionSelected}
          order={order}
          handleClearSelection={handleClearSelection}
          setOrder={setOrder}
          filterSelected={filterSelected}
          setFilterSelected={setFilterSelected}
          pagination={pagination}
          showLoading={showLoading}
          dataInDB={dataInDB}
          setPagination={setPagination}
          getStats={getStats}
        />
      ),
      tabId: 4,
    },
    {
      title: moduleMap.call.plural,
      key: 'call',
      component: (
        <CallTable
          setDataInDB={setDataInDB}
          tabType={tabType}
          getData={getData}
          setActivatedTab={setActivatedTab}
          allData={allData}
          isFilterCheck={isFilterCheck}
          setOpenFilter={setOpenFilter}
          setShowLoading={setShowLoading}
          selectedData={selectedData}
          setSelectedData={setSelectedData}
          openFilter={openFilter}
          deleteResults={deleteResults}
          showDeleteOrgModal={showDeleteOrgModal}
          setErrorMessage={setErrorMessage}
          setSuccessMessage={setSuccessMessage}
          filterTabs={filterTabs}
          setDeleteResults={setDeleteResults}
          setShowDeleteOrgModal={setShowDeleteOrgModal}
          selectAll={selectAll}
          setSelectAll={setSelectAll}
          setFilterTabs={setFilterTabs}
          filterOptionSelected={filterOptionSelected}
          setFilterOptionSelected={setFilterOptionSelected}
          order={order}
          handleEditActivity={handleEditActivity}
          handleClearSelection={handleClearSelection}
          setOrder={setOrder}
          filterSelected={filterSelected}
          setFilterSelected={setFilterSelected}
          pagination={pagination}
          showLoading={showLoading}
          setRefreshRecentFiles={setRefreshRecentFiles}
          dataInDB={dataInDB}
          setPagination={setPagination}
          getStats={getStats}
        />
      ),
      tabId: 3,
    },
    {
      title: 'Checklists',
      key: 'checklist',
      component: <ActivitiesChecklist />,
      tabId: 5,
      clazz: isExcelBank ? '' : 'd-none',
    },
  ];
  const toggle = (tab) => {
    if (activeTab !== tab.tabId) {
      setActiveTab(tab.tabId);
      setIsTabType(tab.key);
      setActivatedTab({
        [location.pathname]: tab.tabId,
      });
      setSelectedCount('none');
      setIsFilterCheck(
        tabType === 'task'
          ? defaultTaskFilter
          : tabType === 'call'
          ? defaultCallFilter
          : defaultAllFilter
      );
    }
  };
  const closeModal = () => {
    setShowModal(false);
    setGetActivityId();
    setIsBtnType('');
    setActivityData({});
    setContacts();
    setDeals();
    setOrganizations();
  };
  const loader = () => {
    if (loading) return <Loading />;
  };
  const handleDelete = (data) => {
    setShowDeleteOrgModal(true);
    setDeleteResults(data);
  };
  const handleClick = (type) => {
    getFields(type);
    setShowModal(true);
    setIsBtnType(type);
  };
  const handleFilterSelect = (item) => {
    setIsFilterCheck(item);
    setPagination((prevState) => ({
      ...prevState,
      page: 1,
    }));
  };
  // console.log(activeTab, activatedTab);
  useEffect(() => {
    const path = location.pathname;
    let newUrl = path; // Initialize with the current path

    if (activeTab === 2) {
      newUrl += '#task';
    } else if (activeTab === 3) {
      newUrl += '#call';
    } else if (activeTab === 4) {
      newUrl += '#event';
    }

    history.push(newUrl);
  }, [activeTab]);
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
      <div className="justify-content-between d-flex w-100 mt-3 mx-3 align-items-center">
        <Heading pageHeaderDivider="mb-0 w-50" useBc={true} showGreeting>
          <AnimatedTabs
            tabsData={tabsData}
            activeTab={activeTab}
            toggle={toggle}
          />
        </Heading>
        <div className="d-flex align-items-center">
          <LayoutHead
            selectedData={selectedData}
            onDelete={handleDelete}
            allRegister={`${pagination?.count || 0} ${
              tabType === 'all' ? 'Activities' : capitalizeWithS(tabType)
            }`}
            permission={{
              collection: 'activities',
              action: 'delete',
            }}
            onClear={handleClearSelection}
          >
            <ButtonFilterDropdown
              options={
                tabType === 'all'
                  ? ActivitiesFiltersList
                  : tabType === 'task'
                  ? TaskFiltersList
                  : tabType === 'call'
                  ? CallFiltersList
                  : EventFiltersList
              }
              openFilter={openFilter}
              btnToggleStyle="py-2 btn-sm"
              setOpenFilter={setOpenFilter}
              filterOptionSelected={isFilterCheck}
              filterSelected={filterSelected}
              filterTabs={filterTabs}
              handleFilterSelect={(e, item) => handleFilterSelect(item)}
              setFilterOptionSelected={setFilterOptionSelected}
              setFilterSelected={setIsFilterCheck}
              setFilterTabs={setFilterTabs}
              defaultSelection={
                tabType === 'all'
                  ? defaultAllFilter
                  : tabType === 'task'
                  ? defaultTaskFilter
                  : tabType === 'call'
                  ? defaultCallFilter
                  : defaultEventFilter
              }
            />

            {isPermissionAllowed('activities', 'create') && (
              <div className="d-flex gap-1 align-items-center">
                <ButtonIcon
                  label={moduleMap.task.singular}
                  icon="add"
                  onClick={() => handleClick('task')}
                  color="primary"
                  classnames="btn-sm px-3"
                />
                <ButtonIcon
                  label={moduleMap.event.singular}
                  icon="add"
                  onClick={() => handleClick('event')}
                  color="primary"
                  classnames="btn-sm px-3"
                />
                <ButtonIcon
                  label={moduleMap.call.singular}
                  icon="add"
                  onClick={() => handleClick('call')}
                  classnames="btn-sm px-3"
                  color="primary"
                />
              </div>
            )}
          </LayoutHead>
        </div>
      </div>
      <TabContent className="w-100 px-3">
        <TabPane className="position-relative p-0">
          {tabsData.find((item) => item.tabId === activeTab)?.component}
        </TabPane>
      </TabContent>
      {isShow && (
        <RightPanelModal
          showModal={isShow}
          setShowModal={() => closeModal()}
          showOverlay={true}
          containerBgColor={'pb-0'}
          containerWidth={RIGHT_PANEL_WIDTH}
          containerPosition={'position-fixed'}
          headerBgColor="bg-gray-5"
          Title={
            <div className="d-flex py-2 align-items-center text-capitalize">
              {Object.keys(activityData).length === 0 ? (
                <h3 className="mb-0">
                  Add{' '}
                  {btnType === 'task'
                    ? moduleMap.task.singular
                    : btnType === 'call'
                    ? moduleMap.call.singular
                    : moduleMap.event.singular}
                </h3>
              ) : (
                <h3 className="mb-0">
                  Edit{' '}
                  {btnType === 'task'
                    ? moduleMap.task.singular
                    : btnType === 'call'
                    ? moduleMap.call.singular
                    : moduleMap.event.singular}
                </h3>
              )}
            </div>
          }
        >
          {loading ? (
            loader()
          ) : (
            <AddActivity
              call={moduleMap.call.singular}
              event={moduleMap.event.singular}
              task={moduleMap.task.singular}
              btnType={btnType}
              activityData={activityData}
              feedInfo={activityData}
              getProfileInfo={profileInfo}
              setActiveTab={setActiveTab}
              activeTab={activeTab}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
              successMessage={successMessage}
              setSuccessMessage={setSuccessMessage}
              getActivityId={getActivityId}
              setIsTabType={setIsTabType}
              isModal={isShow}
              setActivatedTab={setActivatedTab}
              getData={getData}
              setGetActivityId={setGetActivityId}
              feedId={getActivityId?.feed_id}
              dataType={
                deals
                  ? 'deal'
                  : contacts
                  ? 'contact'
                  : organizations
                  ? 'organization'
                  : ''
              }
              deal={deals}
              contactInfo={contacts}
              organization={organizations}
              organizationId={organizations?.id}
              allFields={isFieldsData}
              closeModal={() => {
                setShowModal(false);
                overflowing();
                closeModal();
              }}
            />
          )}
        </RightPanelModal>
      )}
    </>
  );
};

export default AllActivities;
