import React, { useState } from 'react';
import {
  ComponentsDisplayType,
  StaticComponentsByType,
} from '../dashboard.constants';
import Masonry from 'react-masonry-css';
import WidgetWrapper from './WidgetWrapper';

const ChartWidgets = ({ onComponentSelect }) => {
  const [chartComponents, setChartComponents] = useState(
    StaticComponentsByType.Chart
  );
  const handleWidgetClick = (item) => {
    setChartComponents(
      [...chartComponents].map((cmp) => ({
        ...cmp,
        isSelected: cmp.id === item.id,
      }))
    );
    onComponentSelect(item);
  };
  return (
    <Masonry
      breakpointCols={3}
      className="my-masonry-grid mt-2 px-3 pt-2 pb-0"
      columnClassName="my-masonry-grid_column"
    >
      {chartComponents.map((component) => {
        return (
          <WidgetWrapper
            key={component.id}
            component={{
              ...component,
              onClick: () => handleWidgetClick(component),
            }}
            withHeader={false}
            containerStyle={
              component.displayType !== ComponentsDisplayType.chart_table
                ? 'align-items-center'
                : ''
            }
          />
        );
      })}
    </Masonry>
  );
};

export default ChartWidgets;
