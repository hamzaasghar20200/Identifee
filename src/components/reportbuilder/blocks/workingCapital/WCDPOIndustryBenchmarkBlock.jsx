import IconHeadingBlock from '../IconHeadingBlock';
import ReportDownloadWrapper from '../ReportDownloadWrapper';
import { Card, CardBody } from 'reactstrap';
import React from 'react';
import ReportBarChart from '../../../reports/ReportBarChart';
import { PayableBlockTypes } from '../../../reports/reports.constants';

const getIntervals = (intervals) => {
  return [500, 300, 200, 100, 0];
};

const WCDPOIndustryBenchmarkBlock = ({
  report,
  ignoreHeadings,
  whenPrinting,
  title,
  type,
}) => {
  return (
    <div>
      {!ignoreHeadings && (
        <div className="text-left">
          <br />
          <IconHeadingBlock
            heading="Accounts Payable"
            icon="arrow_upward"
            containerStyle="gap-1 mb-2"
          />
        </div>
      )}
      <ReportDownloadWrapper
        whenPrinting={whenPrinting}
        containerClass={`px-3 pb-2`}
        containerPrintClass="py-2 px-5"
      >
        <Card
          className={`mb-2 ${!whenPrinting && ignoreHeadings ? 'mt-3' : ''}`}
        >
          <CardBody>
            <h5 className="text-left mb-1 d-flex align-items-center gap-1">
              {title}
            </h5>
            <div className="pl-4">
              <ReportBarChart
                barData={
                  type.key === PayableBlockTypes.DPO.key
                    ? [
                        {
                          key: 'You',
                          value: report?.yourDPO || 0,
                          clazz: 'bg-primary',
                        },
                        {
                          key: 'Industry Average',
                          value: report?.avgDPO || 0,
                          clazz: 'bg-black',
                        },
                        {
                          key: 'Best-In-Class',
                          value: report?.bestInClassDPO || 0,
                          clazz: 'bg-success-dark',
                        },
                      ]
                    : [
                        {
                          key: 'You',
                          value: report?.yourDSO || 0,
                          clazz: 'bg-primary',
                        },
                        {
                          key: 'Industry Average',
                          value: report?.avgDSO || 0,
                          clazz: 'bg-black',
                        },
                        {
                          key: 'Best-In-Class',
                          value: report?.bestInClassDSO || 0,
                          clazz: 'bg-success-dark',
                        },
                      ]
                }
                linesCount={5}
                barStyle={{
                  width: 150,
                  margin: '0 20px 0 20px',
                }}
                lineHeight={30}
                withIntervals={getIntervals([
                  report[`your${type.short}`],
                  report[`avg${type.short}`],
                  report[`bestInClass${type.short}`],
                ])}
              />
            </div>
          </CardBody>
        </Card>
      </ReportDownloadWrapper>
    </div>
  );
};

export default WCDPOIndustryBenchmarkBlock;
