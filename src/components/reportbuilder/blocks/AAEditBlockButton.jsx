import MaterialIcon from '../../commons/MaterialIcon';
import React from 'react';
import IdfTooltip from '../../idfComponents/idfTooltip';

const AAEditBlockButton = ({ callback, page }) => {
  return (
    <>
      {callback ? (
        <IdfTooltip text="Edit">
          <a
            data-html2canvas-ignore="true"
            href=""
            className="icon-hover-bg"
            onClick={(e) => {
              e.preventDefault();
              callback(page);
            }}
          >
            <MaterialIcon icon="edit" />
          </a>
        </IdfTooltip>
      ) : (
        ''
      )}
    </>
  );
};

export default AAEditBlockButton;
