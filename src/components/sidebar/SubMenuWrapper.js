import { useEffect, useContext } from 'react';

import { CategoriesContext } from '../../contexts/categoriesContext';
import { useAppContext } from '../../contexts/appContext';
import categoryService from '../../services/category.service';

function SubMenuWrapper(props) {
  const { isAuthenticated } = useAppContext();
  const { icon, title, children, active, setActive } = props;
  const { categoryList, setCategoryList } = useContext(CategoriesContext);
  const mapCategoryPath = (item) => {
    const path = item.title.toLocaleLowerCase().trim().replace(/ /g, '-');
    return {
      ...item,
      path: `/learn/categories/${path}?type=${
        item.isPublic ? 'explore' : 'custom'
      }`,
    };
  };
  // eslint-disable-next-line no-unused-vars
  const getCategories = async () => {
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

    const newCats = [
      ...exploreList.map(mapCategoryPath),
      ...customList.map(mapCategoryPath),
    ];
    setCategoryList(newCats);
  };
  useEffect(() => {
    if (title === 'Explore') {
      // getCategories();
    }
  }, [isAuthenticated]);
  const customListData = categoryList?.filter((c) => c.isPublic === false);
  const toggle = () => setActive(active !== title ? title : '');
  const className = active === title && 'show';
  return (
    <li
      className={`navbar-vertical-aside-has-menu ${className} ${
        customListData?.length === 0 && title === 'Custom' ? 'd-none' : ''
      }`}
    >
      <div
        className="js-navbar-vertical-aside-menu-link nav-link nav-link-toggle cursor-pointer"
        onClick={toggle}
      >
        {icon && <i className="material-icons-outlined nav-icon">{icon}</i>}
        <span className="navbar-vertical-aside-mini-mode-hidden-elements text-truncate cursor-pointer fw-bold">
          {title}
        </span>
      </div>
      <ul className={`js-navbar-vertical-aside-submenu nav nav-sub`}>
        {children}
      </ul>
    </li>
  );
}

export default SubMenuWrapper;
