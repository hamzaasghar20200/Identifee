import ReportDownloadWrapper from '../reportbuilder/blocks/ReportDownloadWrapper';
import React from 'react';
import useReportHeaderFooter from '../../hooks/useReportHeaderFooter';

const ReportBlockWrapper = ({
  children,
  showLogo,
  current,
  ignoreHeadings,
  pageHeight = 892,
  report,
  selectedTenant,
}) => {
  const { reportFooterImage } = useReportHeaderFooter(selectedTenant);
  return (
    <div
      className="px-0"
      style={{
        height: showLogo ? pageHeight : 'auto',
        background: showLogo ? '#F8F8FA' : '#FFFFFF',
      }}
    >
      {children}
      {showLogo && (
        <>
          <br />
          <ReportDownloadWrapper
            whenPrinting={showLogo}
            containerClass="px-3 d-flex align-items-center position-relative justify-content-between"
            containerPrintClass="px-5 d-flex align-items-center position-relative justify-content-between"
          >
            <div className="d-flex fs-11 text-gray-600 align-items-center">
              <span>Prepared for&nbsp;</span>
              <span>
                {report?.value1 || report?.companyName || report?.name}
              </span>
            </div>
            <div className="d-flex fs-11 text-gray-600 align-items-center gap-2 fs-9">
              {current}
            </div>
            <div className="position-absolute abs-center">
              <img src={reportFooterImage} width={70} />
            </div>
          </ReportDownloadWrapper>
        </>
      )}
    </div>
  );
};
export default ReportBlockWrapper;
