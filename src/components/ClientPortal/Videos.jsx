import React, { useState } from 'react';
import './style.css';
import './responsive.css';
import ClientDashboardLayout from '../../layouts/ClientDashboardLayout';
import VideoDetail from './videos/VideoDetail';
import VideoListings from './videos/VideoListings';

const Videos = () => {
  const [videodetails, setVideoDetails] = useState(false);
  const showVideoDetail = () => {
    setVideoDetails(true);
  };
  const hideVideoDetail = () => {
    setVideoDetails(false);
  };
  return (
    <ClientDashboardLayout>
      {!videodetails && <VideoListings showVideoDetail={showVideoDetail} />}
      {videodetails && <VideoDetail hideVideoDetail={hideVideoDetail} />}
    </ClientDashboardLayout>
  );
};

export default Videos;
