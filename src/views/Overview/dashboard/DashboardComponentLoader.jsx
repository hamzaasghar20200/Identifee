import Masonry from 'react-masonry-css';
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import Skeleton from 'react-loading-skeleton';

const BasicLoader = () => {
  return (
    <div className="d-flex align-items-center justify-content-center">
      <div className="pb-4" style={{ height: 5, width: 100 }}>
        <Skeleton height="5" />
      </div>
    </div>
  );
};

const StandardLoader = () => {
  const BigCircle = ({ children }) => {
    return (
      <div className="rounded-circle" style={{ height: 80, width: 80 }}>
        {children}
      </div>
    );
  };
  return (
    <div className="d-flex align-items-center px-0">
      <BigCircle>
        <Skeleton style={{ lineHeight: '80px', borderRadius: '50%' }} circle />
      </BigCircle>
      <div className="ml-2">
        <div style={{ height: 5, width: 50 }}>
          <Skeleton height="5" width="50" />
        </div>
        <div className="mt-3" style={{ height: 5, width: 120 }}>
          <Skeleton height="5" width="100" />
        </div>
      </div>
    </div>
  );
};

const RankingsLoader = () => {
  const data = [1, 2, 3, 4, 5];
  return (
    <div>
      {data.map((item, index) => (
        <Row
          key={index}
          className={`font-size-sm2 align-items-center border-bottom py-2 px-0`}
        >
          <Col md={10}>
            <div className="d-flex font-weight-medium align-items-center">
              <div style={{ width: 15 }}>
                <Skeleton height="5" width="15" />
              </div>
              <div style={{ width: 280 }} className="ml-1">
                <Skeleton height="5" />{' '}
              </div>
            </div>
          </Col>
          <Col md={2} className="text-right">
            <p className="text-right mb-0">
              <Skeleton height="5" width="10" />
            </p>
          </Col>
        </Row>
      ))}
    </div>
  );
};

const LoaderCard = ({ children }) => {
  return (
    <Card className={`setting-item overflow-hidden`}>
      <CardHeader>
        <div className="card-title w-100 d-flex align-items-center justify-content-between mb-3">
          <div className="flex-grow-1" style={{ height: 5 }}>
            <Skeleton height="5" width="5" />
          </div>
          <div className="ml-6" style={{ height: 5, width: 30 }}>
            <Skeleton height="5" width="5" />
          </div>
        </div>
      </CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  );
};

const DashboardComponentLoader = () => {
  // TODO: i will refactor it and show loaders accordingly or based on dashboard component types
  return (
    <>
      <Masonry
        breakpointCols={3}
        className="my-masonry-grid mt-0 pt-0 pb-0"
        columnClassName="my-masonry-grid_column"
      >
        <LoaderCard>
          <BasicLoader />
        </LoaderCard>
        <LoaderCard>
          <RankingsLoader />
        </LoaderCard>
        <LoaderCard>
          <StandardLoader />
        </LoaderCard>
        <LoaderCard>
          <StandardLoader />
        </LoaderCard>
        <LoaderCard>
          <BasicLoader />
        </LoaderCard>
        <LoaderCard>
          <BasicLoader />
        </LoaderCard>
        <LoaderCard>
          <RankingsLoader />
        </LoaderCard>
        <LoaderCard>
          <StandardLoader />
        </LoaderCard>
        <LoaderCard>
          <StandardLoader />
        </LoaderCard>
      </Masonry>
    </>
  );
};

export default DashboardComponentLoader;
