import React, { Fragment } from 'react';
import ButtonIcon from '../../commons/ButtonIcon';

const VideoDetail = ({ hideVideoDetail }) => {
  return (
    <Fragment>
      <div className="page-title pt-3 p-3 d-flex justify-content-between align-items-center">
        <h1 className="d-flex justify-content-between align-items-center gap-2">
          <ButtonIcon
            icon="chevron_left"
            iconClass="font-size-2xl text-blue"
            color="light "
            classnames="d-flex align-items-center rounded-3"
            label=""
            onClick={hideVideoDetail}
          />
          Working Capital
        </h1>
      </div>
      <div className="video-detail p-3 vh-100">
        <div className="row justify-content-center vh-100">
          <div className="col-xxl-8 col-xl-8 col-lg-8 col-md-12 col-sm-12 col-xs-12 vh-100">
            <div className="video-player mb-4">
              <img
                className="img-fluid w-100"
                src="/img/clint-portal/player.png"
                alt=""
              />
            </div>
            <div className="card video-card listing d-flex flex-row p-3 gap-2 align-items-center mb-3">
              <figure>
                <img
                  className="img-fluid"
                  src="/img/clint-portal/video-post.png"
                  alt=""
                />
                <div className="btn-player">
                  <img
                    className="img-fluid"
                    src="/img/clint-portal/icon-play.png"
                    alt=""
                  />
                </div>
              </figure>
              <div className="card-body p-0">
                <div className="text">
                  <p className="mb-2">Category name</p>
                  <h5>Working Capital</h5>
                  <span>3:20</span>
                </div>
              </div>
            </div>
            <div className="card video-card listing d-flex flex-row p-3 gap-2 align-items-center mb-3 active">
              <figure>
                <img
                  className="img-fluid"
                  src="/img/clint-portal/video-post.png"
                  alt=""
                />
                <div className="btn-player">
                  <img
                    className="img-fluid"
                    src="/img/clint-portal/icon-play.png"
                    alt=""
                  />
                </div>
              </figure>
              <div className="card-body p-0">
                <div className="text">
                  <p className="mb-2">Category name</p>
                  <h5>Working Capital</h5>
                  <span>3:20</span>
                </div>
              </div>
            </div>
            <div className="card video-card listing d-flex flex-row p-3 gap-2 align-items-center mb-3">
              <figure>
                <img
                  className="img-fluid"
                  src="/img/clint-portal/video-post.png"
                  alt=""
                />
                <div className="btn-player">
                  <img
                    className="img-fluid"
                    src="/img/clint-portal/icon-play.png"
                    alt=""
                  />
                </div>
              </figure>
              <div className="card-body p-0">
                <div className="text">
                  <p className="mb-2">Category name</p>
                  <h5>Working Capital</h5>
                  <span>3:20</span>
                </div>
              </div>
            </div>
            <div className="card video-card listing d-flex flex-row p-3 gap-2 align-items-center mb-3">
              <figure>
                <img
                  className="img-fluid"
                  src="/img/clint-portal/video-post.png"
                  alt=""
                />
                <div className="btn-player">
                  <img
                    className="img-fluid"
                    src="/img/clint-portal/icon-play.png"
                    alt=""
                  />
                </div>
              </figure>
              <div className="card-body p-0">
                <div className="text">
                  <p className="mb-2">Category name</p>
                  <h5>Working Capital</h5>
                  <span>3:20</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default VideoDetail;
