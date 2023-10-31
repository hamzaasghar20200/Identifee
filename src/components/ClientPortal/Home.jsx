import React from 'react';
import './style.css';
import './responsive.css';
import ClientDashboardLayout from '../../layouts/ClientDashboardLayout';
import HomeContent from './home/HomeContent';

const Home = ({ wrapLayout }) => {
  return wrapLayout ? (
    <ClientDashboardLayout>
      <HomeContent />
    </ClientDashboardLayout>
  ) : (
    <HomeContent />
  );
};

export default Home;
