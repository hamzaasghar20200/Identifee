import IconHeadingBlock from '../IconHeadingBlock';
import ReportDownloadWrapper from '../ReportDownloadWrapper';
import { Card, CardBody } from 'reactstrap';
import MaterialIcon from '../../../commons/MaterialIcon';
import { isToFixedNoRound } from '../../../../utils/Utils';
import React from 'react';
import { ProgressBar } from 'react-bootstrap';

const Arrows = () => {
  return (
    <>
      <div id="greenLg" className="position-absolute top-0 right-0 z-index-2">
        <img src="https://iili.io/Hi4oeyP.png" width={350} />
      </div>
      <div id="greenSm" className="position-absolute left-0">
        <img src="https://iili.io/Hi4oNaV.png" width={100} />
      </div>
      <div id="grey" className="position-absolute bottom-0 left-0">
        <img src="https://iili.io/Hi4oh6x.png" width={150} />
      </div>
      <div id="white" className="position-absolute bottom-0 left-150">
        <img src="https://iili.io/Hi4ow3Q.png" width={150} />
      </div>
    </>
  );
};

const WCOpportunityBlock = ({ report, ignoreHeadings, whenPrinting }) => {
  return (
    <div>
      {!ignoreHeadings && (
        <div className="text-left">
          <br />
          <IconHeadingBlock
            heading="Opportunity"
            icon="price_check"
            containerStyle={
              whenPrinting ? 'gap-1 px-5 mb-1' : 'px-3 gap-1 mb-1'
            }
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
            <div
              className={`position-relative mb-2 rpt-green-box py-6`}
              style={{ height: 350 }}
            >
              <Arrows />
              <div className="position-relative gap-2 z-index-5">
                <div
                  className={`d-flex align-items-center mb-2 justify-content-center gap-2`}
                >
                  <div className="icon-wrap d-flex align-items-center justify-content-center">
                    <MaterialIcon
                      icon="attach_money"
                      clazz="icon-money font-size-xl p-1_2 text-white"
                    />
                  </div>
                  <h1 className={`font-size-2p5em fw-bolder mb-0`}>
                    {isToFixedNoRound(Math.abs(report?.totalAnnualValue))}
                  </h1>
                </div>
                <p
                  className="fs-9 mb-0 text-black text-center font-weight-normal"
                  style={{ maxWidth: 300 }}
                >
                  Total annual value
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className="py-3 mb-0 fs-7">
                By streamlining Accounts Payable and Accounts Receivables,{' '}
                {report?.companyName} has the ability to free up an estimated{' '}
                {isToFixedNoRound(Math.abs(report?.totalAnnualValue))} of
                working capital.
              </p>
              <div className="py-2">
                <div
                  className="rpt-bg-dark-gray"
                  style={{ borderRadius: 'var(--borderRadius)' }}
                >
                  <ProgressBar
                    style={{ height: 12 }}
                    isChild={true}
                    now={report?.apPercentage || 0}
                    max={100}
                    className={'progress-bar-green'}
                    key={1}
                  />
                </div>
                <div className="d-flex mt-2 align-items-center justify-content-center gap-2">
                  <div className="d-flex align-items-center gap-1">
                    <span
                      className={`rounded-circle bg-success`}
                      style={{ height: 12, width: 12 }}
                    ></span>
                    <p className="fs-10 mb-0">Accounts Payable Opportunity</p>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <span
                      className="rounded-circle rpt-bg-dark-gray"
                      style={{ height: 12, width: 12 }}
                    ></span>
                    <p className="fs-10 mb-0">
                      Accounts Receivable Opportunity
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </ReportDownloadWrapper>
    </div>
  );
};

export default WCOpportunityBlock;
