import { Card, CardBody, Col, Row } from 'reactstrap';
import BrandLogoIcon from '../components/sidebar/BrandLogoIcon';
import { useTenantContext } from '../contexts/TenantContext';
import PageTitle from '../components/commons/PageTitle';
import { isDisplayWelcomeScreen } from '../utils/Utils';
import { useHistory } from 'react-router-dom';
import WistiaEmbed from '../components/wistia';

const ComericaWelcome = () => {
  const { tenant } = useTenantContext();
  const history = useHistory();
  // if user is on welcome screen and refresh and this time if welcome screen is removed then redirect it to home
  if (!isDisplayWelcomeScreen(tenant?.modules)) {
    history.push('/');
  }
  return (
    <>
      <PageTitle page={['Welcome']}></PageTitle>
      <Row className="w-100 mt-6 mx-0">
        <Col md={9} className="m-auto">
          <Card className="bg-transparent shadow-none border-none">
            <CardBody className="text-center p-sm-0 p-lg-6">
              <BrandLogoIcon tenant={tenant} />
              <h1 className="mt-4">
                Welcome! You have successfully activated your account.
              </h1>
              <p className="mb-4 pb-4">
                Your next steps and instructions will be provided soon.
              </p>
              <p className="mb-4">Thank you.</p>
              <div className="position-relative">
                <div
                  className="text-center h-100 w-100 position-absolute abs-center bottom-0"
                  style={{
                    maxWidth: 600,
                    maxHeight: 400,
                  }}
                >
                  <WistiaEmbed
                    hashedId={'y5vapp3z9z'}
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

export default ComericaWelcome;
