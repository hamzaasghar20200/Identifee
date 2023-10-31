import React, { Fragment } from 'react';

const WorkingCapital = () => {
  return (
    <Fragment>
      <div className="row g-2">
        <div className="col-xxl-12 col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
          <div className="card generic p-4">
            <div className="card-body">
              <h4 className="card-title mb-4 font16 weight6">
                Working Capital
              </h4>
              <div className="row g-2">
                <div className="col-xxl-6 col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
                  <div className="bank-saving d-flex align-items-center gap-3">
                    <div className="text">
                      <h2 className="text-black font-size-3xl weight7 mb-0">
                        1.04
                      </h2>
                      <p className="mb-0 font14 weight6">
                        Peer group average Working Capital ratio
                      </p>
                    </div>
                  </div>
                  <img
                    className="img-fluid w-100 mb-4"
                    src="/img/clint-portal/progreebar.png"
                    alt=""
                  />
                </div>
                <div className="col-xxl-6 col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
                  <p className="text-gray">
                    The top 33% of your peers within NAIC Code 236220 have a
                    Working Capital figure{' '}
                    <span className="text-green">above 1.5</span>.
                  </p>
                  <p className="text-gray mb-0">
                    The bottom 33% of your peers have a Working Capital figure{' '}
                    <span className="text-red">below 0.8</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xxl-6 col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
          <div className="card generic h-100">
            <div className="card-body text-center pt-5 pb-5">
              <h5 className="card-title font16 weight6">
                Days Payable Outstanding
              </h5>
              <div className="text">
                <h2 className="text-black font-size-3xl weight7 mt-3">
                  53.9 <sup className="font-size-xl">Days</sup>
                </h2>
                <p className="mb-0 font14 text-gray">
                  Peer Group Average <br /> Days Payable Outstanding
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xxl-6 col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
          <div className="card generic h-100">
            <div className="card-body text-center pt-5 pb-5">
              <h5 className="card-title font16 weight6">
                Days Payable Outstanding
              </h5>
              <div className="text">
                <h2 className="text-black font-size-3xl weight7 mt-3">
                  61.9 <sup className="font-size-xl">Days</sup>
                </h2>
                <p className="mb-0 font14 text-gray">
                  Peer Group Average <br /> Days Payable Outstanding
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default WorkingCapital;
