import PageTitle from '../../components/commons/PageTitle';
import ButtonFilterDropdown from '../../components/commons/ButtonFilterDropdown';
import React, { useContext, useEffect, useState } from 'react';
import SelfAssessment from '../Resources/selfAssessment/SelfAssessment';
import MyFavorites from '../Resources/MyLessons';
import categoryService from '../../services/category.service';
// import useUrlSearchParams from '../../hooks/useUrlSearchParams';
import Category from '../Resources/category/Category';
import { useHistory } from 'react-router-dom';
import {
  isModuleAllowed,
  LearnViewTypes,
  sortByPinnedTopics,
} from '../../utils/Utils';
import { TenantContext } from '../../contexts/TenantContext';
import TopicIcon from '../../components/commons/TopicIcon';
import IdfTooltip from '../../components/idfComponents/idfTooltip';
import Overview from './Overview';
import useUrlSearchParams from '../../hooks/useUrlSearchParams';
import OrganizationTopics from './OrganizationTopics';
const generatePath = (item, path) => {
  const viewType = item?.isPublic ? 'explore' : 'custom';
  const type = item?.isPublic ? 'explore' : 'custom';

  const generatedPath = `/learn?id=${item?.id}&viewType=${viewType}&path=${path}&title=${item?.title}&type=${type}`;

  return generatedPath;
};
const mapCategoryPath = (item) => {
  const path = item.title.toLocaleLowerCase().trim().replace(/ /g, '-');
  return {
    ...item,
    path: generatePath(item, path),
  };
};

