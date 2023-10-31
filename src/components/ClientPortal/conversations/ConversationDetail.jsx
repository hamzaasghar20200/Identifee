import React, { Fragment } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import ButtonIcon from '../../commons/ButtonIcon';
import MaterialIcon from '../../commons/MaterialIcon';

const ConversationDetail = ({ hideConvDetail }) => {
  return (
    <Fragment>
      <div className="page-title pt-3 p-3 d-flex justify-content-between align-items-center">
        <h1 className="d-flex justify-content-between align-items-center gap-2">
          <ButtonIcon
            icon="chevron_left"
            iconClass="font-size-2xl text-blue"
            color="light "
            classnames="d-flex align-items-center rounded-3"
            label=""
            onClick={hideConvDetail}
          />
          Consultation Session
          <MaterialIcon icon="edit" filled clazz="font-size-2xl text-primary" />
        </h1>
        <div className="top-right d-flex justify-content-between align-items-center gap-3">
          <img
            className="img-fluid"
            src="/img/clint-portal/conv-img-1.png"
            alt=""
          />
          <div className="team-members">
            <ul className="mb-0">
              <li>
                <img
                  className="img-fluid"
                  src="/img/clint-portal/conv-img-2.png"
                  alt=""
                />
              </li>
              <li>
                <img
                  className="img-fluid"
                  src="/img/clint-portal/conv-img-2.png"
                  alt=""
                />
              </li>
            </ul>
          </div>
          <ButtonIcon
            icon="reply"
            iconClass="font-size-xl"
            color="primary "
            classnames="d-flex align-items-center gap-2 rounded-3 font-size-lg"
            label="Reply"
          />
        </div>
      </div>
      <div className="conversation-detail p-3 vh-100">
        <div className="row justify-content-center vh-100">
          <div className="col-xxl-8 col-xl-8 col-lg-12 col-md-12 col-sm-12 col-xs-12 vh-100 position-relative">
            <div className="card chat-msg mb-3">
              <div className="card-body">
                <div className="top-area mb-3 d-flex justify-content-between align-items-center">
                  <div className="left d-flex justify-content-between align-items-center gap-3">
                    <figure>
                      <img
                        className="img-fluid"
                        src="/img/clint-portal/user-con.png"
                        alt=""
                      />
                    </figure>
                    <div className="text">
                      <h5 className="d-flex align-items-center gap-2 mb-0">
                        Derek Johnson
                        <span className="badge bg-success">Bank</span>
                      </h5>
                      <p className="mb-0">Yesterday</p>
                    </div>
                  </div>
                  <div className="top-right">
                    <MaterialIcon
                      icon="more_horiz"
                      filled
                      clazz="font-size-2xl text-muted cursor-pointer"
                    />
                  </div>
                </div>
                <div className="bottom-area">
                  <p>
                    Hi there! Have you had any experience with online banking?
                  </p>
                </div>
                <div className="row g-2">
                  <div className="col-xxl-6 col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
                    <div className="card shadow-none file-attachment">
                      <div className="card-body d-flex gap-2 align-items-center p-2 justify-content-between">
                        <div className="file-info d-flex gap-2 align-items-center">
                          <MaterialIcon
                            icon="task"
                            clazz="font-size-3xl text-success"
                          />
                          <div className="text">
                            <h5 className="mb-0">21_05_Report.xls</h5>
                            <p className="mb-0">200 KB</p>
                          </div>
                        </div>
                        <span className="btn-download">
                          <MaterialIcon icon="download" filled />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-xxl-6 col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
                    <div className="card shadow-none file-attachment">
                      <div className="card-body d-flex gap-2 align-items-center p-2 justify-content-between">
                        <div className="file-info d-flex gap-2 align-items-center">
                          <MaterialIcon
                            icon="task"
                            clazz="font-size-3xl text-primary"
                          />
                          <div className="text">
                            <h5 className="mb-0">21_05_Report.xls</h5>
                            <p className="mb-0">200 KB</p>
                          </div>
                        </div>
                        <span className="btn-download">
                          <MaterialIcon icon="download" filled />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card chat-msg mb-3">
              <div className="card-body">
                <div className="top-area mb-3 d-flex justify-content-between align-items-center">
                  <div className="left d-flex justify-content-between align-items-center gap-3">
                    <figure>
                      <img
                        className="img-fluid"
                        src="/img/clint-portal/user-avatar.png"
                        alt=""
                      />
                    </figure>
                    <div className="text">
                      <h5 className="d-flex align-items-center gap-2 mb-0">
                        you
                        <span className="badge bg-success">Bank</span>
                      </h5>
                      <p className="mb-0">5h ago</p>
                    </div>
                  </div>
                  <div className="top-right">
                    <MaterialIcon
                      icon="more_horiz"
                      filled
                      clazz="font-size-2xl text-muted cursor-pointer"
                    />
                  </div>
                </div>
                <div className="bottom-area">
                  <p>
                    Absolutely! I find it incredibly convenient. I can manage my
                    finances from anywhere and avoid long queues at the bank.
                    How about you?
                  </p>
                </div>
              </div>
            </div>
            <div className="card chat-msg mb-3">
              <div className="card-body">
                <div className="top-area mb-3 d-flex justify-content-between align-items-center">
                  <div className="left d-flex justify-content-between align-items-center gap-3">
                    <figure>
                      <img
                        className="img-fluid"
                        src="/img/clint-portal/user-con.png"
                        alt=""
                      />
                    </figure>
                    <div className="text">
                      <h5 className="d-flex align-items-center gap-2 mb-0">
                        Derek Johnson
                        <span className="badge bg-success">Bank</span>
                      </h5>
                      <p className="mb-0">1h ago</p>
                    </div>
                  </div>
                  <div className="top-right">
                    <MaterialIcon
                      icon="more_horiz"
                      filled
                      clazz="font-size-2xl text-muted cursor-pointer"
                    />
                  </div>
                </div>
                <div className="bottom-area">
                  <p>
                    I&apos;ve been a bit hesitant to try it. Is it really
                    secure?
                  </p>
                </div>
                <div className="row g-2">
                  <div className="col-xxl-12 col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
                    <div className="card shadow-none file-attachment">
                      <div className="card-body d-flex gap-2 align-items-center p-2 justify-content-between">
                        <div className="file-info d-flex gap-2 align-items-center">
                          <MaterialIcon
                            icon="task"
                            clazz="font-size-3xl text-danger"
                          />
                          <div className="text">
                            <h5 className="mb-0">Document.pdf</h5>
                            <p className="mb-0">4 MB</p>
                          </div>
                        </div>
                        <span className="btn-download">
                          <MaterialIcon icon="download" filled />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card chat-msg input-area">
              <div className="card-body">
                <input
                  type="text"
                  placeholder="Type a Message..."
                  className="border-0 w-100"
                />
                <div className="input-controls mt-4 d-flex justify-content-between align-items-center">
                  <FileUploader
                    name="muxfiles"
                    classes={'mux-drop-area mt-2 file-uploader'}
                    multiple={true}
                  >
                    <ButtonIcon
                      icon="attach_file"
                      iconClass="font-size-2xl text-black"
                      color="light "
                      classnames="d-flex align-items-center rounded-3"
                      label=""
                    />
                  </FileUploader>
                  <ButtonIcon
                    icon="send"
                    iconClass="font-size-xl"
                    color="primary "
                    classnames="d-flex align-items-center gap-2 rounded-3 font-size-lg"
                    label="Send"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default ConversationDetail;
