import {
  ComponentsDisplayType,
  getDisplayTypePretty,
} from '../dashboard.constants';
import { Card } from 'react-bootstrap';
import React from 'react';
import MaterialIcon from '../../../../components/commons/MaterialIcon';

const WidgetWrapper = ({
  component,
  withHeader = true,
  containerStyle,
  withFooter = true,
}) => {
  const ToComponent = component.component;
  const clazz =
    component.displayType === ComponentsDisplayType.kpi_rankings ||
    component.displayType === ComponentsDisplayType.kpi_scorecard
      ? 'p-0'
      : '';
  return (
    <div>
      <Card
        className={`setting-item cursor-pointer card-hover-shadow overflow-hidden ${containerStyle} ${
          component.isSelected ? 'border-green border' : ''
        }`}
        onClick={component.onClick}
      >
        {withHeader && (
          <Card.Header>
            <h4 className="card-title text-hover-primary mb-0">
              {component.name}
            </h4>
          </Card.Header>
        )}
        <Card.Body className={clazz}>
          <ToComponent data={component.data} style={component.style} />
        </Card.Body>
        {component.isSelected && (
          <span className="position-absolute" style={{ top: 5, right: 5 }}>
            <MaterialIcon
              icon="check_circle"
              clazz="text-green"
              filled
            ></MaterialIcon>
          </span>
        )}
      </Card>
      {withFooter && (
        <div className="text-center font-weight-medium py-2">
          {getDisplayTypePretty(
            component.displayType,
            component.displayType.includes('chart') ? ' chart' : ''
          )}
        </div>
      )}
    </div>
  );
};

export default WidgetWrapper;
