import { useState } from 'react';

import FileIcon from '../../fileIcon/FileIcon';
import { setDateFormat, getFileSize } from '../../../utils/Utils';
import { removeFile } from '../../../utils/removeFile';
import DeleteFile from './DeleteFile';
import MoreActions from '../../MoreActions';
import { items } from '../../../views/Deals/pipelines/Pipeline.constants';
import assetsService from '../../../services/assets.service';
import filesService from '../../../services/files.service';
import { FILE_DOESNT_EXIST } from '../../../utils/constants';
import RenameModal from '../../modal/RenameModal';
import IdfTooltip from '../../idfComponents/idfTooltip';
import MaterialIcon from '../../commons/MaterialIcon';
import { Spinner } from 'reactstrap';

const ActivityFile = ({
  file,
  isModal,
  setRefreshRecentFiles,
  getFiles,
  publicPage,
  isOwner,
  fromOrganization,
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
  const permission = {
    collection: 'activities',
    action: 'edit',
  };
  return (
    <>
      <li className={`list-group-item`}>
        <div className="row align-items-center gx-2">
          <FileIcon info={file.file} size="sm" />

          <div className="col cursor-pointer" onClick={onOpen}>
            <h5 className="d-flex align-items-center mb-1 text-block cursor-pointer">
              <div>
                {file.file.filename_download}
                {openLoading && (
                  <Spinner color="primary" size="sm" className="ml-1" />
                )}
              </div>
            </h5>
            <ul className="list-inline list-separator text-muted font-size-xs">
              <li className="list-inline-item">
                {fromOrganization ? (
                  file.organization && file.contact_id === null ? (
                    <>
                      {file.organization.name}
                      <span className="text-muted mx-2">•</span>
                    </>
                  ) : (
                    <>
                      {file.contact.first_name} {file.contact.last_name}
                      <span className="text-muted mx-2">•</span>
                    </>
                  )
                ) : (
                  ''
                )}
                Updated {setDateFormat(file.file.uploaded_on)}
              </li>
              <li className="list-inline-item">
                {getFileSize(file.file.filesize)}
              </li>
            </ul>
          </div>
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
            <a
              href=""
              style={{ right: 15 }}
              className="icon-hover-bg position-relative"
              onClick={(e) => {
                e.preventDefault();
                onDownload();
              }}
            >
              <IdfTooltip text="Download">
                <MaterialIcon icon="download" />{' '}
              </IdfTooltip>
            </a>
          )}
        </div>
      </li>
    </>
  );
};

export default ActivityFile;