const CategoryList = ({ list, type, viewType, title, onClick }) => {
  const renameTitle = title?.replace(/-/g, ' ');
  return (
    <div className="overflow-y-auto" style={{ maxHeight: 400, minWidth: 260 }}>
      <ul className="list-group">
        {sortByPinnedTopics(list).map((item) => (
          <li key={item.id}>
            <a
              onClick={(e) => onClick(e, item, type)}
              className={`py-2 px-3 d-flex align-items-center gap-1 text-black bg-primary-soft-hover d-block w-100 border-bottom ${
                item?.title?.toLowerCase().includes(renameTitle) &&
                type === viewType
                  ? 'fw-bold text-primary bg-primary-soft'
                  : 'font-weight-medium '
              }`}
            >
              <TopicIcon
                icon={item.icon || 'category'}
                iconBg="bg-primary"
                iconStyle={{ width: 28, height: 28 }}
                iconClasses="font-size-md text-white"
              />
              {item.title.length > 25 ? (
                <IdfTooltip text={item.title}>
                  <p
                    className="mb-0 text-truncate flex-fill"
                    style={{ maxWidth: 180 }}
                  >
                    {item.title}
                  </p>
                </IdfTooltip>
              ) : (
                <p
                  className="mb-0 text-truncate flex-fill"
                  style={{ maxWidth: 180 }}
                >
                  {item.title}
                </p>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Learn = () => {
  const history = useHistory();
  const [openFilter, setOpenFilter] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState({});
  const [categories, setCategories] = useState({});
  const [loader, setLoader] = useState(false);
  const searchParams = useUrlSearchParams();
  const title = searchParams.get('title');
  const path = searchParams.get('path');
  const viewType = searchParams.get('viewType');
  const { tenant } = useContext(TenantContext);
  const filterList = [
    {
      name: 'Overview',
      key: LearnViewTypes.Overview,
      component: null,
    },
    {
      name: 'My Favorites',
      key: LearnViewTypes.MyFavorites,
      component: (
        <MyFavorites
          selectedFilter={{
            key: LearnViewTypes.MyFavorites,
            name: 'My Favorites',
          }}
        />
      ),
    },
    {
      name: 'My Organization',
      key: LearnViewTypes.Custom,
      component: <OrganizationTopics />,
      submenu: null, // will list all tenant specific categories
    },

    {
      name: 'Topics',
      key: LearnViewTypes.Topics,
      component: null,
      submenu: null, // will list all public categories
    },
    {
      name: 'Self-Assessment',
      key: LearnViewTypes.SelfAssessment,
      component: (
        <div className="pt-3">
          <SelfAssessment />
        </div>
      ),
    },
  ];
  const [updateFilterList, setUpdateFilterList] = useState(filterList);
  const [selectedFilter, setSelectedFilter] = useState(filterList[0]);
  const [id, setId] = useState('');

  const handleTopicCustomMenuClick = (e, item, type) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenFilter(false);
    setSelectedTopic(item);
    const selectedCategory = {
      ...updateFilterList.find((f) => f.key === type),
    };
    const titlePath = item.title.toLocaleLowerCase().trim().replace(/ /g, '-');
    history.replace({
      search: generatePath(item, titlePath),
    });
    setSelectedFilter(selectedCategory);
  };

  const getCategories = async () => {
    try {
      setLoader(true);
      const requests = [
        categoryService.GetCategories(null, {
          limit: 75,
          restrictBy: 'public',
        }),
        categoryService.GetCategories(null, {
          limit: 75,
          restrictBy: 'private',
        }),
      ];

      const responses = await Promise.all(requests);
      const exploreList = responses[0].data?.map((m) => ({
        ...m,
        restrictBy: 'public',
      }));
      const customList = responses[1].data?.map((m) => ({
        ...m,
        restrictBy: 'private',
      }));

      setCategories({
        exploreList: exploreList.map(mapCategoryPath),
        customList: customList.map(mapCategoryPath),
      });

      const newFilters = [...updateFilterList].map((s) => ({
        ...s,
        submenu:
          s.key === LearnViewTypes.Topics ? (
            <CategoryList
              list={exploreList.map(mapCategoryPath)}
              onClick={handleTopicCustomMenuClick}
              type={LearnViewTypes.Topics}
              title={path}
              viewType={viewType}
              selected={selectedTopic}
            />
          ) : s.key === LearnViewTypes.Custom ? (
            <CategoryList
              list={customList.map(mapCategoryPath)}
              onClick={handleTopicCustomMenuClick}
              type={LearnViewTypes.Custom}
              title={path}
              viewType={viewType}
              selected={selectedTopic}
            />
          ) : null,
        component:
          s.key === LearnViewTypes.MyFavorites ? (
            <MyFavorites
              selectedFilter={{
                key: LearnViewTypes.MyFavorites,
                name: 'My Favorites',
              }}
              topics={exploreList?.concat(customList)}
            />
          ) : (
            s.component
          ),
        // permission check
        showHide:
          s.key === LearnViewTypes.SelfAssessment
            ? isModuleAllowed(tenant.modules, 'self_assessment')
              ? ''
              : 'd-none'
            : '',
      }));
      setUpdateFilterList(newFilters);
    } catch (e) {
      console.log(e);
    } finally {
      setLoader(false);
    }
  };
  useEffect(() => {
    getCategories();
  }, [viewType, path, id]);
  useEffect(() => {
    const currentURL = window.location.href;
    const urlParts = currentURL?.split('?');
    if (urlParts?.length > 0) {
      const queryParams = urlParts[2]?.split('&');
      let id = null;
      queryParams?.forEach((param) => {
        const [key, value] = param?.split('=');
        if (key === 'id') {
          id = value;
        }
      });
      setId(id);
    }
  }, [path]);
  useEffect(() => {
    if (viewType) {
      const obj = filterList.find((f) => f.key === viewType);
      setSelectedFilter(obj);
    } else {
      setSelectedFilter(
        filterList.find((f) => f.key === LearnViewTypes.Overview)
      );
    }
  }, [viewType]);
  return (
    <div>
      <PageTitle page={selectedFilter?.name || 'Learn'} pageModule="" />
      <ButtonFilterDropdown
        buttonText="Timeline"
        options={updateFilterList}
        filterOptionSelected={selectedFilter}
        ignoreChildHover="ignore-child"
        btnToggleStyle="rounded text-dark font-weight-500"
        openFilter={openFilter}
        setOpenFilter={setOpenFilter}
        handleFilterSelect={(e, item) => {
          history.replace({
            search: `?viewType=${item.key}`,
          });
          setSelectedFilter(item);
        }}
      />
      <div>
        <>
          {id && path ? (
            <Category
              category={{ id, title, path }}
              topics={categories?.exploreList?.concat(categories?.customList)}
            />
          ) : (
            <>
              {selectedFilter?.key === LearnViewTypes.Overview ? (
                <>
                  <Overview
                    loading={loader}
                    setSelectedFilter={setSelectedFilter}
                    topics={categories}
                    updateFilterList={updateFilterList}
                    selectedFilter={selectedFilter}
                  />
                </>
              ) : (
                selectedFilter?.component
              )}
            </>
          )}
        </>
      </div>
    </div>
  );
};

export default Learn;
