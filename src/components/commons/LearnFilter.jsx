import ButtonFilterDropdown from './ButtonFilterDropdown';
import React, { useContext, useEffect, useState } from 'react';
import categoryService from '../../services/category.service';
import { isModuleAllowed, LearnViewTypes } from '../../utils/Utils';
import MyFavorites from '../../views/Resources/MyLessons';
import SelfAssessment from '../../views/Resources/selfAssessment/SelfAssessment';
import MaterialIcon from './MaterialIcon';
import { TenantContext } from '../../contexts/TenantContext';
import routes from '../../utils/routes.json';
import { useHistory } from 'react-router-dom';
import OrganizationTopics from '../../views/Learn/OrganizationTopics';

const mapCategoryPath = (item) => {
  const path = item.title.toLocaleLowerCase().trim().replace(/ /g, '-');
  return {
    ...item,
    path: `${routes.learnMain}?id=${item.id}&path=${path}&title=${
      item.title
    }&type=${item.isPublic ? 'explore' : 'custom'}`,
  };
};

const CategoryList = ({ list, type, selected, onClick }) => {
  return (
    <div className="overflow-y-auto" style={{ maxHeight: 400, minWidth: 250 }}>
      <ul className="list-group">
        {list.map((item) => (
          <li key={item.id}>
            <a
              onClick={(e) => onClick(e, item, type)}
              className={`py-2 px-3 d-flex align-items-center gap-1 font-weight-normal text-black bg-primary-soft-hover ${
                selected.title === item.title ? 'bg-primary-soft' : ''
              } font-weight-medium d-block w-100 border-bottom`}
            >
              <MaterialIcon icon={item.icon || 'category'} />
              <p
                className="mb-0 text-truncate flex-fill"
                style={{ maxWidth: 150 }}
              >
                {item.title}
              </p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

const LearnFilter = ({ defaultFilter }) => {
  const [openFilter, setOpenFilter] = useState(false);
  const [selectedTopic] = useState({});
  const [categories, setCategories] = useState({});
  const [, setLoader] = useState(false);
  const { tenant } = useContext(TenantContext);
  const history = useHistory();
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
      component: <OrganizationTopics topics={categories} />,
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
  const [selectedFilter, setSelectedFilter] = useState(
    defaultFilter || filterList[0]
  );
  const handleTopicCustomMenuClick = (e, item, type) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenFilter(false);
    const selectedCategory = {
      ...updateFilterList.find((f) => f.key === type),
    };
    const titlePath = item.title.toLocaleLowerCase().trim().replace(/ /g, '-');
    history.push(
      `/learn?id=${item.id}&path=${titlePath}&title=${item.title}&type=${
        item.isPublic ? 'explore' : 'custom'
      }`
    );
    setSelectedFilter(selectedCategory);
  };

  const getCategories = async () => {
    try {
      setLoader(true);
      const requests = [
        categoryService.GetCategories(null, { limit: 75, isPublic: true }),
        categoryService.GetCategories(null, { limit: 75, isPublic: false }),
      ];

      const responses = await Promise.all(requests);
      const exploreList = responses[0].data?.map((m) => ({
        ...m,
        isPublic: true,
      }));
      const customList = responses[1].data?.map((m) => ({
        ...m,
        isPublic: false,
      }));

      setCategories({
        exploreList: exploreList.map(mapCategoryPath),
        customList: customList.map(mapCategoryPath),
      });

      let newFilters = [...updateFilterList].map((s) => ({
        ...s,
        submenu:
          s.key === LearnViewTypes.Topics ? (
            <CategoryList
              list={exploreList.map(mapCategoryPath)}
              onClick={handleTopicCustomMenuClick}
              type={LearnViewTypes.Topics}
              selected={selectedTopic}
            />
          ) : s.key === LearnViewTypes.Custom ? (
            <CategoryList
              list={customList.map(mapCategoryPath)}
              onClick={handleTopicCustomMenuClick}
              type={LearnViewTypes.Custom}
              selected={selectedTopic}
            />
          ) : null,
      }));

      // permission check
      newFilters = newFilters.map((le) => ({
        ...le,
        showHide:
          le.key === LearnViewTypes.SelfAssessment
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
  }, []);
  return (
    <>
      <ButtonFilterDropdown
        buttonText="Timeline"
        options={updateFilterList}
        filterOptionSelected={selectedFilter}
        ignoreChildHover="ignore-child"
        openFilter={openFilter}
        setOpenFilter={setOpenFilter}
        handleFilterSelect={(e, item) => {
          setOpenFilter(false);
          history.replace({
            search: '',
          });
          setSelectedFilter(item);
          history.push(`${routes.learnMain}?viewType=${item.key}`);
        }}
      />
    </>
  );
};

export default LearnFilter;
