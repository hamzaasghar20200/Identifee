import React, { useEffect, useState, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import routes from '../../utils/routes.json';
import { CategoriesContext } from '../../contexts/categoriesContext';
import SidebarIcon from './SidebarIcon';
import SubMenuWrapper from './SubMenuWrapper';
import { sidebarData } from './constants/Sidebar.constants';
import { ToggleMenuContext } from '../../contexts/toogleMenuContext';
import { useViewport } from '../../contexts/viewportContext';
import { TenantContext, useTenantContext } from '../../contexts/TenantContext';
import { useModuleContext } from '../../contexts/moduleContext';
import {
  clearMenuSelection,
  isMatchInCommaSeperated,
  isModuleAllowed,
  isPermissionAllowed,
} from '../../utils/Utils';
import { useProfileContext } from '../../contexts/profileContext';
import useIsTenant from '../../hooks/useIsTenant';

function Item(props) {
  const history = useHistory();
  const { title, icon, path, setActive: setActiveSlide } = props; // TODO: permissions
  const [active, setActive] = useState('');
  const { moduleMap } = useModuleContext();

  const location = useLocation();
  useEffect(() => {
    if (
      location.pathname === path ||
      (path !== '/' && location.pathname.includes(path))
    ) {
      // to avoid highlight main menu learn, its conflicting with settings->learn, so had to add this.
      if (path === '/learn' && location.pathname.includes('/settings/learn')) {
        return setActive('');
      } else if (
        path === '/pipeline' &&
        location.pathname.includes('/settings')
      ) {
        return setActive('');
      }
      if (setActiveSlide) setActiveSlide('');
      return setActive('active');
    }
  }, [location]);

  const getTitle = (title) => {
    let result;

    if (title === 'Companies' && moduleMap.organization)
      result = moduleMap.organization.plural;
    else if (title === 'Contacts' && moduleMap.contact)
      result = moduleMap.contact.plural;
    else if (title === 'Pipeline' && moduleMap.deal)
      result = moduleMap.deal.plural;
    if (typeof result === 'string') {
      result = result.charAt(0).toUpperCase() + result.slice(1);
      return result;
    }
    return title;
  };

  return (
    // TODO: Permissions view strategy
    <li className="nav-item">
      <div
        id={`menu-${title?.toLowerCase()}`}
        className={`js-nav-tooltip-link nav-link cursor-pointer fw-bold ${active}`}
        onClick={(e) => {
          clearMenuSelection(e);
          history.push(`${path}`);
        }}
      >
        {icon && (
          <i
            style={{ fontSize: icon === 'home' ? '1.6rem' : '' }}
            className="material-icons-outlined nav-icon"
          >
            {icon}
          </i>
        )}
        <span
          className={`navbar-vertical-aside-mini-mode-hidden-elements text-truncate fw-bold ${
            path?.includes('/learn/categories') ? 'pl-2' : ''
          }`}
        >
          {getTitle(title)}
        </span>
      </div>
    </li>
  );
}

function SubMenu({
  icon,
  title,
  items,
  permissions,
  active,
  setActive,
  ...restProps
}) {
  function renderItem(subItem) {
    const { tenant } = useContext(TenantContext);
    if (subItem.submenu) {
      const [subActive, setSubActive] = useState('');
      useEffect(() => {
        setSubActive('');
      }, [active]);
      return (
        <SubMenuWrapper
          key={`${subItem.id}-${subItem.path}`}
          title={subItem.title}
          active={subActive}
          setActive={setSubActive}
          {...restProps}
        >
          {subItem.items?.map((item) => {
            return (
              <Item
                key={`${item.id}-${item.path}`}
                path={item.path}
                title={item.title}
                permissions={item.permissions}
              />
            );
          })}
        </SubMenuWrapper>
      );
    }

    return (
      <>
        {subItem?.title === 'Self-Assessment' ? (
          isModuleAllowed(tenant.modules, 'self_assessment') && (
            <Item
              key={`${subItem.id}-${subItem.path}`}
              path={subItem.path}
              title={subItem.title}
              permissions={subItem.permissions}
            />
          )
        ) : (
          <Item
            key={`${subItem.id}-${subItem.path}`}
            path={subItem.path}
            title={subItem.title}
            permissions={subItem.permissions}
          />
        )}
      </>
    );
  }
  return (
    // TODO: Permissions view strategy
    <SubMenuWrapper
      icon={icon}
      title={title}
      active={active}
      setActive={setActive}
      {...restProps}
    >
      {items?.map((item) => renderItem(item))}
    </SubMenuWrapper>
  );
}

function MenuItem(props) {
  const { submenu, tenant, sidebarTitle, ...restProps } = props;

  if (submenu) return <SubMenu tenant={tenant} {...restProps} />;

  return <Item {...restProps} />;
}

const checkForMultiplePermissions = (permissions) => {
  return permissions.some((s) => isPermissionAllowed(s.collection, s.action));
};

function SidebarMenu({ allMenuItems, active, setActive, pathname }) {
  const { profileInfo } = useProfileContext();
  const { tenant } = useTenantContext();

  return (
    <div className="navbar-vertical-content bg-light pt-3 pt-lg-4 pb-4">
      <ul className="navbar-nav navbar-nav-lg nav-tabs font-weight-medium font-size-md">
        {allMenuItems?.map((sidebarItem) => {
          return (
            <div key={`${sidebarItem.id}-${sidebarItem.path}`}>
              {profileInfo?.role?.admin_access && sidebarItem.adminAccess ? (
                <MenuItem
                  path={sidebarItem.path}
                  icon={sidebarItem.icon}
                  title={sidebarItem.title}
                  submenu={sidebarItem.submenu}
                  items={sidebarItem.adminAccess ? sidebarItem.items : ''}
                  permissions={sidebarItem.permissions}
                  active={active}
                  setActive={setActive}
                />
              ) : (
                !profileInfo?.role?.admin_access &&
                !sidebarItem.adminAccess && (
                  <>
                    {sidebarItem.permissions ? (
                      <>
                        {Array.isArray(sidebarItem.permissions) &&
                        checkForMultiplePermissions(sidebarItem.permissions) ? (
                          <MenuItem
                            path={sidebarItem.path}
                            icon={sidebarItem.icon}
                            title={sidebarItem.title}
                            submenu={sidebarItem.submenu}
                            items={sidebarItem.items}
                            permissions={sidebarItem.permissions}
                            active={active}
                            setActive={setActive}
                          />
                        ) : (
                          <>
                            {isPermissionAllowed(
                              sidebarItem.permissions.collection,
                              sidebarItem.permissions.action,
                              sidebarItem.permissions.tenantName
                            ) && (
                              <MenuItem
                                path={sidebarItem.path}
                                icon={sidebarItem.icon}
                                title={sidebarItem.title}
                                submenu={sidebarItem.submenu}
                                items={sidebarItem.items}
                                permissions={sidebarItem.permissions}
                                active={active}
                                setActive={setActive}
                              />
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        {sidebarItem?.byModule ? (
                          <>
                            {isModuleAllowed(
                              tenant?.modules,
                              sidebarItem?.byModule
                            ) ? (
                              <MenuItem
                                path={sidebarItem.path}
                                icon={sidebarItem.icon}
                                title={sidebarItem.title}
                                submenu={sidebarItem.submenu}
                                items={sidebarItem.items}
                                permissions={sidebarItem.permissions}
                                active={active}
                                setActive={setActive}
                              />
                            ) : (
                              <></>
                            )}
                          </>
                        ) : (
                          <MenuItem
                            path={sidebarItem.path}
                            icon={sidebarItem.icon}
                            title={sidebarItem.title}
                            submenu={sidebarItem.submenu}
                            items={sidebarItem.items}
                            permissions={sidebarItem.permissions}
                            active={active}
                            setActive={setActive}
                          />
                        )}
                      </>
                    )}
                  </>
                )
              )}
            </div>
          );
        })}
      </ul>
    </div>
  );
}

function SidebarContent({ sidebarData, tenant }) {
  const [active, setActive] = useState('');

  return (
    <>
      <div id="mainMenu" className="navbar-vertical-container">
        <div className="navbar-vertical-footer-offset pt-2">
          <SidebarIcon />

          <SidebarMenu
            allMenuItems={sidebarData}
            active={active}
            setActive={setActive}
          />
        </div>
      </div>
      {isModuleAllowed(tenant.modules, 'Settings') && (
        <div className="navbar-vertical-footer bg-light p-0 py-2">
          <ul className="navbar-nav navbar-nav-lg nav-tabs font-weight-medium font-size-md">
            <MenuItem
              tenant={tenant}
              path="/settings"
              icon="settings"
              title="Settings"
              setActive={setActive}
            />
          </ul>
        </div>
      )}
    </>
  );
}

export default function Sidebar() {
  const [tenantMenu, setTenantMenu] = useState(null);
  const { tenant } = useContext(TenantContext);
  const { categoryList } = useContext(CategoriesContext);
  const { isOpen } = useContext(ToggleMenuContext);
  const { width } = useViewport();

  const moduleNamesAliases = {
    Prospecting: 'prospecting',
    Pipeline: 'deals',
    Reporting: 'reporting',
    Learn: 'learn',
    Home: 'home',
    'AI Assist': 'ai_assist',
  };

  const getModuleNames = (name) => {
    if (Object.hasOwn(moduleNamesAliases, name)) {
      return moduleNamesAliases[name];
    }
    return name;
  };
  useEffect(() => {
    if (tenant?.modules) {
      const isSynovus = useIsTenant().isSynovusBank;
      let tenantMenuData = sidebarData.filter((el) => {
        return (
          !tenant.modules ||
          tenant.modules === '*' ||
          isMatchInCommaSeperated(tenant.modules, getModuleNames(el.title))
        );
      });
      if (isSynovus) {
        tenantMenuData = tenantMenuData.map((s) => ({
          ...s,
          title: s.title === 'Companies' ? 'Insights' : s.title,
          path: s.title === 'Companies' ? routes.insightsCompanies : s.path,
        }));
      }
      setTenantMenu(tenantMenuData);
    }
  }, [tenant]);

  useEffect(() => {
    if (tenantMenu && categoryList?.length) {
      const tenantMenuData = [...tenantMenu];
      const trainingObject = tenantMenuData.find(
        (data) => data.title === 'Training' || data.title === 'Learn'
      );
      trainingObject?.items?.forEach((item) => {
        if (item.title === 'Explore') {
          item.items = categoryList.filter((c) => c.isPublic === true);
        } else if (item.title === 'Custom') {
          item.items = categoryList.filter((c) => c.isPublic === false);
        }
      });

      setTenantMenu(tenantMenuData);
    }
  }, [categoryList]);

  const navbarDirection =
    width < 1200
      ? 'navbar-horizontal-fixed sidebar-collapse sidebar-mobile'
      : 'navbar-vertical-fixed';
  return (
    <>
      <div
        className={`js-navbar-vertical-aside navbar navbar-vertical-aside fw-bold navbar-vertical ${navbarDirection} navbar-expand-xl navbar-bordered navbar-light  ${
          width < 1200 && !isOpen && 'collapse'
        }`}
      >
        {tenant && tenantMenu && (
          <SidebarContent sidebarData={tenantMenu} tenant={tenant} />
        )}
      </div>
    </>
  );
}
