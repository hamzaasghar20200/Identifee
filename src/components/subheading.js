import { Row, Col } from 'reactstrap';

export default function SubHeading({ title, headingStyle = 'mt-3 mb-2' }) {
  return (
    <Row>
      <Col className="mb-2">
        <h4 className={headingStyle}>{title}</h4>
      </Col>
    </Row>
  );
}
