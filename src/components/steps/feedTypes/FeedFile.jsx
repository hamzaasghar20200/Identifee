import { useState } from 'react';

import FileIcon from '../../fileIcon/FileIcon';
import { getFileSize, setDateFormat } from '../../../utils/Utils';
import assetsService from '../../../services/assets.service';
import MoreActions from '../../MoreActions';
import { items } from '../../../views/Deals/pipelines/Pipeline.constants';
import DeleteFile from '../../peopleProfile/contentFeed/DeleteFile';
import { removeFile } from '../../../utils/removeFile';
import filesService from '../../../services/files.service';
import { FILE_DOESNT_EXIST } from '../../../utils/constants';
import RenameModal from '../../modal/RenameModal';
import { Spinner } from 'reactstrap';

const FeedFile = ({
  data,
  setRefreshRecentFiles,
  isOwner,
  updated_at,
  activityPerantId,
  getNotes,
  wholeLength,
  index,
  fromFiles = false,
  fromClientPortal,
  uploadedBy,
  fromOrganization,
}) => {
  const FullName = data?.filename_download?.split('.') || [];
  const extension = FullName ? FullName[FullName.length - 1] : '';
  const [removeFeedFile, setRemoveFeedFile] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [renameModal, setRenameModal] = useState(false);
  const [name, setName] = useState(
    FullName?.slice(0, FullName?.length - 1).join('.')
  );
  const [loading, setLoading] = useState(false);
  const [openLoading, setOpenLoading] = useState(false);

  const toggleModal = () => {
    setRemoveFeedFile((prev) => !prev);
  };

  const toggleRename = () => {
    setRenameModal((prev) => !prev);
  };

  const onDownload = () => {
    assetsService.downloadFile(data.id, data.filename_download).catch((_) => {
      setErrorMessage(FILE_DOESNT_EXIST);
    });
  };

  const onOpen = async () => {
    if (!openLoading) {
      setOpenLoading(true);
      await assetsService.openFile(data.id).catch((_) => {
        setErrorMessage(FILE_DOESNT_EXIST);
      });
      setOpenLoading(false);
    }
  };

  const rename = async () => {
    setLoading(true);
    const id = await filesService.renameFile(data.id, name + '.' + extension);
    id
      ? setSuccessMessage('File is renamed Successfully')
      : setErrorMessage('File is not renames successfully');
    setLoading(false);
    setRefreshRecentFiles(true);
    if (activityPerantId) {
      getNotes();
    }
    setRenameModal(false);
  };
  return (
    <>
      {fromClientPortal ? (
        <div
          className={`${
            wholeLength % 2 !== 0 && index === wholeLength - 1
              ? 'col-xxl-12 col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12'
              : 'col-xxl-6 col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12'
          }`}
          key={index}
        >
          <div className={`card shadow-none file-attachment`}>
            <div className="card-body d-flex gap-2 align-items-center p-2 justify-content-between">
              <div className="file-info d-flex gap-2 align-items-center">
                <FileIcon
                  info={data}
                  size="sm"
                  customClass={fromFiles ? 'pl-0' : 'pl-lg-0'}
                />
                <div className="text cursor-pointer" onClick={onOpen}>
                  <h5 className="d-flex align-items-center mb-0 text-block cursor-pointer">
                    <div>{data.filename_download}</div>
                    {openLoading && (
                      <Spinner color="primary" size="sm" className="ml-1" />
                    )}
                  </h5>
                  <ul className="list-inline list-separator text-muted font-size-xs">
                    <li className="list-inline-item">
                      {updated_at &&
                        `Updated ${setDateFormat(
                          updated_at,
                          'MMM DD YYYY h:mm A'
                        )}  `}
                      {getFileSize(data.filesize)}
                    </li>
                  </ul>
                </div>
              </div>
              {isOwner && (
                <>
                  <DeleteFile
                    id={data.id}
                    confirmOpen={removeFeedFile}
                    setConfirmOpen={setRemoveFeedFile}
                    successMessage={successMessage}
                    setSuccessMessage={setSuccessMessage}
                    errorMessage={errorMessage}
                    activityPerantId={activityPerantId}
                    getNotes={getNotes}
                    setErrorMessage={setErrorMessage}
                    removeFile={removeFile}
                    setRefreshRecentFiles={setRefreshRecentFiles}
                  >
                    <MoreActions
                      items={[
                        {
                          id: 'open',
                          icon: 'expand',
                          name: 'Open',
                        },
                        {
                          id: 'download',
                          icon: 'download',
                          name: 'Download',
                        },
                        ...items,
                      ]}
                      toggleClassName={`dropdown-search btn-icon border-0 shadow-none no-shadow ${
                        fromFiles ? 'mr-2' : ''
                      }`}
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
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`row align-items-center gx-2 py-2 ${
            index !== wholeLength - 1 && 'border-bottom'
          }`}
        >
          <FileIcon
            info={data}
            size="sm"
            customClass={fromFiles ? 'pl-3' : 'pl-lg-0'}
          />
          <div className="col cursor-pointer" onClick={onOpen}>
            <h5 className="d-flex align-items-center mb-1 text-block cursor-pointer">
              <div>{data.filename_download}</div>
              {openLoading && (
                <Spinner color="primary" size="sm" className="ml-1" />
              )}
            </h5>
            <ul className="list-inline list-separator text-muted font-size-xs">
              <li className="list-inline-item">
                {fromOrganization ? (
                  uploadedBy.organization && uploadedBy.contact_id === null ? (
                    <>
                      {uploadedBy.organization.name}
                      <span className="text-muted mx-2">•</span>
                    </>
                  ) : (
                    <>
                      {uploadedBy.contact.first_name}{' '}
                      {uploadedBy.contact.last_name}
                      <span className="text-muted mx-2">•</span>
                    </>
                  )
                ) : (
                  ''
                )}

                {updated_at &&
                  `Updated ${setDateFormat(
                    updated_at,
                    'MMM DD YYYY h:mm A'
                  )}  `}
                {getFileSize(data.filesize)}
              </li>
            </ul>
          </div>
          {isOwner && (
            <>
              <DeleteFile
                id={data.id}
                confirmOpen={removeFeedFile}
                setConfirmOpen={setRemoveFeedFile}
                successMessage={successMessage}
                setSuccessMessage={setSuccessMessage}
                errorMessage={errorMessage}
                activityPerantId={activityPerantId}
                getNotes={getNotes}
                setErrorMessage={setErrorMessage}
                removeFile={removeFile}
                setRefreshRecentFiles={setRefreshRecentFiles}
              >
                <MoreActions
                  items={[
                    {
                      id: 'open',
                      icon: 'expand',
                      name: 'Open',
                    },
                    {
                      id: 'download',
                      icon: 'download',
                      name: 'Download',
                    },
                    ...items,
                  ]}
                  toggleClassName={`dropdown-search btn-icon border-0 shadow-none no-shadow ${
                    fromFiles ? 'mr-2' : ''
                  }`}
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
        </div>
      )}
    </>
  );
};

FeedFile.defaultProps = {
  data: {},
};

export default FeedFile;
