import MaterialIcon from '../commons/MaterialIcon';
import moment from 'moment';
import React from 'react';
import { ReportTypes } from './reports.constants';
import useReportHeaderFooter from '../../hooks/useReportHeaderFooter';

const NaicMidLabel = ({ left, label, value }) => {
  return (
    <div
      className={`position-absolute text-white d-flex align-items-center`}
      style={{ top: '88%', left }}
    >
      <p className={`mb-0 fs-9 font-weight-light text-white`}>{label}:</p>
      <p className={`pl-1 fs-9 font-weight-light text-white mb-0`}>{value}</p>
    </div>
  );
};
const ReportCover = ({
  name,
  date,
  type,
  selectedTenant,
  report,
  organization,
}) => {
  const left = 45;
  const { reportHeaderWhiteLogo } = useReportHeaderFooter(selectedTenant);
  return (
    <div
      className={`rpt-cover ${
        type === ReportTypes.WorkingCapital ? 'working-capital' : ''
      } px-0 text-left position-relative`}
    >
      <img
        src={reportHeaderWhiteLogo}
        className="position-absolute"
        style={{ top: 40, left, width: 150, objectFit: 'contain' }}
      />
      <div
        className={`position-absolute text-white`}
        style={{ top: '35%', left }}
      >
        <p
          className={`font-weight-light mb-2 d-flex align-items-center gap-1 text-white`}
        >
          <MaterialIcon icon="calendar_today" clazz="text-white" />{' '}
          <span className="font-size-sm2 ml-2">
            {moment(date).format('MMMM, YYYY')}
          </span>
        </p>
        <h1
          className={`font-size-3em font-weight-bolder mb-2 text-white`}
          style={{ maxWidth: 350 }}
        >
          {type === ReportTypes.Treasury
            ? 'Treasury Management Report'
            : type === ReportTypes.Merchant
            ? 'Merchant Services Insight Report'
            : 'Working Capital Analysis Report'}
        </h1>
      </div>
      <div
        className={`position-absolute text-white`}
        style={{ top: '80%', left }}
      >
        <p className={`mb-0 fs-9 font-weight-light text-white`}>
          Prepared for:
        </p>
        <h4 className={`font-size-md font-weight-semi-bold text-white`}>
          {name}
        </h4>
      </div>
      {report?.mid && (
        <NaicMidLabel label="MID" value={report?.mid} left={left} />
      )}
    </div>
  );
};

export default ReportCover;
