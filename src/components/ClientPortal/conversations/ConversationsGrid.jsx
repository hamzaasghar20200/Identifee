import React, { Fragment } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import ButtonIcon from '../../commons/ButtonIcon';
import MaterialIcon from '../../commons/MaterialIcon';

const ConversationsGrid = ({ showConvDetail }) => {
  return (
    <Fragment>
      <div className="page-title pt-3 p-3 d-flex justify-content-between align-items-center">
        <h1>Conversations</h1>
        <ButtonIcon
          icon="add_circle"
          iconClass="font-size-2xl"
          color="primary "
          classnames="d-flex align-items-center gap-2 rounded-3 font-size-lg"
          label="New Conversation"
        />
      </div>
      <div className="conversation-grid p-3">
        <div className="row g-3">
          <div className="col-xxl-4 col-xl-4 col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <div className="card conv-grid rounded-3">
              <div className="card-body">
                <div className="top-area mb-5 d-flex justify-content-between align-items-center">
                  <div className="left">
                    <span className="icon-box" onClick={showConvDetail}>
                      <MaterialIcon icon="chat" filled clazz="font-size-2xl" />
                    </span>
                  </div>
                  <div className="top-right d-flex justify-content-between align-items-center gap-2">
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
                          <span className="team-count">+2</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bottom-area d-flex justify-content-between align-items-center">
                  <div className="left">
                    <h4 className="mb-0">Discuss September Report</h4>
                    <p className="text-muted mb-0">May 16, 2023</p>
                  </div>
                  <div className="right more-actions cursor-pointer">
                    <Dropdown>
                      <Dropdown.Toggle variant="default" id="dropdown-basic">
                        <MaterialIcon icon="more_vert" clazz="font-size-2xl" />
                      </Dropdown.Toggle>

                      <Dropdown.Menu drop={'centered'}>
                        <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                        <Dropdown.Item href="#/action-2">
                          Another action
                        </Dropdown.Item>
                        <Dropdown.Item href="#/action-3">
                          Something else
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xxl-4 col-xl-4 col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <div className="card conv-grid rounded-3">
              <div className="card-body">
                <div className="top-area mb-5 d-flex justify-content-between align-items-center">
                  <div className="left">
                    <span className="icon-box" onClick={showConvDetail}>
                      <MaterialIcon icon="chat" filled clazz="font-size-2xl" />
                    </span>
                  </div>
                  <div className="top-right d-flex justify-content-between align-items-center gap-2">
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
                  </div>
                </div>
                <div className="bottom-area d-flex justify-content-between align-items-center">
                  <div className="left">
                    <h4 className="mb-0">Video edit feedback</h4>
                    <p className="text-muted mb-0">10 May 2023</p>
                  </div>
                  <div className="right more-actions cursor-pointer">
                    <Dropdown>
                      <Dropdown.Toggle variant="default" id="dropdown-basic">
                        <MaterialIcon icon="more_vert" clazz="font-size-2xl" />
                      </Dropdown.Toggle>

                      <Dropdown.Menu drop={'centered'}>
                        <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                        <Dropdown.Item href="#/action-2">
                          Another action
                        </Dropdown.Item>
                        <Dropdown.Item href="#/action-3">
                          Something else
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xxl-4 col-xl-4 col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <div className="card conv-grid rounded-3">
              <div className="card-body">
                <div className="top-area mb-5 d-flex justify-content-between align-items-center">
                  <div className="left">
                    <span className="icon-box" onClick={showConvDetail}>
                      <MaterialIcon icon="chat" filled clazz="font-size-2xl" />
                    </span>
                  </div>
                  <div className="top-right d-flex justify-content-between align-items-center gap-2">
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
                  </div>
                </div>
                <div className="bottom-area d-flex justify-content-between align-items-center">
                  <div className="left">
                    <h4 className="mb-0">Consultation Session</h4>
                    <p className="text-muted mb-0">3 May 2023</p>
                  </div>
                  <div className="right more-actions cursor-pointer">
                    <Dropdown>
                      <Dropdown.Toggle variant="default" id="dropdown-basic">
                        <MaterialIcon icon="more_vert" clazz="font-size-2xl" />
                      </Dropdown.Toggle>

                      <Dropdown.Menu drop={'centered'}>
                        <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                        <Dropdown.Item href="#/action-2">
                          Another action
                        </Dropdown.Item>
                        <Dropdown.Item href="#/action-3">
                          Something else
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xxl-4 col-xl-4 col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <div className="card conv-grid rounded-3">
              <div className="card-body">
                <div className="top-area mb-5 d-flex justify-content-between align-items-center">
                  <div className="left">
                    <span className="icon-box" onClick={showConvDetail}>
                      <MaterialIcon icon="chat" filled clazz="font-size-2xl" />
                    </span>
                  </div>
                  <div className="top-right d-flex justify-content-between align-items-center gap-2">
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
                  </div>
                </div>
                <div className="bottom-area d-flex justify-content-between align-items-center">
                  <div className="left">
                    <h4 className="mb-0">Finance report 2023</h4>
                    <p className="text-muted mb-0">10 May 2023</p>
                  </div>
                  <div className="right more-actions cursor-pointer">
                    <Dropdown>
                      <Dropdown.Toggle variant="default" id="dropdown-basic">
                        <MaterialIcon icon="more_vert" clazz="font-size-2xl" />
                      </Dropdown.Toggle>

                      <Dropdown.Menu drop={'centered'}>
                        <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                        <Dropdown.Item href="#/action-2">
                          Another action
                        </Dropdown.Item>
                        <Dropdown.Item href="#/action-3">
                          Something else
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xxl-4 col-xl-4 col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <div className="card conv-grid rounded-3">
              <div className="card-body">
                <div className="top-area mb-5 d-flex justify-content-between align-items-center">
                  <div className="left">
                    <span className="icon-box" onClick={showConvDetail}>
                      <MaterialIcon icon="chat" filled clazz="font-size-2xl" />
                    </span>
                  </div>
                  <div className="top-right d-flex justify-content-between align-items-center gap-2">
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
                  </div>
                </div>
                <div className="bottom-area d-flex justify-content-between align-items-center">
                  <div className="left">
                    <h4 className="mb-0">Consultation Session</h4>
                    <p className="text-muted mb-0">10 May 2023</p>
                  </div>
                  <div className="right more-actions cursor-pointer">
                    <Dropdown>
                      <Dropdown.Toggle variant="default" id="dropdown-basic">
                        <MaterialIcon icon="more_vert" clazz="font-size-2xl" />
                      </Dropdown.Toggle>

                      <Dropdown.Menu drop={'centered'}>
                        <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                        <Dropdown.Item href="#/action-2">
                          Another action
                        </Dropdown.Item>
                        <Dropdown.Item href="#/action-3">
                          Something else
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xxl-4 col-xl-4 col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <div className="card conv-grid rounded-3">
              <div className="card-body">
                <div className="top-area mb-5 d-flex justify-content-between align-items-center">
                  <div className="left">
                    <span className="icon-box" onClick={showConvDetail}>
                      <MaterialIcon icon="chat" filled clazz="font-size-2xl" />
                    </span>
                  </div>
                  <div className="top-right d-flex justify-content-between align-items-center gap-2">
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
                  </div>
                </div>
                <div className="bottom-area d-flex justify-content-between align-items-center">
                  <div className="left">
                    <h4 className="mb-0">Discuss September Report</h4>
                    <p className="text-muted mb-0">May 16, 2023</p>
                  </div>
                  <div className="right more-actions cursor-pointer">
                    <Dropdown>
                      <Dropdown.Toggle variant="default" id="dropdown-basic">
                        <MaterialIcon icon="more_vert" clazz="font-size-2xl" />
                      </Dropdown.Toggle>

                      <Dropdown.Menu drop={'centered'}>
                        <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                        <Dropdown.Item href="#/action-2">
                          Another action
                        </Dropdown.Item>
                        <Dropdown.Item href="#/action-3">
                          Something else
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default ConversationsGrid;
