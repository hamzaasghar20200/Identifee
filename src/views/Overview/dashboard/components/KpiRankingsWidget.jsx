import { Col, Row } from 'reactstrap';

const KpiRankingsWidget = ({ data, listType, wrap = 'text-truncate' }) => {
  return (
    <div>
      {data.map((item, index) => {
        return item.count ? (
          <Row
            key={index}
            className={`font-size-sm2 align-items-center px-4 border-bottom ${
              item.revenue ? 'py-2' : 'py-3'
            }`}
          >
            <Col md={6}>
              <div className="d-flex font-weight-medium align-items-center">
                <span>{index + 1}.</span>
                <span
                  className={`ml-1 d-inline-block text-capitalize ${wrap}`}
                  style={{ minWidth: 250, maxWidth: 250 }}
                >
                  {item.name}
                </span>
              </div>
            </Col>
            <Col md={6} className="text-right">
              {item.revenue ? (
                <>
                  <p className="font-weight-medium mb-0">{item.revenue}</p>
                  <p className="text-muted font-size-sm text-right mb-0">
                    {item.count} {listType}
                  </p>
                </>
              ) : (
                <p className="text-right mb-0">
                  {item.count} {listType}
                </p>
              )}
            </Col>
          </Row>
        ) : (
          <></>
        );
      })}
    </div>
  );
};

export default KpiRankingsWidget;
