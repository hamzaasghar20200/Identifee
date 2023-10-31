import React from 'react';
import { NotificationsList } from '../components/Notifcations/allNotifications';
import { Card, CardBody, CardHeader } from 'reactstrap';

const NotificationsAll = () => {
  return (
    <>
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <Card className="p-0">
            <CardHeader>
              <h4 className="card-title">All Notifications</h4>
            </CardHeader>
            <CardBody className="p-0">
              <NotificationsList
                showSelectComponentModal={true}
                detail={true}
                notificationsLimit={10}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
};

export default NotificationsAll;
