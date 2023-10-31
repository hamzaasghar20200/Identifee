import React, { Fragment, useEffect, useState } from 'react';
import WistiaEmbed from '../../wistia';
import categoryService from '../../../services/category.service';
import Skeleton from 'react-loading-skeleton';
import MuxPlayer from '@mux/mux-player-react';
import NoDataFound from '../../commons/NoDataFound';
import { secondsToMinutes } from '../../../utils/Utils';
import lessonService from '../../../services/lesson.service';
import MaterialIcon from '../../commons/MaterialIcon';
import ButtonIcon from '../../commons/ButtonIcon';

const VideoTitle = ({ data }) => {
  const defaultPlaceholder = 'Video title';
  const [videoTitle, setVideoTitle] = useState(defaultPlaceholder);
  useEffect(() => {
    try {
      const { lessonPages } = data;
      const title = lessonPages?.[0]?.title;
      setVideoTitle(title ?? defaultPlaceholder);
    } catch (e) {
      setVideoTitle(defaultPlaceholder);
    }
  }, []);
  return <>{videoTitle}</>;
};

const getVideoId = (url) => {
  // strip any html tags
  url = url.replace(/(<([^>]+)>)/gi, '');
  if (url.indexOf('https://') !== -1) {
    const parts = url.split('/');
    return parts[parts.length - 1];
  }
  return url;
};

