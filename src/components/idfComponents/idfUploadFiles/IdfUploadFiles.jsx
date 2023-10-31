import { useState, useEffect } from 'react';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import Collapse from '@mui/material/Collapse';
import { getFileSize } from '../../../utils/Utils';
import stringConstants from '../../../utils/stringConstants.json';
import { VALID_FILES_EXTENSIONS } from '../../../utils/constants';
import { Spinner } from 'reactstrap';
import feedService from '../../../services/feed.service';
import ActivityFile from '../../peopleProfile/contentFeed/ActivityFile';
import UploadFileModal from '../../modal/UploadFileModal';
import MaterialIcon from '../../commons/MaterialIcon';

const constants = stringConstants.modals.uploadFileModal;

const FilePreview = ({ file, deleteFile }) => {
  const [fileInfo, setFileInfo] = useState({
    name: '',
    size: '',
  });

  useEffect(() => {
    setFileInfo((prev) => ({
      ...prev,
      name: file.name,
      size: getFileSize(file.size),
    }));
  }, [file]);

  return (
    <div className="js-dropzone dropzone-custom custom-file-boxed dz-clickable dz-started">
      <div className="col h-100 px-1 mb-2 dz-processing dz-success dz-complete">
        <div className="dz-preview dz-file-preview border shadow">
          <div
            className="d-flex justify-content-end dz-close-icon position-absolute"
            style={{ top: 5, right: 5 }}
          >
            <a
              href=""
              onClick={(e) => deleteFile(e)}
              className="icon-hover-bg btn btn-link"
            >
              <MaterialIcon icon="close" />
            </a>
          </div>
          <div className="dz-details media">
            <span className="dz-file-initials text-capitalize">
              {fileInfo.name[0]}
            </span>
            <div className="media-body dz-file-wrapper">
              <h6 className="dz-filename">
                <span className="dz-title">{fileInfo.name}</span>
              </h6>
              <div className="dz-size">
                <strong>{fileInfo.size}</strong>
              </div>
            </div>
          </div>
          <div className="dz-progress progress mb-1">
            <div className="dz-upload progress-bar bg-success w-100"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const IdfUploadFiles = ({
  fileInput,
  deleteFile,
  setErrorMessage,
  setFileInput,
  setIsLoading,
  handleSubmit,
  loading,
  activityId,
  publicPage,
  organizationId,
  openFilesModal,
  setOpenFilesModal,
}) => {
  const [recentFiles, setRecentFiles] = useState([]);
  const [openUploadModal, setOpenUploadModal] = useState(false);

  useEffect(() => {
    if (publicPage) getRecentFiles();
  }, []);

  const getRecentFiles = () => {
    feedService
      .getFiles({ organizationId, activityId }, { limit: 5 })
      .then((res) => {
        setRecentFiles(res.files);
      })
      .catch(() => {
        setErrorMessage(constants.profile.getFileError);
      });
  };

  const onFileChange = (event) => {
    if (!event?.target?.files[0]?.type) {
      const extensionIndex = event?.target?.files[0].name.indexOf('.');
      const extension = event?.target?.files[0].name.slice(extensionIndex + 1);

      const macExtensions = ['pages', 'numbers', 'key'];

      if (!macExtensions.includes(extension))
        return setErrorMessage('Invalid extension');

      const newFile = new Blob([event?.target?.files[0]], {
        type: extension,
      });

      newFile.name = event?.target?.files[0].name.slice(0, extensionIndex);
      newFile.lastModifiedDate = event?.target?.files[0].lastModifiedDate;

      return setFileInput(newFile);
    }

    if (VALID_FILES_EXTENSIONS.includes(event?.target?.files[0]?.type)) {
      return setFileInput(event.target.files[0]);
    } else {
      setErrorMessage('Invalid extension');
    }
  };

  const onSubmit = () => {
    setIsLoading(true);
    handleSubmit(fileInput, setIsLoading, getRecentFiles);
  };

  return (
    <div className="position-relative">
      {fileInput ? (
        <>
          <FilePreview file={fileInput} deleteFile={deleteFile} />
        </>
      ) : (
        <>
          <div
            id="file"
            className="js-dropzone border-dashed-gray bg-gray-200 dropzone-custom rounded p-2 my-2"
          >
            <div
              className="media m-auto d-flex align-items-center justify-content-center"
              style={{ height: 80 }}
            >
              <h5 className="mb-0 d-flex font-weight-normal fs-7 align-items-center justify-content-cente">
                <MaterialIcon
                  icon={`upload_file`}
                  clazz="font-size-2xl font-weight-lighter"
                />
                {constants.dragAndDrop}
                {' or'}&nbsp;
                <a className="font-weight-semi-bold decoration-underline">
                  {constants.browseFiles}
                </a>
                &nbsp;
                {'for a file to upload'}
              </h5>
            </div>
          </div>

          <input
            className="file-input-drag"
            type="file"
            name="file"
            onChange={onFileChange}
            accept={VALID_FILES_EXTENSIONS}
            value={fileInput}
            id="file"
          />
        </>
      )}

      {fileInput && (
        <div className="d-flex justify-content-end mt-3 mb-2">
          <button
            className="btn btn-sm btn-primary"
            onClick={onSubmit}
            disabled={!fileInput}
          >
            {loading ? (
              <Spinner className="spinner-grow-xs" />
            ) : (
              <span> Upload Files </span>
            )}
          </button>
        </div>
      )}

      {publicPage && (
        <UploadFileModal
          setShowModal={setOpenUploadModal}
          showModal={openUploadModal}
          handleSubmit={handleSubmit}
          setErrorMessage={setErrorMessage}
          publicPage={publicPage}
        />
      )}

      {publicPage && (
        <>
          <ul className="list-group list-group-flush list-group-no-gutters my-3">
            <TransitionGroup appear={true}>
              {recentFiles?.map((file) => (
                <Collapse key={file.id}>
                  <ActivityFile
                    key={file.file_id}
                    file={file}
                    openFilesModal={openFilesModal}
                    publicPage={publicPage}
                  />
                </Collapse>
              ))}
            </TransitionGroup>
          </ul>

          {recentFiles?.length > 4 && (
            <button
              className="btn btn-white btn-block btn-sm"
              onClick={() => {
                setOpenFilesModal(true);
              }}
            >
              {constants.profile.viewAllLabel}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default IdfUploadFiles;
