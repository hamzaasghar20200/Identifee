import { Card, CardBody, Col, Row } from 'reactstrap';
import BrandLogoIcon from '../components/sidebar/BrandLogoIcon';
import { useTenantContext } from '../contexts/TenantContext';
import PageTitle from '../components/commons/PageTitle';
import { useParams } from 'react-router-dom';
import WistiaEmbed from '../components/wistia';

const VideoPlayer = () => {
  const { tenant } = useTenantContext();
  const { videoId } = useParams();
  return (
    <>
      <PageTitle page={['Video Embed']}></PageTitle>
      <Row className="w-100 mt-6 mx-0">
        <Col md={9} className="m-auto">
          <Card className="bg-transparent shadow-none border-none">
            <CardBody className="text-center p-sm-0 p-lg-6">
              <BrandLogoIcon tenant={tenant} />
              <div className="position-relative mt-6">
                <div
                  className="text-center h-100 w-100 position-absolute abs-center bottom-0"
                  style={{
                    maxWidth: 600,
                    maxHeight: 400,
                  }}
                >
                  <WistiaEmbed
                    hashedId={videoId || 'kbstczu1a1'}
                    isResponsive={true}
                    autoPlay={false}
                    videoFoam={true}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default VideoPlayer;
