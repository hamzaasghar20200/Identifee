import { Input, Spinner } from 'reactstrap';
import React, { useEffect, useState } from 'react';
import MaterialIcon from './MaterialIcon';
import CategoryPartnerLogo from '../lesson/CategoryPartnerLogo';
import TooltipComponent from '../lesson/Tooltip';
import ValidationErrorText from './ValidationErrorText';
import FunnyLoaderText from './FunnyLoaderText';
import DotDot from './DotDot';

const DragDropUploadFile = ({
  file,
  setFile,
  onLoadFile,
  isLoading,
  allowedFormat = '.png,.jpeg,.jpg',
  preview = false,
  chooseFileText,
  logoId,
  name = 'idfFile',
  containerHeight = '150px',
  emptyContainerHeight = '150px',
  uploadOnDrop,
  showUploadIcon = 'upload_file',
  onRemoveFile = () => {},
  fileUpload = true,
  customBtn,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewFile, setPreviewFile] = useState();
  const [logo, setLogo] = useState();

  useEffect(() => {
    setLogo(logoId);
  }, [logoId]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const previewFileInView = (droppedFile) => {
    setUploadError('');
    if (droppedFile) {
      const fileExtension = droppedFile.name.split('.').pop();
      // if file type not allowed
      if (!allowedFormat.includes(`.${fileExtension}`)) {
        setUploadError(`Please upload file in these ${allowedFormat} format.`);
        return false;
      }

      setFile(droppedFile);
      if (preview) {
        setPreviewFile(URL.createObjectURL(droppedFile));
        setLogo(null);
      }

      return true;
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files && e.dataTransfer.files[0];

    if (uploadOnDrop) {
      if (previewFileInView(droppedFile)) {
        onLoadFile({ target: { files: [droppedFile] } });
      }
    } else {
      previewFileInView(droppedFile);
    }
  };

  const handleLoadFile = (e) => {
    if (previewFileInView(e.target.files[0])) {
      onLoadFile(e);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      style={{ height: !file && emptyContainerHeight }}
      className={`card bg-gray-200 p-2 rounded d-flex mb-3 border-dashed-gray ${
        !file ? 'align-items-center justify-content-center' : ''
      } ${dragActive ? 'bg-gray-300' : ''}`}
    >
      {file && !preview && (
        <div className="p-2">
          <p className="text-left mb-1">
            <FunnyLoaderText
              autoPlay={6000}
              startingText="File process in progress"
              isFileProcessing={true}
            />
            <DotDot />
          </p>
          <div className="card rounded pdf-selected-wrapper w-100 p-3">
            <div>
              <div className="pdf-card d-flex justify-content-between align-items-center">
                <div className="d-flex flex-grow-1 align-items-center">
                  {isLoading && <Spinner className="spinner-grow-sm2" />}

                  <div className="text-left ml-2 flex-grow-1">
                    <p className="pdf-card-title">{file?.name}</p>
                  </div>
                </div>
                <TooltipComponent title="Remove">
                  <a
                    href=""
                    className="icon-hover-bg"
                    onClick={(e) => {
                      e.preventDefault();
                      setFile(null);
                      onRemoveFile();
                    }}
                  >
                    <MaterialIcon icon="delete" clazz="text-danger" />
                  </a>
                </TooltipComponent>
              </div>
            </div>
          </div>
        </div>
      )}

      {!file && (
        <div className="text-center p-3">
          <div className="font-weight-semi-bold mb-0 form-label">
            {showUploadIcon && (
              <MaterialIcon
                icon={showUploadIcon}
                symbols={true}
                clazz="font-size-4xl py-2 font-weight-lighter"
              />
            )}
            {fileUpload === true ? (
              <p className="font-weight-normal">
                {' '}
                {chooseFileText} or{' '}
                <Input
                  type="file"
                  accept={allowedFormat}
                  name={file?.name}
                  id={`file-${name}`}
                  onClick={(e) => {
                    e.target.value = '';
                  }}
                  className="d-none"
                  onChange={handleLoadFile}
                />
                <label htmlFor={`file-${name}`} className="mb-0">
                  <a className="btn-link decoration-underline cursor-pointer text-primary">
                    {isLoading ? <Spinner /> : 'Browse'}
                  </a>
                </label>{' '}
                for a file upload.{' '}
                <>
                  {allowedFormat?.includes('pdf') ? (
                    <p className="text-muted font-weight-medium font-size-xs py-1">
                      {allowedFormat.includes('doc')
                        ? 'Only .pdf, .doc and .xlsx files are accepted'
                        : 'Only .pdf files accepted'}
                    </p>
                  ) : (
                    <p className="text-muted font-weight-medium font-size-xs py-1">
                      Only .png/.jpeg files accepted
                    </p>
                  )}
                </>
                {customBtn}
              </p>
            ) : (
              <>
                <p>{fileUpload}</p>
                {customBtn}
              </>
            )}
          </div>
        </div>
      )}

      {file && (previewFile || logoId) && (
        <div
          className="position-relative d-flex justify-content-center overflow-hidden"
          style={{ height: containerHeight }}
        >
          {previewFile && (
            <img
              src={previewFile}
              style={{ objectFit: 'contain', width: 210 }}
            />
          )}
          {logo && (
            <CategoryPartnerLogo categoryInfo={{ logo }} width="210px" />
          )}
          <div
            className="cursor-pointer position-absolute top-0 right-0"
            onClick={() => setFile(null)}
          >
            <TooltipComponent title="Remove">
              <MaterialIcon icon="close" />
            </TooltipComponent>
          </div>
        </div>
      )}
      {uploadError && (
        <ValidationErrorText
          text={uploadError}
          extraClass="mb-0 font-weight-medium"
        />
      )}
    </div>
  );
};

export default DragDropUploadFile;
