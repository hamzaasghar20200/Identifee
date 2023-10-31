import React from 'react';
import ButtonIcon from '../../../commons/ButtonIcon';
import MaterialIcon from '../../../commons/MaterialIcon';
import IdfTooltip from '../../../idfComponents/idfTooltip';

const TableSelectedCount = ({
  list,
  containerPadding = 'p-0',
  btnLabel,
  btnIcon,
  btnClick,
  btnClass,
  btnColor,
  loading,
  onClear,
  customButton,
  align = 'justify-content-end',
}) => {
  return (
    <div className={`text-end ${containerPadding}`}>
      <div className={`d-flex gap-2 ${align} align-items-center`}>
        <div className="d-flex gap-2 align-items-center bg-gray-5 border rounded p-1">
          <span
            className={`fs-8 font-weight-semi-bold text-black-50 text-capitalize pl-2`}
          >{`${list.length} Selected`}</span>
          {onClear && (
            <IdfTooltip text="Clear">
              <a
                href="#!"
                onClick={onClear}
                className="text-black-50 bg-hover-gray rounded-circle"
              >
                <MaterialIcon icon="close" />
              </a>
            </IdfTooltip>
          )}
        </div>
        {customButton || (
          <ButtonIcon
            icon={btnIcon}
            onclick={btnClick}
            label={btnLabel}
            classnames={btnClass}
            color={btnColor}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default TableSelectedCount;
