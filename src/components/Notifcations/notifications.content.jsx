import React from 'react';

import { Card } from 'react-bootstrap';
import NotificationForm from '../notification/NotificationForm';
import ButtonIcon from '../commons/ButtonIcon';

export const ManageNotifications = ({ goBack }) => {
  return (
    <>
      <ButtonIcon
        icon="west"
        label="Back to Notifications"
        classnames="btn-sm m-2 d-inline-block"
        color="white"
        onclick={goBack}
      />
      <Card className="rounded-0 mb-0 border-0">
        <NotificationForm fromNavbar={true} />
      </Card>
    </>
  );
};
