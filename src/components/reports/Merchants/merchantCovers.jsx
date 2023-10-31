import React, { useContext } from 'react';
import BrandLogoIcon from '../../sidebar/BrandLogoIcon';
import { TenantContext } from '../../../contexts/TenantContext';
import MaterialIcon from '../../commons/MaterialIcon';
import moment from 'moment';

export const MerchantCover = ({ report, organization, startDownload }) => {
  const { tenant } = useContext(TenantContext);
  return (
    <>
      <div
        className={`p-3 fw-bold card-image d-flex align-items-start justify-content-between flex-column ${
          startDownload ? 'p-0 px-0 rounded-0' : ''
        }`}
        style={{
          backgroundImage: `url('/img/engagement.svg')`,
          minHeight: '500px',
        }}
      >
        <div>
          <BrandLogoIcon tenant={tenant} />
        </div>
        <div className="px-4 text-left text-light">
          <span className="text-left">
            <MaterialIcon icon="calendar_month" />{' '}
            {moment(report?.date).format('DD/MM/YYYY')}
          </span>
          <h1 className="merchant-cover-heading">
            Simple Merchant Customer Report
          </h1>
        </div>
        <div className="px-4 text-left">
          <p className="px-0 mb-0">{organization?.name}</p>
          <p className="mb-0">{organization?.phone_office}</p>
        </div>
      </div>
    </>
  );
};
