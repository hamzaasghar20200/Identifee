import moment from 'moment/moment';
import React from 'react';

const ReportDropdownItem = ({ item, name }) => {
  return (
    <div className="d-flex flex-column align-items-start">
      <h6 className="mb-0">{item?.value1 || item?.companyName || name}</h6>
      <p className="text-muted fs-8 mb-0">
        {moment(item?.value2 || item?.reportDate).format('MMMM, YYYY')}
      </p>
    </div>
  );
};

export default ReportDropdownItem;
