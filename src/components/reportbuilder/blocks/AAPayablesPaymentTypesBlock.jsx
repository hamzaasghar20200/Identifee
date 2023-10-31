import React from 'react';
import { Card, CardBody } from 'reactstrap';
import MaterialIcon from '../../commons/MaterialIcon';
import Skeleton from 'react-loading-skeleton';

const AAPayablesPaymentTypesBlock = ({
  report,
  insightsData,
  whenPrinting,
  ignoreHeadings,
  loader,
  isManual,
}) => {
  const avgDPO = !report?.valueN?.length
    ? 0
    : insightsData?.sp?.days_payable_out;
  const bestInClassDPO = !report?.valueN?.length
    ? 0
    : insightsData?.sp?.aggregations?.find(
        (agr) => agr.aggregation_type === 'AVERAGE_TOP_10_PERCENT'
      )?.days_payable_out || 0;
  return (
    <div className={whenPrinting ? 'px-5' : 'px-3'}>
      <Card className={`mb-2 ${!whenPrinting && ignoreHeadings ? 'mt-2' : ''}`}>
        <CardBody>
          <h5 className={`d-flex align-items-center justify-content-between`}>
            Days Payable Outstanding
            <span className="fs-9 text-muted font-weight-normal">
              Source: S&P Global
            </span>
          </h5>
          <p className="text-muted text-left mb-1 fs-8">
            Using payment options like Commercial Card and AP automation can
            maximize days payable, improving cash flow reducing reliance on
            other funding sources.
          </p>
          <div className="d-flex align-items-center justify-content-center mt-2">
            <div className="position-relative" style={{ top: 3, left: -5 }}>
              <img src="/img/Vector%204.png" className="w-100" />
              <div className="position-absolute w-100 abs-center-xy">
                <div className="d-flex align-items-center justify-content-center gap-1">
                  {loader ? (
                    <Skeleton width={50} height={20} />
                  ) : (
                    <>
                      <h1 className="mb-0 rpt-red-box-heading font-weight-bold">
                        {avgDPO}
                      </h1>
                      <h1 className="mb-0 rpt-red-box-heading font-weight-bold">
                        Days
                      </h1>
                    </>
                  )}
                </div>
                <p className="fs-10 mb-1 font-weight-medium w-75 m-auto">
                  Days Payable Outstanding Industry Average
                </p>
              </div>
            </div>
            <div className="position-relative" style={{ left: -5 }}>
              <img src="/img/Vector%208.png" className="w-100" />
              <div className="position-absolute abs-center-xy">
                <MaterialIcon icon="credit_card" clazz="font-size-2xl" />
                <p className="fs-10 mb-1 font-weight-medium">Commercial Card</p>
                <MaterialIcon icon="receipt_long" clazz="font-size-2xl" />
                <p className="fs-10 mb-0 font-weight-medium">AP Automation</p>
              </div>
            </div>
            <div className="position-relative">
              <img src="/img/Vector%206.png" className="w-100" />
              <div className="position-absolute w-100 abs-center-xy">
                <div className="d-flex align-items-center justify-content-center gap-1">
                  {loader ? (
                    <Skeleton width={50} height={20} />
                  ) : (
                    <>
                      <h1 className="mb-0 rpt-green-box-heading font-weight-bold">
                        {bestInClassDPO}
                      </h1>
                      <h1 className="mb-0 rpt-green-box-heading font-weight-bold">
                        Days
                      </h1>
                    </>
                  )}
                </div>
                <p className="fs-10 mb-1 font-weight-medium w-75 m-auto">
                  Days Payable Outstanding Best-In-Class
                </p>
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center mt-2 justify-content-center gap-1">
            <MaterialIcon
              icon="gpp_maybe"
              filled
              clazz="text-orange font-size-lg"
            />
            <span className="fs-10">
              Improve Days Payable to free up operating cash.
            </span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AAPayablesPaymentTypesBlock;
