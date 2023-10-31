import IdfTooltip from '../idfComponents/idfTooltip';
import ButtonIcon from '../commons/ButtonIcon';
import React from 'react';

const AddNewReportButton = ({
  reports,
  readOnly,
  addView,
  handleManualReport,
}) => {
  return (
    <>
      {!readOnly && !addView ? (
        <>
          {reports.length > 0 ? (
            <IdfTooltip text="Add Report">
              <ButtonIcon
                icon="add"
                label=""
                onclick={handleManualReport}
                classnames="btn-sm"
              />
            </IdfTooltip>
          ) : (
            <ButtonIcon
              icon="add"
              label="Add Report"
              onclick={handleManualReport}
              classnames="btn-sm"
            />
          )}
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default AddNewReportButton;
