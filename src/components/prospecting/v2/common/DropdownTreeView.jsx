import React, { useState } from 'react';

import MaterialIcon from '../../../commons/MaterialIcon';

export const DropdownTreeView = ({
  data,
  editRoleData = '',
  reportTo,
  setIsDropdownId,
  isDropdownId,
  fieldState = {},
  validationConfig = {},
  getRoleData = '',
  disabled,
}) => {
  const [treeView, setTreeView] = useState(false);

  const handleShow = (TreeData, e) => {
    e.stopPropagation();
    setIsDropdownId(TreeData);
    setTreeView(false);
  };

  const inviteData = [data].filter((user) => {
    return user?.id === getRoleData ? user : '';
  });
  const display = (parent) => {
    return (
      <>
        {parent?.length > 0 &&
          parent.map((item, i) => {
            return (
              <>
                <div
                  key={`treeView_${i}`}
                  className={`${
                    editRoleData.name === item?.name ? 'disabled' : disabled
                  } show_border main-body-hh`}
                >
                  <div
                    className={`btn_hover_show main-row-hh table-tree-tbody-row`}
                  >
                    <button
                      type="button"
                      value={item?.name}
                      onClick={(e) => handleShow(item, e)}
                      className=" table-tree-body-cell treeBtn w-100"
                    >
                      <span className="d-inline-block">{item?.name}</span>
                    </button>
                  </div>
                  {item?.children?.length > 0 && (
                    <div className="child py-0 pl-3">
                      <div className="main-body-hh">
                        {display(item.children)}
                      </div>
                    </div>
                  )}
                </div>
              </>
            );
          })}
      </>
    );
  };

  return (
    <>
      <div
        className={`dropdownTree ${
          validationConfig?.required ? 'border-left-4 border-left-danger' : ''
        } ${
          fieldState.invalid && !fieldState?.error?.ref?.value
            ? 'border-danger'
            : ''
        } `}
      >
        <h5 className={`mb-0`} onClick={() => setTreeView(!treeView)}>
          {isDropdownId?.name || editRoleData?.name ? (
            <div className="d-flex align-items-center justify-content-between">
              <span>
                {isDropdownId?.name ||
                  inviteData[0]?.name ||
                  reportTo?.parent?.name ||
                  editRoleData?.name}
              </span>
              <MaterialIcon icon="account_tree" className="ml-1" />
            </div>
          ) : (
            <div className="d-flex align-items-center justify-content-between">
              <span>{'Select One'}</span>
              <MaterialIcon icon="account_tree" className="ml-1" />
            </div>
          )}
        </h5>
        {treeView && <div>{display([data])}</div>}
      </div>
    </>
  );
};
