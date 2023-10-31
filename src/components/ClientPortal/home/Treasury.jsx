import React, { Fragment } from 'react';
import MaterialIcon from '../../commons/MaterialIcon';

const Treasury = () => {
  return (
    <Fragment>
      <div className="row g-2">
        <div className="col-xxl-6 col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
          <div className="card generic">
            <div className="card-body">
              <h4 className="card-title mb-4 font16 weight6">US Percentile</h4>
              <img
                className="img-fluid w-100 mb-4"
                src="/img/clint-portal/progreebar.png"
                alt=""
              />
              <p className="text-gray">
                This company is in the 88th percentile of companies in the
                United States. This means that 88% of all rated companies have a
                lower score (higher risk).
              </p>
            </div>
          </div>
        </div>
        <div className="col-xxl-6 col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
          <div className="card generic">
            <div className="card-body">
              <h4 className="card-title mb-4 font16 weight6">
                Industry Percentile
              </h4>
              <img
                className="img-fluid w-100 mb-4"
                src="/img/clint-portal/progreebar.png"
                alt=""
              />
              <p className="text-gray">
                This company is in the 84th percentile within its industry. This
                means that 84% of all rated companies in SIC 5734 have a lower
                score (higher risk).
              </p>
            </div>
          </div>
        </div>
        <div className="col-xxl-6 col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
          <div className="card generic h-100">
            <div className="card-body">
              <h5 className="card-title font16 weight6">Trends</h5>
              <div className="row g-3 justify-content-center align-items-center h-100">
                <div className="col-xxl-4 col-xl-4 col-lg-6 col-md-6 col-sm-12 col-xs-12 text-center">
                  <img
                    className="img-fluid"
                    src="/img/clint-portal/payment-trends.png"
                    alt=""
                  />
                </div>
                <div className="col-xxl-4 col-xl-4 col-lg-6 col-md-6 col-sm-12 col-xs-12 text-center">
                  <img
                    className="img-fluid"
                    src="/img/clint-portal/inquiries-trends.png"
                    alt=""
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xxl-6 col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
          <div className="row gy-2">
            <div className="col-xxl-12 col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <div className="card generic strip">
                <div className="card-body">
                  <h6 className="card-title mb-2 font12 weight5">
                    Credit limit
                  </h6>
                  <div className="font28 weight7 mb-0">$50M</div>
                </div>
              </div>
            </div>
            <div className="col-xxl-12 col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <div className="card generic strip strip-red">
                <div className="card-body">
                  <h6 className="card-title mb-2 font12 weight5">
                    Derogatory Legal
                  </h6>
                  <div className="font28 weight7 mb-0">5 ($16K)</div>
                </div>
              </div>
            </div>
            <div className="col-xxl-12 col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <div className="card generic strip">
                <div className="card-body">
                  <h6 className="card-title mb-2 font12 weight5">
                    Possible OFAC
                  </h6>
                  <div className="font28 weight7 mb-0">NO</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xxl-12 col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
          <div className="card generic">
            <div className="card-body">
              <div className="row g-2">
                <div className="col-xxl-3 col-xl-3 col-lg-3 col-md-12 col-sm-12 col-xs-12">
                  <div className="info-text">
                    <h5 className="d-flex align-items-center gap-2 font14 weight5">
                      <MaterialIcon
                        icon="privacy_tip"
                        filled
                        clazz="text-blue"
                      />
                      Credit Limit
                    </h5>
                    <p className="text-gray">
                      The recommended credit limit is calculated using
                      information from a company’s payment record and from the
                      payment records of similar companies.
                    </p>
                  </div>
                </div>
                <div className="col-xxl-3 col-xl-3 col-lg-3 col-md-12 col-sm-12 col-xs-12">
                  <div className="info-text">
                    <h5 className="d-flex align-items-center gap-2 font14 weight5">
                      <MaterialIcon
                        icon="privacy_tip"
                        filled
                        clazz="text-blue"
                      />
                      Derogatory Legal
                    </h5>
                    <p className="text-gray">
                      The number and value of tax liens and judgements filed in
                      the last 6 years and 9 months plus bankruptcies filed in
                      the last 9 years and 9 months, the total dollar value is
                      shown in the brackets.
                    </p>
                  </div>
                </div>
                <div className="col-xxl-3 col-xl-3 col-lg-3 col-md-12 col-sm-12 col-xs-12">
                  <div className="info-text">
                    <h5 className="d-flex align-items-center gap-2 font14 weight5">
                      <MaterialIcon
                        icon="privacy_tip"
                        filled
                        clazz="text-blue"
                      />
                      Possible OFAC
                    </h5>
                    <p className="text-gray">
                      Indicates whether the company is possibly on a list of
                      sanctioned businesses the US government prohibits US
                      businesses from trading with under the Patriot Act.
                    </p>
                  </div>
                </div>
                <div className="col-xxl-3 col-xl-3 col-lg-3 col-md-12 col-sm-12 col-xs-12">
                  <div className="info-text">
                    <h5 className="d-flex align-items-center gap-2 font14 weight5">
                      <MaterialIcon
                        icon="privacy_tip"
                        filled
                        clazz="text-blue"
                      />
                      Payment Trend
                    </h5>
                    <p className="text-gray">
                      Indicates whether the company’s payment performance as
                      measured by DBT trend is getting better or worse.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Treasury;
