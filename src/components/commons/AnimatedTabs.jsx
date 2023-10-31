import { Nav, NavItem, NavLink } from 'reactstrap';
import classnames from 'classnames';
import React, { useState } from 'react';
import { isModuleAllowed, isPermissionAllowed } from '../../utils/Utils';
import { useTenantContext } from '../../contexts/TenantContext';

const TabItem = ({
  item,
  activeTab,
  toggle,
  animateStyle,
  setAnimateStyle,
  itemClasses = 'px-3 py-2',
  tabActiveClass = 'active',
}) => {
  return (
    <NavItem
      onMouseOver={(e) => {
        setAnimateStyle({
          transform: `translateX(${e.target.offsetLeft}px)`,
          width: e.target.offsetWidth,
          height: e.target.offsetHeight,
        });
      }}
      onMouseLeave={() => setAnimateStyle({ ...animateStyle, width: 0 })}
      key={item.tabId}
      className="py-0 tab-title"
    >
      <NavLink
        className={`${itemClasses} ${item.clazz} ${classnames({
          [tabActiveClass]: activeTab === item.tabId,
        })}`}
        onClick={() => {
          toggle(item);
        }}
      >
        {item.title}
      </NavLink>
    </NavItem>
  );
};

const AnimatedTabs = ({
  tabClasses,
  tabItemClasses,
  tabActiveClass,
  tabsData,
  activeTab,
  toggle,
  permissionCheck,
  requiredAdminAccess,
}) => {
  const [animateStyle, setAnimateStyle] = useState({});
  const { tenant } = useTenantContext();

  return (
    <Nav className={`border-bottom-0 position-relative ${tabClasses}`} tabs>
      {animateStyle.width > 0 && (
        <div
          className="position-absolute rounded bg-primary-soft"
          style={{
            transition: 'all ease-in 150ms',
            ...animateStyle,
          }}
        ></div>
      )}
      {tabsData.map((item) => (
        <>
          {permissionCheck && item.permission ? (
            <>
              {isPermissionAllowed(
                item.permission.collection,
                item.permission.action
              ) &&
                isModuleAllowed(tenant?.modules, item?.module) && (
                  <TabItem
                    activeTab={activeTab}
                    item={item}
                    toggle={toggle}
                    animateStyle={animateStyle}
                    setAnimateStyle={setAnimateStyle}
                    itemClasses={tabItemClasses}
                    tabActiveClass={tabActiveClass}
                  />
                )}
            </>
          ) : (
            <>
              {requiredAdminAccess === true ? (
                <TabItem
                  activeTab={activeTab}
                  item={item}
                  toggle={toggle}
                  animateStyle={animateStyle}
                  setAnimateStyle={setAnimateStyle}
                  itemClasses={tabItemClasses}
                  tabActiveClass={tabActiveClass}
                />
              ) : (
                <>
                  {item?.byModule ? (
                    <>
                      {isModuleAllowed(tenant?.modules, item.byModule) ? (
                        <TabItem
                          activeTab={activeTab}
                          item={item}
                          toggle={toggle}
                          animateStyle={animateStyle}
                          setAnimateStyle={setAnimateStyle}
                          itemClasses={tabItemClasses}
                          tabActiveClass={tabActiveClass}
                        />
                      ) : (
                        <></>
                      )}
                    </>
                  ) : (
                    <TabItem
                      activeTab={activeTab}
                      item={item}
                      toggle={toggle}
                      animateStyle={animateStyle}
                      setAnimateStyle={setAnimateStyle}
                      itemClasses={tabItemClasses}
                      tabActiveClass={tabActiveClass}
                    />
                  )}
                </>
              )}
            </>
          )}
        </>
      ))}
    </Nav>
  );
};

export default AnimatedTabs;
