import { useState, Fragment, useEffect } from 'react';

import FileIcon from '../../fileIcon/FileIcon';
import { setDateFormat, getFileSize } from '../../../utils/Utils';
import { removeFile } from '../../../utils/removeFile';
import DeleteFile from '../../peopleProfile/contentFeed/DeleteFile';
import MoreActions from '../../MoreActions';
import { items } from '../../../views/Deals/pipelines/Pipeline.constants';
import assetsService from '../../../services/assets.service';
import filesService from '../../../services/files.service';
import { FILE_DOESNT_EXIST } from '../../../utils/constants';
import RenameModal from '../../modal/RenameModal';
import IdfTooltip from '../../idfComponents/idfTooltip';
import MaterialIcon from '../../commons/MaterialIcon';
import { Spinner } from 'reactstrap';
import { getClientPortalToken } from '../../../../src/layouts/constants';
import ModalConfirm from '../../modal/ModalConfirmDefault';
import moment from 'moment';

const ActivityFileMobile = ({
  file,
  setRefreshRecentFiles,
  getFiles,
  publicPage,
  isOwner,
  getRecentFiles,
}) => {
  const FullName = file?.file.filename_download?.split('.') || [];
  const extension = FullName ? FullName[FullName.length - 1] : '';
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [removeFeedFile, setRemoveFeedFile] = useState(false);
  const [renameModal, setRenameModal] = useState(false);
  const [name, setName] = useState(
    FullName?.slice(0, FullName?.length - 1).join('.')
  );
  const [loading, setLoading] = useState(false);
  const [openLoading, setOpenLoading] = useState(false);

  const [fileUploadedDate, setFileUploadedDate] = useState({});
  const [hoursDifference, setHoursDifference] = useState(0);
  const [contactId, setContactId] = useState('');
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    setFileUploadedDate(new Date(file.file.uploaded_on));
    const clientPortalToken = getClientPortalToken();
    setContactId(clientPortalToken.contact_id);
  }, []);

  useEffect(() => {
    const currentDate = new Date();
    const timeDifferenceInMilliseconds = currentDate - fileUploadedDate;
    const hours = Math.floor(timeDifferenceInMilliseconds / (1000 * 60 * 60));
    setHoursDifference(hours);
  }, [fileUploadedDate]);

  const toggleModal = () => {
    setRemoveFeedFile((prev) => !prev);
  };

  const toggleRename = () => {
    setRenameModal((prev) => !prev);
  };

  const onDownload = () => {
    assetsService
      .downloadFile(file.file.id, file.file.filename_download)
      .catch((_) => {
        setErrorMessage(FILE_DOESNT_EXIST);
      });
  };

  const onOpen = async () => {
    if (!openLoading) {
      setOpenLoading(true);
      await assetsService.openFile(file.file.id).catch((_) => {
        setErrorMessage(FILE_DOESNT_EXIST);
      });
      setOpenLoading(false);
    }
  };

  const rename = async () => {
    setLoading(true);
    const id = await filesService.renameFile(
      file.file.id,
      name + '.' + extension
    );
    id
      ? setSuccessMessage('File is renamed Successfully')
      : setErrorMessage('File is not renames successfully');
    setLoading(false);
    setRefreshRecentFiles(true);
    setRenameModal(false);
  };

  const onDelete = async () => {
    try {
      await filesService.removeFile(file.file.id);
      setOpenModal(false);
      getRecentFiles();
    } catch (err) {
      console.error(err);
      setOpenModal(false);
    }
  };

  const permission = {
    collection: 'activities',
    action: 'edit',
  };

  const fileCreatedBy = file?.createdByContact || file?.file?.uploaded_by_info;

  return (
    <>
      <ModalConfirm
        open={openModal}
        onHandleClose={() => {
          setOpenModal(false);
        }}
        onHandleConfirm={onDelete}
        icon="warning"
        textBody={'Are you sure you want to delete the file?'}
        labelButtonConfirm={'Yes, Delete'}
        iconButtonConfirm=""
        colorButtonConfirm={'outline-danger'}
      />
      <div className="card generic mb-3 is-mobile">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
            <h5
              className="d-flex align-items-center mb-1 text-block"
              onClick={onOpen}
            >
              <FileIcon info={file.file} size="sm" />
              <div className="text">
                <IdfTooltip text={file.file.filename_download}>
                  <span className="text-truncate">
                    {file.file.filename_download}
                  </span>
                </IdfTooltip>
                {openLoading && (
                  <Spinner color="primary" size="sm" className="ml-1" />
                )}
                <p className="mb-0 text-muted">
                  {getFileSize(file.file.filesize)}
                </p>
              </div>
            </h5>
            <div className="action-btns d-flex gap-2 align-items-center justify-content-center">
              {!publicPage && isOwner && (
                <>
                  <DeleteFile
                    confirmOpen={removeFeedFile}
                    setConfirmOpen={setRemoveFeedFile}
                    successMessage={successMessage}
                    setSuccessMessage={setSuccessMessage}
                    errorMessage={errorMessage}
                    setErrorMessage={setErrorMessage}
                    id={file.file_id}
                    setRefreshRecentFiles={setRefreshRecentFiles}
                    getFiles={getFiles}
                    removeFile={removeFile}
                  >
                    <MoreActions
                      items={items}
                      permission={permission}
                      toggleClassName="dropdown-search btn-icon border-0 shadow-none no-shadow"
                      variant="outline-link"
                      onHandleRemove={toggleModal}
                      onHandleDownload={onDownload}
                      onHandleEdit={toggleRename}
                      onHandleOpen={onOpen}
                    />
                  </DeleteFile>
                  <RenameModal
                    open={renameModal}
                    onHandleConfirm={rename}
                    onHandleClose={() => {
                      setRenameModal(false);
                    }}
                    name={name}
                    setName={setName}
                    loading={loading}
                    extension={extension}
                  />
                </>
              )}
              {publicPage && (
                <Fragment>
                  {hoursDifference <= 24 && contactId === file.contact_id ? (
                    <span
                      className="btn btn-light"
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenModal(true);
                      }}
                    >
                      Delete
                    </span>
                  ) : (
                    <span className="btn btn-light opacity0">Delete</span>
                  )}
                  <span
                    className="btn-download inline-block position-relative"
                    onClick={(e) => {
                      e.preventDefault();
                      onDownload();
                    }}
                  >
                    <IdfTooltip text="Download">
                      <MaterialIcon icon="download" filled />
                    </IdfTooltip>
                  </span>
                </Fragment>
              )}
            </div>
          </div>
          <div className="d-flex align-items-center justify-content-between">
            <div className="date-uploaded">
              <p className="text-muted mb-0">Date Uploaded</p>
              {moment(setDateFormat(file.file.uploaded_on)).format(
                'MMMM DD, YYYY'
              )}
            </div>
            <div className="uploaded-by">
              <p className="text-muted mb-0">Uploaded By</p>
              <p className="text-muted mb-0 text-right">
                {fileCreatedBy?.first_name + ' ' + fileCreatedBy?.last_name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ActivityFileMobile;
