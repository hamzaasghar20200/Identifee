import { FormGroup } from 'reactstrap';
import DragDropUploadFile from '../commons/DragDropUploadFile';
import { CHOOSE_IMAGE_FILE } from '../../utils/constants';
import ButtonIcon from '../commons/ButtonIcon';
import React from 'react';

const ReportDragDrop = ({
  file,
  loader,
  setFile,
  fileUpload = true,
  uploadIcon = 'upload_file',
  onLoadFile,
  onRemoveFile,
  handleGenerate,
  lineBreak,
}) => {
  return (
    <div className="p-3">
      <FormGroup>
        <DragDropUploadFile
          file={file}
          setFile={setFile}
          name="accountStatementPdf"
          onLoadFile={onLoadFile}
          allowedFormat=".pdf"
          chooseFileText={CHOOSE_IMAGE_FILE}
          emptyContainerHeight={210}
          uploadOnDrop={true}
          isLoading={loader}
          fileUpload={fileUpload}
          onRemoveFile={onRemoveFile}
          showUploadIcon={uploadIcon}
          customBtn={
            !loader || !file ? (
              <>
                {lineBreak && (
                  <div className="position-relative">
                    <hr style={{ width: 320 }} />
                    <span
                      className="bg-gray-200 position-absolute text-muted py-1 abs-center fs-7"
                      style={{ top: -15, paddingLeft: 10, paddingRight: 10 }}
                    >
                      OR
                    </span>
                  </div>
                )}
                <ButtonIcon
                  icon="edit_note"
                  label="Manually enter your data"
                  onclick={handleGenerate}
                  color="primary"
                  classnames="btn-sm mt-1"
                />
              </>
            ) : null
          }
        />
      </FormGroup>
    </div>
  );
};

export default ReportDragDrop;
