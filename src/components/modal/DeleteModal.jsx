import React, { useState } from 'react';
import { Spinner, Modal, ModalBody, ModalFooter } from 'reactstrap';

const DeleteModal = ({
  showModal,
  setShowModal,
  selectedData,
  setSelectedData,
  event,
  data,
  results,
  setResults,
  showReport,
  setShowReport,
  modified,
  setModified,
  setSelectAll,
  constants,
  type,
  resetSeletedData = true,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const onHandleCloseModal = () => {
    setShowModal(false);
    showReport && setShowReport(false);
    results.length > 0 && setResults([]);
    resetSeletedData && setSelectedData([]);
    modified ? setModified(false) : setModified(true);
    setSelectAll(false);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    await event();
    setIsLoading(false);
  };

  const ConfirmationTitle = () => {
    return (
      <div className={`col text-center mb-3 px-0`}>
        <i className={`material-icons-outlined confirmation-icon`}>
          {`report_problem`}
        </i>
        <h4 className="text-left">{constants.confirm}</h4>
      </div>
    );
  };

  const validateBothReport = () => {
    const success = results?.find((x) => x.result === constants.success);
    const failed = results?.find((x) => x.result === constants.failed);
    if (success && failed) {
      return true;
    } else return false;
  };

  const bothReport = validateBothReport();
  const successReport = results?.find((x) => x.result === constants.success);
  const failedReport = results?.find((x) => x.result === constants.failed);

  return (
    <Modal isOpen={showModal} fade={false} className={`delete-role-modal`}>
      <ModalBody>
        {showReport
          ? results?.length > 0 && (
              <>
                <div className={`col px-0 text-center`}>
                  <i
                    className={`material-icons-outlined font-size-5em ${
                      bothReport
                        ? `text-warning`
                        : `${successReport ? `text-success` : ``}${
                            failedReport ? `text-danger` : ``
                          }`
                    }`}
                  >
                    {bothReport
                      ? `warning_amber`
                      : `${successReport ? `check_circle` : ``}${
                          failedReport ? `cancel` : ``
                        }`}
                  </i>
                  <hr />
                  <h4 className="text-left">
                    {bothReport
                      ? constants.warning
                      : `${successReport ? constants.hasBeenDeleted : ``}${
                          failedReport ? constants.notRemoved : ``
                        }`}
                  </h4>
                </div>
                <ul className={`list-disc`}>
                  {data &&
                    results?.map((item) => {
                      const success = item.result === constants.success;
                      let description;

                      if (type === 'contacts') {
                        const firstName =
                          data?.find((o) => o.id === item.id).first_name || '';
                        const lastName =
                          data?.find((o) => o.id === item.id).last_name || '';
                        const name = `${firstName} ${lastName}`;
                        const title =
                          data?.find((o) => o.id === item.id).title || null;
                        description = `${name}${title ? ` - ${title}` : ''} `;
                      } else if (type === 'organizations') {
                        description =
                          data?.find((o) => o.id === item.id).name || '';
                      } else if (type === 'groups') {
                        description =
                          data?.find((o) => o.id === item.id).name || '';
                      } else if (type === 'owners') {
                        const firstName =
                          data?.find((o) => o.id === item.id).first_name || '';
                        const lastName =
                          data?.find((o) => o.id === item.id).last_name || '';
                        description = `${firstName} ${lastName}`;
                      }

                      return (
                        <li
                          className="font-weight-medium ml-4"
                          key={`delete-result-${item.id}`}
                        >
                          <p className="mb-0">{description}</p>
                          {item.msg.split(',')?.map((msg) => (
                            <div key={msg} className="my-1">
                              <p className="d-flex align-items-center gap-1 mb-0">
                                <i
                                  className={`material-icons-outlined ${
                                    success ? `text-success` : `text-danger`
                                  }`}
                                >
                                  {`${success ? `check_circle` : `cancel`}`}
                                </i>

                                {success ? (
                                  <span className={`text-success fs-7`}>
                                    {constants.deleted}
                                  </span>
                                ) : (
                                  <span className={`text-danger fs-7`}>
                                    {msg}
                                  </span>
                                )}
                              </p>
                            </div>
                          ))}
                        </li>
                      );
                    })}
                </ul>
              </>
            )
          : selectedData.length > 0 && (
              <>
                <ConfirmationTitle />
                <hr />
                <p className="mb-2">{constants.aboutToDelete}</p>
                <ul className="list-disc">
                  {data &&
                    selectedData?.map((id) => {
                      let description;

                      if (type === 'contacts') {
                        const firstName =
                          data?.find((o) => o.id === id).first_name || '';
                        const lastName =
                          data?.find((o) => o.id === id).last_name || '';
                        const name = `${firstName} ${lastName}`;
                        const title =
                          data?.find((o) => o.id === id).title || null;
                        description = `${name}${title ? ` - ${title}` : ''} `;
                      } else if (type === 'organizations') {
                        description = data?.find((o) => o.id === id).name || '';
                      } else if (type === 'groups') {
                        description = data?.find((o) => o.id === id).name || '';
                      } else if (type === 'task') {
                        description = data?.find((o) => o.id === id).name || '';
                      } else if (type === 'owners') {
                        const firstName =
                          data?.find((o) => o.id === id).first_name || '';
                        const lastName =
                          data?.find((o) => o.id === id).last_name || '';
                        description = `${firstName} ${lastName}`;
                      }

                      return (
                        <li
                          className="font-weight-medium ml-4"
                          key={`to-delete-${id}`}
                        >
                          <p className="mb-1">{description}</p>
                        </li>
                      );
                    })}
                </ul>
              </>
            )}
      </ModalBody>
      <ModalFooter className="flex-nowrap">
        {showReport && results.length > 0 ? (
          <>
            <button
              className="btn btn-sm btn-block btn-primary"
              data-dismiss="modal"
              onClick={onHandleCloseModal}
            >
              {constants.doneButton}
            </button>
          </>
        ) : (
          <>
            {selectedData.length > 0 && (
              <>
                <button
                  type="button"
                  className="btn btn-sm w-50 btn-outline-danger"
                  onClick={handleSubmit}
                >
                  {isLoading ? (
                    <Spinner className="spinner-grow-xs" />
                  ) : (
                    <span>
                      <i className="material-icons-outlined">delete</i>
                      {constants.yesDelete}
                    </span>
                  )}
                </button>
                <button
                  className="btn btn-sm w-50 btn-primary"
                  data-dismiss="modal"
                  onClick={onHandleCloseModal}
                >
                  {constants.noCancel}
                </button>
              </>
            )}
          </>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default DeleteModal;
