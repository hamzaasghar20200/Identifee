import React from 'react';
import AddFile from '../peopleProfile/contentFeed/AddFile';
import { Card, CardBody, CardHeader } from 'reactstrap';

const RightSidebar = ({ contactId, organizationId }) => {
  return (
    <div className="col-lg-5 pl-0">
      <Card className="shadow">
        <CardHeader>
          <h4 className="mb-0">
            <span className="material-icons-outlined">attach_file</span>
            Files
          </h4>
        </CardHeader>
        <CardBody className="p-2">
          <AddFile
            contactId={contactId}
            organizationId={organizationId}
            publicPage={true}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default RightSidebar;
