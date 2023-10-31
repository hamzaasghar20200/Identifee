import React, { useState } from 'react';
import Avatar from '../Avatar';
import BankTeam from './BankTeam';
import ScheduleCall from './ScheduleCall';
import './style.css';
import { useTenantContext } from '../../contexts/TenantContext';
import BrandLogoIcon from '../sidebar/BrandLogoIcon';
import MaterialIcon from '../commons/MaterialIcon';
import IdfTooltip from '../idfComponents/idfTooltip';
import ButtonIcon from '../commons/ButtonIcon';

const LeftSidebar = ({ contactId, organizationId, owner }) => {
  const [openBankTeam, setOpenBankTeam] = useState(false);
  const [openScheduleCall, setOpenScheduleCall] = useState(false);
  const { tenant } = useTenantContext();

  const buttonClick = (callbackFunction) => {
    callbackFunction((prev) => !prev);
  };

  return (
    <>
      <div className="left_sidebar_container d-flex flex-column align-items-center">
        <div className="logo d-flex justify-content-center my-3">
          <BrandLogoIcon tenant={tenant} />
        </div>

        <h6>YOUR BANK REP</h6>
        <div className="profile-pic my-3">
          <Avatar
            user={owner}
            classModifiers="avatar-xl"
            sizeIcon="font-size-3xl profile-icon"
          />
        </div>
        <h3>
          {owner?.name}
          <IdfTooltip text={owner?.email}>
            <MaterialIcon icon="info" clazz="ml-2" />
          </IdfTooltip>
        </h3>
        <span className="d-block text-gray-200 font-size-sm">
          {owner?.title}
        </span>

        <ScheduleCall
          open={openScheduleCall}
          setOpenScheduleCall={setOpenScheduleCall}
          data={owner}
          organizationId={organizationId}
          contactId={contactId}
        >
          <ButtonIcon
            icon="call"
            classnames="btn-sm mt-2 btn-block"
            label="Request a Call"
            color="outline-primary"
            onclick={() => buttonClick(setOpenScheduleCall)}
          />
        </ScheduleCall>

        <BankTeam
          open={openBankTeam}
          setOpenBankTeam={setOpenBankTeam}
          organizationId={organizationId}
        >
          <ButtonIcon
            icon="group"
            classnames="btn-sm mt-2 btn-block"
            label="Your Bank Team"
            color="outline-primary"
            onclick={() => buttonClick(setOpenBankTeam)}
          />
        </BankTeam>
      </div>
    </>
  );
};

export default LeftSidebar;
