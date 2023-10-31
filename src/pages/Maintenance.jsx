import { Card, CardBody, Col, Row } from 'reactstrap';
import BrandLogoIcon from '../components/sidebar/BrandLogoIcon';
import { useTenantContext } from '../contexts/TenantContext';
import PageTitle from '../components/commons/PageTitle';

const Maintenance = () => {
  const { tenant } = useTenantContext();

  return (
    <>
      <PageTitle page={['Maintenance']}></PageTitle>
      <Row className="w-100 mt-6 mx-0">
        <Col md={9} className="m-auto">
          <Card>
            <CardBody className="text-center p-6">
              <BrandLogoIcon tenant={tenant} />
              <h1 className="mt-4">Sorry, we&apos;re down for maintenance.</h1>
              <p className="mb-6 pb-6">
                We&apos;ll be back up shortly. Try again later.
              </p>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Maintenance;
