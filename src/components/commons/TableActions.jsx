import MaterialIcon from './MaterialIcon';
import TooltipComponent from '../lesson/Tooltip';
import React from 'react';
import { isPermissionAllowed } from '../../utils/Utils';

const ActionItem = ({ item, action }) => {
  return (
    <TooltipComponent title={action.title}>
      <a
        onClick={(e) => {
          e.stopPropagation();
          action.onClick(item);
        }}
        className="cursor-pointer btn btn-icon btn-icon-sm icon-hover-bg"
      >
        <MaterialIcon icon={action.icon} />{' '}
      </a>
    </TooltipComponent>
  );
};

// using this where we want to show icons in table action column, for ref: see CategoriesTable.jsx, LessonTable.jsx etc
const TableActions = ({ item, actions }) => {
  return (
    <div className="d-flex justify-content-center gap-2 align-items-center">
      {actions.map((action, index) => {
        // Check if delete action is disabled against specific data row.
        return (
          <>
            {action?.permission ? (
              isPermissionAllowed(
                action?.permission?.collection,
                action?.permission?.action
              ) && (
                <>
                  {item?.dataRow?.data?.isDisableDelete &&
                  action.title === 'Delete' ? (
                    ''
                  ) : (
                    <ActionItem key={index} item={item} action={action} />
                  )}{' '}
                </>
              )
            ) : (
              <>
                {item?.dataRow?.data?.isDisableDelete &&
                action.title === 'Delete' ? (
                  ''
                ) : (
                  <ActionItem key={index} item={item} action={action} />
                )}{' '}
              </>
            )}
          </>
        );
      })}
    </div>
  );
};

export default TableActions;
