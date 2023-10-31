import React, { Fragment } from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';

const Merchant = () => {
  const now = 60;
  return (
    <Fragment>
      <div className="row g-2">
        <div className="col-xxl-12 col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
          <div className="card generic p-4">
            <div className="card-body">
              <h4 className="card-title mb-4 font16 weight6">
                Total Estimated Savings
              </h4>
              <div className="row g-2 align-items-center">
                <div className="col-xxl-6 col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
                  <div className="bank-saving d-flex align-items-center gap-3">
                    <div className="currency-icon  d-flex align-items-center justify-content-center font-size-2xl text-white">
                      $
                    </div>
                    <div className="text">
                      <h2 className="text-green font-size-3xl weight7 mb-0">
                        $14,029
                      </h2>
                      <p className="mb-0 font14 weight6">
                        Estimated annual savings by switching to EXCEL BANK.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-xxl-6 col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
                  <p className="text-gray mb-0">
                    *Based on your statement provided to EXCEL Bank. This is an
                    estimate. Actual fees are determined by averages balance and
                    product usage. See Pricing Proforma for additional details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xxl-12 col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
          <div className="card generic p-4">
            <div className="card-body">
              <h4 className="card-title mb-5 font16 weight6 d-flex align-items-center justify-content-between">
                <span>Proposed Pricing</span>
                <div className="bank-types">
                  <ul className="mb-0 d-flex align-items-center justify-content-between gap-3">
                    <li className="dot green">Excel Bank</li>
                    <li className="dot">Current Bank</li>
                  </ul>
                </div>
              </h4>
              <div className="row g-2 align-items-center justify-content-center">
                <div className="col-xxl-9 col-xl-9 col-lg-9 col-md-9 col-sm-12 col-xs-12">
                  <div className="row gy-2 align-items-center justify-content-center">
                    <div className="col-xxl-4 col-xl-4 col-lg-4 col-md-4 col-sm-12 col-xs-12">
                      <div className="progress-wrp">
                        <span className="font14 weight5">35 bps</span>
                        <ProgressBar className="bar-green" now={now} />
                      </div>
                    </div>
                    <div className="col-xxl-4 col-xl-4 col-lg-4 col-md-4 col-sm-12 col-xs-12">
                      <div className="text text-center">
                        <span className="font14 weight5">ACH</span>
                        <p className="text-gray mb-0">
                          All debit / credit ACH transactions
                        </p>
                      </div>
                    </div>
                    <div className="col-xxl-4 col-xl-4 col-lg-4 col-md-4 col-sm-12 col-xs-12">
                      <div className="progress-wrp">
                        <ProgressBar className="bar-black" now={now} />
                        <span className="font14 weight5">25 bps</span>
                      </div>
                    </div>
                    <div className="col-xxl-4 col-xl-4 col-lg-4 col-md-4 col-sm-12 col-xs-12">
                      <div className="progress-wrp">
                        <span className="font14 weight5">$0.04</span>
                        <ProgressBar className="bar-green" now={now} />
                      </div>
                    </div>
                    <div className="col-xxl-4 col-xl-4 col-lg-4 col-md-4 col-sm-12 col-xs-12">
                      <div className="text text-center">
                        <span className="font14 weight5">ACH Batch</span>
                        <p className="text-gray mb-0">
                          Total number of ACH batches
                        </p>
                      </div>
                    </div>
                    <div className="col-xxl-4 col-xl-4 col-lg-4 col-md-4 col-sm-12 col-xs-12">
                      <div className="progress-wrp">
                        <ProgressBar className="bar-black" now={now} />
                        <span className="font14 weight5">$0.50</span>
                      </div>
                    </div>
                    <div className="col-xxl-4 col-xl-4 col-lg-4 col-md-4 col-sm-12 col-xs-12">
                      <div className="progress-wrp">
                        <span className="font14 weight5">$15.00</span>
                        <ProgressBar className="bar-green" now={now} />
                      </div>
                    </div>
                    <div className="col-xxl-4 col-xl-4 col-lg-4 col-md-4 col-sm-12 col-xs-12">
                      <div className="text text-center">
                        <span className="font14 weight5">Checks</span>
                        <p className="text-gray mb-0">All checks written</p>
                      </div>
                    </div>
                    <div className="col-xxl-4 col-xl-4 col-lg-4 col-md-4 col-sm-12 col-xs-12">
                      <div className="progress-wrp">
                        <ProgressBar className="bar-black" now={now} />
                        <span className="font14 weight5">$30.00</span>
                      </div>
                    </div>
                    <div className="col-xxl-4 col-xl-4 col-lg-4 col-md-4 col-sm-12 col-xs-12">
                      <div className="progress-wrp">
                        <span className="font14 weight5">$150.00</span>
                        <ProgressBar className="bar-green" now={now} />
                      </div>
                    </div>
                    <div className="col-xxl-4 col-xl-4 col-lg-4 col-md-4 col-sm-12 col-xs-12">
                      <div className="text text-center">
                        <span className="font14 weight5">Wire</span>
                        <p className="text-gray mb-0">All wire payments</p>
                      </div>
                    </div>
                    <div className="col-xxl-4 col-xl-4 col-lg-4 col-md-4 col-sm-12 col-xs-12">
                      <div className="progress-wrp">
                        <ProgressBar className="bar-black" now={now} />
                        <span className="font14 weight5">$250.00</span>
                      </div>
                    </div>
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

export default Merchant;
