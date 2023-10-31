import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { isPermissionAllowed } from '../utils/Utils';
import IdfTooltip from './idfComponents/idfTooltip';

const MoreActions = ({
  icon = 'more_vert',
  items,
  onHandleOpen,
  onHandleNameEdit,
  onHandleRemove,
  onHandleDownload,
  onHandleEdit,
  onHandleReinvite,
  onHandleAdd,
  onHandleEnable,
  onHandleDisable,
  toggleClassName,
  iconStyle,
  permission = {},
  menuWidth = 160,
  ...restProps
}) => {
  const onClickFire = {
    remove: onHandleRemove,
    edit: onHandleEdit,
    editName: onHandleNameEdit,
    reInvite: onHandleReinvite,
    add: onHandleAdd,
    download: onHandleDownload,
    open: onHandleOpen,
    enable: onHandleEnable,
    disable: onHandleDisable,
  };

  return (
    <>
      <Dropdown
        drop="down"
        style={{ opacity: 1 }}
        className="idf-dropdown-item-list"
      >
        <Dropdown.Toggle
          className={`${toggleClassName} add-more-btn icon-hover-bg rounded-circle dropdown-hide-arrow`}
          variant="outline-link"
          id="dropdown"
          {...restProps}
        >
          <span>
            <span className={`material-icons-outlined ${iconStyle}`}>
              {icon}
            </span>
          </span>
        </Dropdown.Toggle>

        {items.length > 0 && (
          <Dropdown.Menu
            align="right"
            className="border border-1 py-1"
            style={{ width: menuWidth }}
          >
            {items?.map((data) => (
              <>
                {data?.permission?.collection ? (
                  isPermissionAllowed(
                    data?.permission?.collection,
                    data?.permission?.action
                  ) && (
                    <Dropdown.Item
                      key={data.id}
                      className={`pl-2 text-black ${data.className} ${
                        data.id === 'delete' || data.id === 'remove'
                          ? data.className || 'bg-hover-danger'
                          : ''
                      }`}
                      onClick={onClickFire[data.id]}
                    >
                      <i
                        className={`material-icons-outlined dropdown-item-icon ${data.className}`}
                      >
                        {data.icon}
                      </i>
                      {data.name}
                    </Dropdown.Item>
                  )
                ) : (
                  <>
                    {data?.disabled ? (
                      <IdfTooltip text={data.disabled} placement="bottom">
                        <Dropdown.Item
                          key={data.id}
                          className={`pl-2 text-black ${data.className} ${
                            data.id === 'delete' || data.id === 'remove'
                              ? data.className || 'bg-hover-danger'
                              : ''
                          }`}
                        >
                          <i
                            className={`material-icons-outlined dropdown-item-icon ${data.className}`}
                          >
                            {data.icon}
                          </i>
                          {data.name}
                        </Dropdown.Item>
                      </IdfTooltip>
                    ) : (
                      <Dropdown.Item
                        key={data.id}
                        className={`pl-2 text-black ${data.className} ${
                          data.id === 'delete' || data.id === 'remove'
                            ? data.className || 'bg-hover-danger'
                            : ''
                        }`}
                        onClick={onClickFire[data.id]}
                      >
                        <i
                          className={`material-icons-outlined dropdown-item-icon ${data.className}`}
                        >
                          {data.icon}
                        </i>
                        {data.name}
                      </Dropdown.Item>
                    )}
                  </>
                )}
              </>
            ))}
          </Dropdown.Menu>
        )}
      </Dropdown>
    </>
  );
};

MoreActions.defaultProps = {
  toggleClassName: '',
};

export default MoreActions;
