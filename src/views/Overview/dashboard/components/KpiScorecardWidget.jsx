import { Col, Row } from 'reactstrap';

const Percentage = ({ value }) => {
  const bgClass = value < 0 ? 'bg-danger' : 'bg-success';
  return (
    <div
      className={`d-flex ${bgClass} font-size-sm2 align-items-center rounded-1 justify-content-center`}
    >
      <span className={`text-white font-weight-semi-bold`}>
        {Math.abs(value)}%
      </span>
    </div>
  );
};

const KpiScorecardWidget = ({ data }) => {
  return (
    <div>
      {data.map((item, index) => {
        return item.count > 0 ? (
          <Row key={index} className="font-size-sm2 py-3 px-4 border-bottom">
            <Col md={6}>
              <div className="d-flex font-weight-medium align-items-center">
                <span>{index + 1}.</span>
                <span className="ml-1 text-capitalize">{item.name}</span>
              </div>
            </Col>
            <Col md={3} className="text-center">
              {item.count}
            </Col>
            <Col md={3} className="text-center">
              <Percentage value={item.percentage} />
            </Col>
          </Row>
        ) : (
          <></>
        );
      })}
    </div>
  );
};

export default KpiScorecardWidget;
