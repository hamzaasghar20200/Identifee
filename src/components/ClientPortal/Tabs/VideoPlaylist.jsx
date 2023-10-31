import React, { useEffect, useState } from 'react';
import WistiaEmbed from '../../wistia';
import categoryService from '../../../services/category.service';
import Skeleton from 'react-loading-skeleton';
import MuxPlayer from '@mux/mux-player-react';
import NoDataFound from '../../commons/NoDataFound';
import { overflowing, secondsToMinutes } from '../../../utils/Utils';
import SimpleModalCreation from '../../modal/SimpleModalCreation';
import lessonService from '../../../services/lesson.service';
import { ListGroup, ListGroupItem } from 'reactstrap';
import MaterialIcon from '../../commons/MaterialIcon';

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

const VideoPlayerModal = ({ playerModal, setPlayerModal, selectedVideo }) => {
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
  }, [playerModal]);

  return (
    <SimpleModalCreation
      modalTitle={<VideoTitle data={mxObject} />}
      open={playerModal}
      bankTeam={false}
      isLoading={false}
      onHandleCloseModal={() => {
        overflowing();
        setPlayerModal(!playerModal);
      }}
    >
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
              onVideoLoaded={(video, duration) => {
                setLoader(false);
                setMxObject({ video, duration });
              }}
            />
          </div>
        )}
      </>
    </SimpleModalCreation>
  );
};

const PlayButtonWrapper = ({ onClick, children }) => {
  return (
    <div className="position-relative">
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
const MuxPlayerWrapper = ({ muxObject, onClick, category }) => {
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
        <>
          {mxObject.duration ? (
            <div className="row align-items-center">
              <div className="col-md-4 pl-0">
                <PlayButtonWrapper onClick={onClick}>
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
              </div>
              <div className="col-md-8 pl-0">
                <>
                  {mxObject.duration ? (
                    <>
                      <p className="text-muted mb-0 font-size-xs">
                        {category.title}
                      </p>
                      <h4 className="mb-0">
                        <VideoTitle data={muxObject} />
                      </h4>
                      <p className="mb-0 text-muted font-size-sm2">
                        {secondsToMinutes(mxObject?.duration)}
                      </p>
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
                </>
              </div>
            </div>
          ) : (
            <div className="row align-items-center">
              <div className="col-md-12 p-0">
                <NoDataFound
                  title={
                    <div className="font-normal font-size-sm2 text-gray-search">
                      No video found
                    </div>
                  }
                  containerStyle="text-gray-search my-1 py-1"
                />
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

const WistiaPlayerWrapper = ({ wistiaObject, onClick, category }) => {
  const [loader, setLoader] = useState(false);
  const [wistiaVid, setWistiaVid] = useState({});
  console.log(wistiaObject.externalUrl);
  return (
    <>
      {loader ? (
        <VideoItemLoader />
      ) : (
        <>
          {wistiaObject.externalUrl?.includes('wistia') ? (
            <div className="row align-items-center">
              <div className="col-md-4 pl-0">
                <PlayButtonWrapper onClick={onClick}>
                  <WistiaEmbed
                    hashedId={getVideoId(wistiaObject.externalUrl) || ''}
                    isResponsive={true}
                    onVideoLoaded={(video, duration) => {
                      setLoader(false);
                      console.log('vvvv-w', video, duration);
                      setWistiaVid({ video, duration });
                    }}
                  />
                </PlayButtonWrapper>
              </div>
              <div className="col-md-8 pl-0">
                <p className="text-muted mb-0 font-size-xs">{category.title}</p>
                <h4 className="mb-0">
                  <VideoTitle data={wistiaObject} />
                </h4>
                <p className="mb-0 text-muted font-size-sm2">
                  {wistiaVid?.duration}
                </p>
              </div>
            </div>
          ) : (
            <NoDataFound
              title={
                <div className="font-normal font-size-sm2 text-gray-search">
                  No video found
                </div>
              }
              containerStyle="text-gray-search my-1 py-1"
            />
          )}
        </>
      )}
    </>
  );
};

export const VideoPlaylist = ({ category, setCategory }) => {
  const [loader, setLoader] = useState(false);
  const [categoryVideos, setCategoryVideos] = useState([]);
  const [listPagination] = useState({ page: 1, limit: 10 });
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

  return (
    <>
      {playerModal && (
        <VideoPlayerModal
          playerModal={playerModal}
          setPlayerModal={setPlayerModal}
          selectedVideo={selectedVideo}
        />
      )}

      <div className="py-2 px-3">
        <div className="mb-3 d-flex align-items-center">
          <button
            className="btn btn-sm btn-white"
            onClick={() => setCategory('')}
          >
            <span className="material-icons-outlined">arrow_back</span>
          </button>
          <h3 className="m-auto">{category.title}</h3>
        </div>

        {loader ? (
          <div>
            <Skeleton count={5} height={10} className={'mb-2'} />
          </div>
        ) : (
          <div>
            {categoryVideos.length > 0 ? (
              <ListGroup>
                {categoryVideos?.map((videoObject) => (
                  <ListGroupItem key={videoObject.videoId}>
                    {videoObject.muxUploadUrl ? (
                      <MuxPlayerWrapper
                        muxObject={videoObject}
                        onClick={(e) => handleVideoClick(e, videoObject)}
                        category={category}
                      />
                    ) : (
                      <WistiaPlayerWrapper
                        wistiaObject={videoObject}
                        onClick={(e) => handleVideoClick(e, videoObject)}
                        category={category}
                      />
                    )}
                  </ListGroupItem>
                ))}
              </ListGroup>
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
    </>
  );
};
