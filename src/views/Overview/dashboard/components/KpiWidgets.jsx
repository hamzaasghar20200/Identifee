import React, { useState } from 'react';
import { StaticComponentsByType } from '../dashboard.constants';
import Masonry from 'react-masonry-css';
import WidgetWrapper from './WidgetWrapper';

const KpiWidgets = ({ onComponentSelect }) => {
  const [kpiComponents, setKpiComponents] = useState(
    StaticComponentsByType.KPI
  );
  const handleWidgetClick = (item) => {
    setKpiComponents(
      [...kpiComponents].map((cmp) => ({
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
      {kpiComponents.map((component, index) => {
        return (
          <WidgetWrapper
            key={index}
            component={{
              ...component,
              onClick: () => handleWidgetClick(component),
            }}
          />
        );
      })}
    </Masonry>
  );
};

export default KpiWidgets;
