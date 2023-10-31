import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

import Loading from '../../../../components/Loading';
import Steps from '../../../../components/steps/Steps';
import userService from '../../../../services/user.service';
import Info from './Info';

const Profile = () => {
  const { id: userId } = useParams();
  const [profileInfo, setProfileInfo] = useState(undefined);
  const [me, setMe] = useState(null);

  const getProfileInfo = async () => {
    try {
      const data = await userService.getUserById(userId);

      setProfileInfo(data);
    } catch (error) {
      console.log(error);
    }
  };

  const getCurrentUser = async () => {
    const me = await userService
      .getUserInfo()
      .catch((err) => console.error(err));

    setMe(me);
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    getProfileInfo();
  }, [userId]);

  return (
    <div>
      {profileInfo ? <Info profileInfo={profileInfo} /> : <Loading />}

      <hr />

      <Row className="mb-4">
        <Col md="12">
          {userId ? (
            <Steps fetchAll userId={userId} limit={5} me={me} />
          ) : (
            <Loading />
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
