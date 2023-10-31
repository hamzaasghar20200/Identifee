import React from 'react';
import TableSelectedCount from '../prospecting/v2/common/TableSelectedCount';
import { isPermissionAllowed } from '../../utils/Utils';
const LayoutHead = ({
  onHandleCreate,

  buttonLabel,
  selectedData = [],
  onDelete,
  allRegister,
  children,
  headingTitle,
  headingText,
  orientationDelete,
  labelButtonDelete = 'Delete',
  dataInDB,
  onClear,
  permission,
  alignTop = 'mb-2',
}) => {
  const updatedSelectedData = selectedData.map((element) => {
    switch (element) {
      case 'all':
        return 'Activities';
      default:
        return element;
    }
  });
  return (
    <div className={`d-flex ${alignTop}`}>
      <div className="d-flex-column align-items-left">
        <h3 className="font-weight-medium">{headingTitle}</h3>
        <p className="font-weight-normal">{headingText} </p>
      </div>
      <div className="ml-auto d-flex gap-2 align-items-center">
        {selectedData.length > 0 && (
          <>
            {isPermissionAllowed(permission?.collection, 'delete') && (
              <TableSelectedCount
                list={updatedSelectedData}
                btnClick={onDelete.bind(null, selectedData)}
                btnClass="btn-sm"
                btnIcon="delete"
                onClear={onClear}
                btnLabel={labelButtonDelete}
                btnColor="outline-danger"
              />
            )}
          </>
        )}

        {!orientationDelete && allRegister && <span>{allRegister}</span>}
        {children}
        {orientationDelete && allRegister && <span>{allRegister}</span>}
        {dataInDB && (
          <div>
            <>
              {permission?.collection ? (
                isPermissionAllowed(permission?.collection, 'create') && (
                  <button
                    className="btn btn-primary btn-sm"
                    data-toggle="modal"
                    onClick={onHandleCreate}
                  >
                    <span className="material-icons-outlined">add</span>
                    {buttonLabel}
                  </button>
                )
              ) : (
                <button
                  className="btn btn-primary btn-sm"
                  data-toggle="modal"
                  onClick={onHandleCreate}
                >
                  <span className="material-icons-outlined">add</span>
                  {buttonLabel}
                </button>
              )}
            </>
          </div>
        )}
      </div>
    </div>
  );
};

export default LayoutHead;