const VideoPlayer = ({ playerModal, selectedVideo }) => {
  const [playId, setPlayId] = useState('');
  const [loader, setLoader] = useState(false);
  const [mxObject, setMxObject] = useState({});

  const getVideo = async () => {
    setLoader(true);
    try {
      const response = await lessonService
        .getVideo(selectedVideo.muxUploadId)
        .catch((err) => console.log(err));

      setPlayId(response.data.playback_ids[0].id);
      setMxObject(response.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (playerModal) {
      if (selectedVideo.muxUploadUrl) {
        getVideo();
      }
    }
  }, [playerModal, selectedVideo]);

  return (
    <>
      {selectedVideo.muxUploadUrl ? (
        <>
          {loader ? (
            <Skeleton height={300} width="100%" className="d-block" />
          ) : (
            <MuxPlayer
              streamType="on-demand"
              autoPlay={false}
              playbackId={playId}
              metadata={{
                videoId: mxObject.videoId,
                video_title: selectedVideo.videoTitle || '',
              }}
              controls={true}
            />
          )}
        </>
      ) : (
        <div>
          <WistiaEmbed
            hashedId={getVideoId(selectedVideo.externalUrl) || ''}
            isResponsive={true}
            autoPlay={false}
            onVideoLoaded={(video, duration) => {
              setLoader(false);
              setMxObject({ video, duration });
            }}
          />
        </div>
      )}
    </>
  );
};

const PlayButtonWrapper = ({ onClick, children }) => {
  return (
    <div className="position-relative h-100">
      {children}
      <div
        className="position-absolute h-100 w-100 top-0 left-0 z-index-10"
        style={{ background: 'rgba(0,0,0,.45)' }}
      >
        <a onClick={onClick} className="abs-center-xy cursor-pointer">
          <MaterialIcon
            icon="play_circle_filled"
            clazz="font-size-4em text-white"
          />{' '}
        </a>
      </div>
    </div>
  );
};

const VideoItemLoader = () => {
  return (
    <div className="row align-items-center" style={{ minHeight: 115 }}>
      <div className="col-md-4 pl-0">
        <Skeleton height={115} width="100%" />
      </div>
      <div className="col-md-8 pl-0">
        <Skeleton height={10} width={50} className="my-1 d-block" />
        <Skeleton height={10} width={200} className="my-1 d-block" />
        <Skeleton height={10} width={30} className="my-1 d-block" />
      </div>
    </div>
  );
};
const MuxPlayerWrapper = ({ muxObject, onClick, category, className }) => {
  const [playId, setPlayId] = useState('');
  const [loader, setLoader] = useState(false);
  const [mxObject, setMxObject] = useState({});
  const getVideo = async () => {
    setLoader(true);
    try {
      const response = await lessonService
        .getVideo(muxObject.muxUploadId)
        .catch((err) => console.log(err));

      if (response?.data) {
        const { data } = response;
        setPlayId(data.playback_ids[0].id);
        setMxObject(data);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    getVideo();
  }, []);

  return (
    <>
      {loader ? (
        <VideoItemLoader />
      ) : (
        <Fragment>
          {mxObject.duration && (
            <Fragment>
              <div
                onClick={onClick}
                className={`card video-card listing d-flex flex-row p-2 gap-2 align-items-center mb-3 ${className}`}
              >
                <figure>
                  <PlayButtonWrapper>
                    <MuxPlayer
                      streamType="on-demand"
                      autoPlay={false}
                      playbackId={playId}
                      metadata={{
                        videoId: muxObject.videoId,
                        video_title: '',
                      }}
                      controls={true}
                    />
                  </PlayButtonWrapper>
                </figure>
                <div className="card-body p-0">
                  <div className="text">
                    {mxObject.duration ? (
                      <>
                        <p className="mb-2">{category.title}</p>
                        <h5>
                          <VideoTitle data={muxObject} />
                        </h5>
                        <span>{secondsToMinutes(mxObject?.duration)}</span>
                      </>
                    ) : (
                      <NoDataFound
                        title={
                          <div className="font-normal font-size-sm2 text-gray-search">
                            No video found
                          </div>
                        }
                        containerStyle="text-gray-search my-6 py-6"
                      />
                    )}
                  </div>
                </div>
              </div>
            </Fragment>
          )}
        </Fragment>
      )}
    </>
  );
};

const WistiaPlayerWrapper = ({
  wistiaObject,
  onClick,
  category,
  className,
}) => {
  const [loader, setLoader] = useState(false);
  const [wistiaVid, setWistiaVid] = useState({});
  return (
    <>
      {loader ? (
        <VideoItemLoader />
      ) : (
        <>
          {wistiaObject.externalUrl?.includes('wistia') && (
            <Fragment>
              <div
                onClick={onClick}
                className={`card video-card listing d-flex flex-row p-2 gap-2 align-items-center mb-3 ${className}`}
              >
                <figure>
                  <PlayButtonWrapper>
                    <WistiaEmbed
                      hashedId={getVideoId(wistiaObject.externalUrl) || ''}
                      isResponsive={true}
                      onVideoLoaded={(video, duration) => {
                        setLoader(false);
                        setWistiaVid({ video, duration });
                      }}
                    />
                  </PlayButtonWrapper>
                </figure>
                <div className="card-body p-0">
                  <div className="text">
                    <p className="mb-2">{category.title}</p>
                    <h5>
                      <VideoTitle data={wistiaObject} />
                    </h5>
                    <span>{wistiaVid?.duration}</span>
                  </div>
                </div>
              </div>
            </Fragment>
          )}
        </>
      )}
    </>
  );
};

export const VideoPlaylist = ({ category, setCategory }) => {
  const [loader, setLoader] = useState(false);
  const [categoryVideos, setCategoryVideos] = useState([]);
  const [listPagination] = useState({ page: 1, limit: 12 });
  const [playerModal, setPlayerModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState({});

  const handleVideoClick = (e, videoObject) => {
    e.preventDefault();
    setSelectedVideo({ ...videoObject });
    setPlayerModal(true);
  };

  const getVideosByCategory = async () => {
    setLoader(true);
    try {
      const { data } = await categoryService.getVideosByCategory(
        category.id,
        listPagination
      );
      setCategoryVideos(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (category) {
      getVideosByCategory();
    }
  }, [category]);

  useEffect(() => {
    if (categoryVideos.length > 0) {
      setSelectedVideo(categoryVideos[0]);
      setPlayerModal(true);
    }
  }, [categoryVideos]);

  return (
    <Fragment>
      <div className="page-title pt-3 p-3 d-flex justify-content-between align-items-center">
        <h1 className="d-flex justify-content-between align-items-center gap-2 mb-0">
          <ButtonIcon
            icon="arrow_back"
            iconClass="font-size-2xl text-blue"
            color="light "
            classnames="d-flex align-items-center rounded-3"
            label=""
            onClick={() => setCategory('')}
          />
          {category.title}
        </h1>
      </div>

      <div className="video-detail p-3">
        {loader ? (
          <div className="row justify-content-center">
            <Skeleton count={5} height={10} className={'mb-2'} />
          </div>
        ) : (
          <div className="row justify-content-center">
            <div className="col-xxl-12 col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <h2>
                {selectedVideo.lessonPages?.[0]?.title
                  ? selectedVideo.lessonPages?.[0]?.title
                  : 'Video title'}
              </h2>
            </div>
            {categoryVideos.length > 0 ? (
              <Fragment>
                <div className="col-xxl-8 col-xl-8 col-lg-8 col-md-12 col-sm-12 col-xs-12 mb-2">
                  {playerModal ? (
                    selectedVideo ? (
                      <VideoPlayer
                        playerModal={playerModal}
                        setPlayerModal={setPlayerModal}
                        selectedVideo={selectedVideo}
                      />
                    ) : (
                      <div className="video-player mb-4">
                        <img
                          className="img-fluid w-100"
                          src="/img/clint-portal/player.png"
                          alt=""
                        />
                      </div>
                    )
                  ) : (
                    <div className="video-player mb-4">
                      <img
                        className="img-fluid w-100"
                        src="/img/clint-portal/player.png"
                        alt=""
                      />
                    </div>
                  )}
                </div>
                <div className="col-xxl-4 col-xl-4 col-lg-4 col-md-12 col-sm-12 col-xs-12">
                  {categoryVideos?.map((videoObject, index) => (
                    <Fragment key={videoObject.videoId}>
                      {videoObject.muxUploadUrl ? (
                        <MuxPlayerWrapper
                          muxObject={videoObject}
                          onClick={(e) => handleVideoClick(e, videoObject)}
                          category={category}
                          className={
                            selectedVideo.videoId === videoObject.videoId
                              ? 'active'
                              : ''
                          }
                        />
                      ) : (
                        <WistiaPlayerWrapper
                          wistiaObject={videoObject}
                          onClick={(e) => handleVideoClick(e, videoObject)}
                          category={category}
                          className={
                            selectedVideo.videoId === videoObject.videoId
                              ? 'active'
                              : ''
                          }
                        />
                      )}
                    </Fragment>
                  ))}
                </div>
              </Fragment>
            ) : (
              <NoDataFound
                icon={'smart_display'}
                title={
                  <div className="font-normal font-size-sm2 text-gray-search">
                    No videos found for <b>{category.title}</b>
                  </div>
                }
                containerStyle="text-gray-search my-6 py-6"
              />
            )}
          </div>
        )}
      </div>
    </Fragment>
  );
};
