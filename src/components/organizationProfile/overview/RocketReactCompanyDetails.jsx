import { Col, Row } from 'reactstrap';
import { roundNumbers } from '../../../utils/Utils';
import MaterialIcon from '../../commons/MaterialIcon';

const RocketReactCompanyDetails = ({ prospect }) => {
  return (
    <Row>
      <Col md={6} className="text-center">
        <h4 className="font-weight-bolder mb-0">
          {roundNumbers(prospect?.employees)}
        </h4>
        <p className="font-size-sm2 text-nowrap">Employees</p>
      </Col>
      <Col md={6} className={`text-center`}>
        <>
          {prospect?.revenue ? (
            <>
              <h4 className="font-weight-bolder mb-0">
                ${roundNumbers(prospect?.revenue)}
              </h4>
              <p className="font-size-sm2 text-nowrap">Revenue</p>
            </>
          ) : (
            <div className="font-weight-bolder">
              {' '}
              <MaterialIcon icon="minimize" />{' '}
            </div>
          )}
        </>
      </Col>
    </Row>
  );
};

export default RocketReactCompanyDetails;
