import { useState, useEffect } from 'react';
import { getFileSize } from '../../../utils/Utils';
import stringConstants from '../../../utils/stringConstants.json';
import { VALID_FILES_EXTENSIONS } from '../../../utils/constants';
import { Spinner } from 'reactstrap';
import feedService from '../../../services/feed.service';
import ActivityFile from './ActivityFile';
import UploadFileModal from '../../modal/UploadFileModal';
import MaterialIcon from '../../commons/MaterialIcon';
import Table from 'react-bootstrap/Table';
import Pagination from '../../Pagination';
import ActivityFileMobile from './ActivityFileMobile';

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
    <div className="js-dropzone dropzone-custom dz-clickable dz-started">
      <div className="col h-100 px-1 mb-2 dz-processing dz-success dz-complete">
        <div className="dz-preview dz-file-preview border shadow">
          <div
            className="d-flex justify-content-end dz-close-icon position-absolute"
            style={{ top: 5, right: 5 }}
          >
            <a
              href=""
              onClick={deleteFile}
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
  const [, setWindowWidth] = useState(window.innerWidth);
  const [pagination, setPagination] = useState({ page: 1, limit: 15 });

  const isMobile = window.innerWidth <= 768;

  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };

  useEffect(() => {
    if (publicPage) getRecentFiles();
    window.addEventListener('resize', handleResize);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const getRecentFiles = () => {
    feedService
      .getFiles({ organizationId, activityId }, pagination)
      .then((res) => {
        setRecentFiles(res.files);
        setPagination(res.pagination);
      })
      .catch(() => {
        setErrorMessage(constants.profile.getFileError);
      });
  };

  useEffect(() => {
    getRecentFiles();
  }, [pagination.page]);

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
    <div className="w-100">
      <div className="position-relative">
        {fileInput ? (
          <>
            <FilePreview file={fileInput} deleteFile={deleteFile} />
          </>
        ) : (
          <>
            <div
              id="file"
              className="mux-drop-area w-100 mb-5 file-uploader p-5 border-dashed-gray"
            >
              <div className="mb-0 d-flex flex-column form-label justify-content-center align-items-center h-100">
                <div>
                  <MaterialIcon
                    icon="description"
                    filled
                    clazz="font-size-3xl text-muted"
                  />
                </div>
                <div>
                  <a className="btn-link decoration-underline cursor-pointer mx-1 text-primary font-weight-semi-bold">
                    Click to upload
                  </a>
                  <span className="ml-1 font-weight-semi-bold">
                    or drag and drop
                  </span>
                </div>
                <p className="text-muted mb-0">Maximum file size 50 MB.</p>
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
      </div>

      {fileInput && (
        <div className="d-flex justify-content-end mt-3 mb-4">
          <button
            className="btn btn-primary"
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
          {isMobile ? (
            <>
              {recentFiles?.map((file) => (
                <div key={file.id}>
                  <ActivityFileMobile
                    key={file.file_id}
                    file={file}
                    openFilesModal={openFilesModal}
                    publicPage={publicPage}
                    getRecentFiles={getRecentFiles}
                  />
                </div>
              ))}
            </>
          ) : (
            <div className="card generic mb-4">
              <Table responsive className="mb-0">
                <thead>
                  <tr>
                    <th>File name</th>
                    <th className="align-middle">Date uploaded</th>
                    <th className="align-middle">Uploaded by</th>
                  </tr>
                </thead>
                <tbody>
                  {recentFiles?.map((file) => (
                    <tr key={file.id}>
                      <ActivityFile
                        key={file.file_id}
                        file={file}
                        openFilesModal={openFilesModal}
                        publicPage={publicPage}
                        getRecentFiles={getRecentFiles}
                      />
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
          {recentFiles?.length > 0 && (
            <div className="col-xxl-12 col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12 text-center mb-3 d-flex justify-content-center">
              <Pagination
                className="m-auto"
                paginationInfo={pagination}
                onPageChange={(page) => {
                  setPagination((prevState) => ({
                    ...prevState,
                    page,
                  }));
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default IdfUploadFiles;
