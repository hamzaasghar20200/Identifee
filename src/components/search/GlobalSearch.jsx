import { useEffect, useState, useContext } from 'react';

import './GlobalSearch.css';
import searchService from '../../services/search.service';
import { GlobalSearchMain } from './GlobalSearchMain';
import { GlobalSearchInput } from './GlobalSearchInput';
import { GlobalSearchResults } from './GlobalSearchResults';
import Alert from '../Alert/Alert';
import AlertWrapper from '../Alert/AlertWrapper';
import {
  isMatchInCommaSeperated,
  overflowing,
  removeBodyScroll,
} from '../../utils/Utils';
import ButtonFilterDropdown from '../commons/ButtonFilterDropdown';
import constants from './GlobalSearch.constants.json';
import { TenantContext } from '../../contexts/TenantContext';
import { groupBy } from 'lodash';
import { useLocation } from 'react-router-dom';
import useIsTenant from '../../hooks/useIsTenant';
import { ActivityDetail } from '../ActivitiesTable/activityDetail';
import activityService from '../../services/activity.service';
import fieldService from '../../services/field.service';
import { useModuleContext } from '../../contexts/moduleContext';

const defaultSelectOption = {
  name: 'all',
  label: 'All',
  key: 'all',
  route: 'dashboard',
  icon: 'dashboard',
  typeKey: 'all',
  permission: {
    collection: 'dashboard',
    action: 'view',
  },
  module: 'dashboards',
};
export const GlobalSearch = (newOptionsList) => {
  const { moduleMap } = useModuleContext();

  const location = useLocation();
  const [searchValue, setSearchValue] = useState('');
  const [research, setResearch] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [show, setShow] = useState(false);
  const [toast, setToast] = useState({ message: '', color: '' });
  const [loading, setLoading] = useState(false);
  const [isShow, setIsShow] = useState(false);
  const [activityObj, setActivityObj] = useState();
  const [openFilter, setOpenFilter] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [filterTabs, setFilterTabs] = useState('filters');
  const [activityData, setActivityData] = useState({});
  const [btnType, setIsBtnType] = useState();
  const [getActivityId, setGetActivityId] = useState();
  const isSynovus = useIsTenant().isSynovusBank;
  const [isFieldsData, setIsFieldsData] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { tenant } = useContext(TenantContext);

  if (isSynovus) {
    newOptionsList = newOptionsList.data.map((m) => ({
      ...m,
      label: m.label === 'Companies' ? 'Insights' : m.label,
    }));
  }
  let optionsList;

  if (newOptionsList !== undefined) {
    optionsList = newOptionsList.data.filter((el) => {
      if (!tenant.modules || tenant.modules === '*') {
        return true;
      } else {
        return isMatchInCommaSeperated(tenant.modules, el.module);
      }
    });
  }

  useEffect(() => {
    optionsList.map((obj) => {
      if (obj.key === 'organizations' && moduleMap.organization)
        return (obj.name = moduleMap.organization.plural);
      return '';
    });
  }, [optionsList]);
  const [filterOptionSelected, setFilterOptionSelected] = useState('');
  const groupBySection = (List) => {
    const filteredList = List.filter((item) => {
      return optionsList.some((option) => {
        if (option.kind === 'training') {
          return item.kind === 'course' || item.kind === 'lesson';
        } else {
          return option.kind === item.kind;
        }
      });
    });
    if (filteredList.some((item) => item?.type === null)) {
      setSearchResults(groupBy(filteredList, 'kind'));
    } else {
      setSearchResults(groupBy(filteredList, 'type'));
    }
  };
  const groupBySections = (fieldsList) => {
    setIsFieldsData(groupBy(fieldsList, 'section'));
  };
  const getFields = async (item) => {
    setisLoading(true);
    const { data } = await fieldService.getFields(item, {
      usedField: true,
    });
    groupBySections(data);
  };
  const handleEditActivity = async () => {
    getFields(activityObj?.type);
    try {
      const singleData = await activityService.getSingleActivity(
        activityObj?.id
      );
      setActivityData(singleData?.data);
      setIsBtnType(singleData?.data?.type);
      setGetActivityId(activityObj);
      const { data } = await fieldService.getFields(activityObj.type, {
        usedField: true,
      });
      const {
        data: { data: customFields },
      } = await activityService.getCustomField(activityObj?.id, {
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
      setisLoading(false);
    } catch {
      setErrorMessage('Server Error');
    }
  };
  const tableActions = [
    {
      id: 1,
      title: 'Edit',
      icon: 'edit',
      permission: {
        collection: 'activities',
        action: 'edit',
      },
      onClick: (e) => {
        setShowActivity(true);
        handleEditActivity();
      },
    },
  ];

  const termFinder = (item) => {
    setLoading(true);
    const data = {
      s: searchValue,
      resource:
        item?.key === 'deals'
          ? item?.type
          : item?.kind === 'activity'
          ? item?.kind
          : item?.key || optionsList[0]?.key,
      type: item?.typeKey
        ? item?.typeKey || optionsList[0]?.typeKey
        : item?.type || optionsList[0]?.key,
    };
    if (data.resource && data.type) {
      searchService
        .getSearchResults(data)
        .then((response) => {
          setLoading(false);
          groupBySection(response?.data);
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
        });
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchValue && searchValue.length >= 3 && termFinder(filterOptionSelected);
  }, [searchValue, research]);

  useEffect(() => {
    if (show) {
      removeBodyScroll();
      // When search result popup opened remove scroll from bottom window to make popup scoll smooth
    } else {
      // removing style attribute because if we set is to unset, when any modal opens user was able to scroll page
      overflowing();
    }
  }, [show]);
  useEffect(() => {
    const path = location.pathname;
    const pathSegments = path.split('/');
    const segmentAfterBaseURL = pathSegments[1];
    let selectedOption = optionsList.find(
      (option) => segmentAfterBaseURL === option.route
    );
    const fragmentIdentifier = window.location.hash;
    const valueAfterHash = fragmentIdentifier.substring(1);
    if (valueAfterHash) {
      selectedOption = optionsList.find(
        (option) => valueAfterHash === option.route
      );
    }
    if (selectedOption) {
      setFilterOptionSelected(selectedOption);
    } else {
      setFilterOptionSelected(defaultSelectOption);
    }
  }, [location.pathname, window.location.hash]);
  const handleFilterSelect = (item) => {
    setFilterOptionSelected(item);
    if (searchValue) {
      termFinder(item);
    }
  };

  const activityDetail = async (activityId) => {
    const { data } = await activityService.getSingleActivity(activityId);
    setActivityObj(data);
    setIsShow(true);
    setShow(false);
  };
  const markAsDone = async (id) => {
    try {
      await activityService.markAsCompleted(id);
      setSuccessMessage(constants.completed);
    } catch (error) {
      setErrorMessage(constants.errorUpdatedActivity);
    }
  };
  return (
    <>
      <GlobalSearchMain
        autoClose={false}
        show={show}
        setSearchValue={setSearchValue}
        setSearchResults={setSearchResults}
      >
        <div className="d-flex align-items-center border rounded-pill bg-light">
          {
            <ButtonFilterDropdown
              options={optionsList}
              data={moduleMap}
              ignoreChildHover={'zIndex'}
              openFilter={openFilter}
              btnToggleStyle="py-2 border-left-0 border-top-0 border-bottom-0 border-right rounded-0 bg-transparent"
              setOpenFilter={setOpenFilter}
              filterOptionSelected={filterOptionSelected}
              filterTabs={filterTabs}
              handleFilterSelect={(e, item) => handleFilterSelect(item)}
              setFilterOptionSelected={setFilterOptionSelected}
              setFilterTabs={setFilterTabs}
              defaultSelection={optionsList[0]}
            />
          }
          <GlobalSearchInput
            searchValue={searchValue}
            setResearch={setResearch}
            setSearchValue={setSearchValue}
            show={show}
            setShow={setShow}
            loading={loading}
            setLoading={setLoading}
          />
        </div>
        {moduleMap.organization && (
          <GlobalSearchResults
            moduleMap={moduleMap}
            searchValue={searchValue}
            setErrorMessage={setErrorMessage}
            setSuccessMessage={setSuccessMessage}
            searchResults={searchResults}
            setToast={setToast}
            activityDetail={activityDetail}
            filterSelected={filterOptionSelected}
            setShow={setShow}
          />
        )}

        <AlertWrapper>
          <Alert
            message={toast.message}
            color={toast.color}
            setMessage={setToast}
          />
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
        {isShow && (
          <ActivityDetail
            activityDetail={activityDetail}
            isShow={isShow}
            setIsShow={setIsShow}
            setErrorMessage={setErrorMessage}
            setSuccessMessage={setSuccessMessage}
            showActivity={showActivity}
            data={activityObj}
            loading={isLoading}
            setGetActivityId={setGetActivityId}
            activityData={activityData}
            setIsBtnType={setIsBtnType}
            btnType={btnType}
            setActivityData={setActivityData}
            getActivityId={getActivityId}
            setLoading={setisLoading}
            markAsDone={markAsDone}
            tableActions={tableActions}
            isFieldsData={isFieldsData}
            setShowActivity={setShowActivity}
          />
        )}
      </GlobalSearchMain>
    </>
  );
};
