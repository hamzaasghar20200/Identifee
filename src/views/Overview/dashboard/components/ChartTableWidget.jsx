import { Col, Row } from 'reactstrap';

const ChartTableWidget = ({
  columns = ['Created by', 'Record Count'],
  data,
}) => {
  return (
    <div className="mw-100">
      <Row className="pt-1">
        {columns.map((col, index) => (
          <Col key={index} md={6}>
            <p className="mb-0 font-size-sm font-weight-semi-bold">{col}</p>
          </Col>
        ))}
      </Row>
      {data.map((item) => (
        <Row key={item?.id} className="pt-1 table-hover bg-hover-yellow">
          <Col md={6}>
            <p className="font-size-sm2 mb-0 text-capitalize">{item.name}</p>
          </Col>
          <Col md={6}>
            <p className="font-size-sm2 mb-0">{item.count}</p>
          </Col>
        </Row>
      ))}
    </div>
  );
};

export default ChartTableWidget;
