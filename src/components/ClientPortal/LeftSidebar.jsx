import React, { Fragment, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import './style.css';
import './responsive.css';
import Avatar from '../Avatar';
import MaterialIcon from '../commons/MaterialIcon';
import ButtonIcon from '../commons/ButtonIcon';
import BrandLogoIcon from '../sidebar/BrandLogoIcon';
import ModalScheduleCall from './modals/ModalScheduleCall';
import ModalScheduleCallForm from './modals/ModalScheduleCallForm';
import ModalTeamBank from './modals/ModalTeamBank';
import ModalSuccessMsg from './modals/ModalSuccessMsg';
import { useTenantContext } from '../../contexts/TenantContext';
import IdfTooltip from '../idfComponents/idfTooltip';
import authService from '../../services/auth.service';

const LeftSidebar = ({ owner }) => {
  const active = document.URL.split('/').at(-1);
  const history = useHistory();
  const [modalRequestCall, setModalRequestCall] = useState(false);
  const [modalTeamBank, setModalTeamBank] = useState(false);
  const [modalRequestCallForm, setModalRequestCallForm] = useState(false);
  const [modalSuccessMsg, setModalSuccessMsg] = useState(false);
  const { tenant } = useTenantContext();

  const showModalRequestCallForm = () => {
    setModalRequestCallForm(true);
    setModalRequestCall(false);
  };
  const showModalTeamBank = () => {
    setModalTeamBank(true);
    setModalRequestCall(false);
  };

  const showModalSuccessMessage = () => {
    setModalSuccessMsg(true);
    setModalRequestCallForm(false);
  };

  const closeModal = () => {
    setModalSuccessMsg(false);
    setModalRequestCall(false);
    setModalRequestCallForm(false);
  };

  const logout = () => {
    authService.logout();
    history.push('/clientportal/login');
  };

  return (
    <Fragment>
      <div className="left_sidebar_container d-flex flex-column">
        <div className="logo">
          <BrandLogoIcon tenant={tenant} />
        </div>
        <div className="navigation my-5">
          <ul className="nav flex-column">
            <li className="nav-item rounded">
              <Link
                className={`nav-link d-flex align-items-center ${
                  active === 'dashboard' || document.URL.includes('token')
                    ? 'active'
                    : ''
                }`}
                aria-current="page"
                to="/clientportal/dashboard"
              >
                <MaterialIcon icon="home" filled clazz={'mr-2'} /> Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link d-flex align-items-center ${
                  active === 'conversations' ? 'active' : ''
                }`}
                aria-current="page"
                to="/clientportal/dashboard/conversations"
              >
                <MaterialIcon icon="chat" filled clazz={'mr-2'} /> Conversations
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link d-flex align-items-center ${
                  active === 'videos' ? 'active' : ''
                }`}
                aria-current="page"
                to="/clientportal/dashboard/videos"
              >
                <MaterialIcon icon="subscriptions" filled clazz={'mr-2'} />
                Videos
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link d-flex align-items-center ${
                  active === 'files' ? 'active' : ''
                }`}
                aria-current="page"
                to="/clientportal/dashboard/files"
              >
                <MaterialIcon icon="folder" filled clazz={'mr-2'} /> Files
              </Link>
            </li>
          </ul>
        </div>
        <div className="bank-rep">
          <h6 className="text-muted text-uppercase pl-3">Your bank rep</h6>
          <div
            className="card rep-inner cursor-pointer"
            onClick={() => setModalRequestCall(true)}
          >
            <div className="card-body shadow-none d-flex gap-2 align-items-center justify-space-between p-2">
              <Avatar user={owner} />
              <div className="text">
                <IdfTooltip text={owner?.name}>
                  <h5 className="mb-0 text-truncate text-capitalize">
                    {owner?.name}
                  </h5>
                </IdfTooltip>
                <IdfTooltip text={owner?.title}>
                  <p className="text-muted font-size-sm2 mb-0 text-truncate">
                    {owner?.title}
                  </p>
                </IdfTooltip>
              </div>
              <MaterialIcon icon="chevron_right" clazz="font-size-3xl right" />
            </div>
          </div>
          <Fragment>
            <ModalScheduleCall
              show={modalRequestCall}
              data={owner}
              onModalOpen={showModalRequestCallForm}
              onModalModalTeamBank={showModalTeamBank}
              onHide={() => setModalRequestCall(false)}
            />
            <ModalTeamBank
              show={modalTeamBank}
              onHide={() => setModalTeamBank(false)}
            />
            <ModalScheduleCallForm
              show={modalRequestCallForm}
              data={owner}
              onModalSuccessMsg={showModalSuccessMessage}
              onHide={() => setModalRequestCallForm(false)}
            />
            <ModalSuccessMsg
              closeModal={closeModal}
              show={modalSuccessMsg}
              onHide={() => setModalSuccessMsg(false)}
            />
          </Fragment>
        </div>
        <div className="btn-logout p-2">
          <ButtonIcon
            icon="logout"
            color="light"
            classnames="w-100 text-left text-danger border-none shadow-none"
            label="Logout"
            onClick={(e) => {
              e.preventDefault();
              logout();
            }}
          />
        </div>
      </div>
    </Fragment>
  );
};

export default LeftSidebar;
