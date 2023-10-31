import React, { useState, useEffect } from 'react';
import { createUpload } from '@mux/upchunk';
import MuxPlayer from '@mux/mux-player-react';
import {
  MAX_POINTS,
  SERVER_ERROR,
  VIDEO_PLAYER_WIDTH,
} from '../../utils/constants';
import { FormGroup, Label, Spinner } from 'reactstrap';
import { FileUploader } from 'react-drag-drop-files';
import lessonService from '../../services/lesson.service';
import './style.css';
const MuxUpload = ({
  lessonId,
  onHandleUploadVideo,
  videoId,
  video,
  setErrorMessage,
  index,
  pageId,
  pages,
  setPages,
  setMuxID,
}) => {
  const [uploading, setUploading] = useState();
  const [uploadingProgress, setUploadingProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [dragActive, setDragActive] = useState('bg-gray-200');
  const [playParams, setPlayParams] = useState({
    playId: videoId,
    videoId,
  });

  const fileTypes = ['mp4', 'avi', 'mov'];
  useEffect(() => {
    if (videoId) {
      if (video?.muxUploadId) {
        loadAsset(video.muxUploadId);
      } else {
        setPlayParams({
          playId: '',
        });
      }
    } else {
      setPlayParams({
        playId: '',
      });
    }
  }, [videoId]);

  const loadAsset = async (vId) => {
    if (vId) {
      const response = await lessonService
        .getVideo(vId)
        .catch((err) => console.log(err));

      if (!response) {
        setErrorMessage(SERVER_ERROR);
      } else {
        if (response.data.status === 'ready') {
          setProcessing(false);
          setMuxID(response.data.playback_ids[0].id);
          setPlayParams({
            playId: response.data.playback_ids[0].id,
            videoId: response.data.playback_ids[0].id,
          });
          onHandleUploadVideo({
            videoId: response.data.playback_ids[0].id,
          });
        } else {
          setProcessing(true);
          loadAsset(vId);
        }
      }
    }
  };
  const onHandleVideo = async (inputRef) => {
    setUploading(true);
    const response = await lessonService
      .createVideoURL()
      .catch((err) => console.log(err));

    if (!response) {
      setUploading(false);
      setErrorMessage(SERVER_ERROR);
    } else {
      const upload = createUpload({
        endpoint: response?.data?.muxUploadUrl,
        file: inputRef,
        playback_policy: 'public',
        chunkSize: 5120, // Uploads the file in ~5mb chunks
      });

      // Subscribe to events
      upload.on('error', (error) => {
        console.error('💥 🙀', error.detail);
      });

      upload.on('progress', (progress) => {
        setUploadingProgress(progress.detail);
      });

      upload.on('success', (data) => {
        setUploadingProgress(0);
        const slicePages = pages.slice();

        const pageSelected = slicePages?.find(
          (page) => page.id === pageId || page.pageLocalId === pageId
        );

        const pageIndex = slicePages?.findIndex(
          (page) => page.id === pageId || page.pageLocalId === pageId
        );

        if (pageSelected) {
          const newPageInfo = {
            ...pageSelected,
            videoId: response.data.videoId,
            video: response.data,
          };

          slicePages.splice(pageIndex, 1, newPageInfo);
          setPages(slicePages);
        }
        loadAsset(response.data.muxUploadId);
        setUploading(false);
      });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive('bg-gray-300');
    } else if (e.type === 'dragleave') {
      setDragActive('bg-gray-200');
    }
  };

  return (
    <div className="page-container p-3">
      {playParams?.playId !== '' ? (
        <div className="text-center position-relative">
          <MuxPlayer
            streamType="on-demand"
            style={{ width: VIDEO_PLAYER_WIDTH }}
            playbackId={playParams.playId}
            metadata={{
              videoId: playParams.videoId,
              video_title: '',
              viewer_user_id: playParams.videoId,
            }}
            autoPlay={true}
            controls={true}
          />
          {processing && (
            <div
              className="position-absolute h-100 top-0 z-index-10"
              style={{
                background: 'rgba(0,0,0,.65)',
                width: VIDEO_PLAYER_WIDTH,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              <div className="abs-center-xy cursor-pointer">
                <div className="d-flex text-white gap-2 align-items-center">
                  <Spinner className="spinner-grow-sm" />
                  <p className="mb-0 font-weight-semi-bold">
                    Processing video, please wait...
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
      <FormGroup className="d-flex flex-column">
        <Label
          className="d-inline-flex gap-1 align-items-center"
          htmlFor={MAX_POINTS}
        >
          <span>Upload File</span>{' '}
          {uploading && (
            <div className="ml-1 d-flex align-items-center">
              <Spinner className="spinner-grow-xs" />
              <span className="font-weight-semi-bold ml-1">
                ({Math.round(uploadingProgress)}%)
              </span>
            </div>
          )}
        </Label>
        {!uploading && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            className={`position-relative w-100 z-index-50`}
          >
            <FileUploader
              handleChange={onHandleVideo}
              name="muxfiles"
              types={fileTypes}
              classes={'mux-drop-area'}
              multiple={false}
            >
              <div
                className={`text-center p-2 rounded cursor-pointer border-dashed-gray ${dragActive}`}
                style={{ height: 80 }}
              >
                <div className="mb-0 d-flex form-label font-weight-semi-bold justify-content-center align-items-center h-100">
                  Drag a file here or
                  <a className="btn-link decoration-underline cursor-pointer mx-1 text-primary">
                    Browse
                  </a>
                  for a file upload{' '}
                </div>
              </div>
            </FileUploader>
          </div>
        )}
      </FormGroup>
    </div>
  );
};

export default MuxUpload;
