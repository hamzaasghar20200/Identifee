import React from 'react';

const HorizontalLines = ({ count, lineHeight = 15, withIntervals }) => {
  const rowCount = Array(count).fill(0);
  return (
    <div>
      {rowCount.map((r, idx) => (
        <div
          key={idx}
          className="border-bottom position-relative"
          style={{ height: lineHeight }}
        >
          {withIntervals && (
            <span
              className="position-absolute text-center fs-11"
              style={{ left: -20, bottom: -5 }}
            >
              {withIntervals[idx]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};
const VerticalBars = ({ barData, barStyle }) => {
  const barValues = barData.map((m) => m.value);
  const maxValue = Math.max(...barValues);
  const heightRatio = 121 / maxValue; // 121 is max canvas height
  return (
    <div className="position-absolute w-100 bottom-0">
      <div className="d-flex align-items-end justify-content-between">
        {barData.map((d, index) => (
          <div
            key={index}
            className={`position-relative rounded-top ${d.clazz}`}
            style={{
              ...barStyle,
              height: d.multiply
                ? `${d.value * d.multiply}px`
                : `${
                    d.value * heightRatio < 50 ? 50 : d.value * heightRatio
                  }px`,
              background: `hsl(var(--primaryColorHsl), ${d.color}, ${d.color})`,
            }}
          >
            {d.percentage ? (
              <div
                className="position-absolute rounded-circle text-center d-flex abs-center font-weight-semi-bold justify-content-center fs-12 font-weight-semi-bold align-items-center bg-white border"
                style={{
                  top: `-${d.value + 10}px`,
                  height: 28,
                  width: 28,
                  boxShadow: '10px 10px 50px #444',
                }}
              >
                {d.percentage}
              </div>
            ) : (
              <div
                className="position-absolute text-center d-flex abs-center-xy font-weight-bold justify-content-center text-white font-size-lg align-items-center"
                style={{
                  height: 28,
                  width: 28,
                }}
              >
                {d.value}
                {d?.symbol || ''}
              </div>
            )}
            <div
              className="position-absolute text-nowrap abs-center fs-12 font-weight-semi-bold"
              style={{
                bottom: `-15px`,
              }}
            >
              {d.key}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReportBarChart = ({
  linesCount,
  barData,
  lineHeight = 15,
  chartStyle,
  barStyle,
  withIntervals,
}) => {
  return (
    <div className="position-relative w-100 m-auto" style={chartStyle}>
      <HorizontalLines
        count={linesCount}
        lineHeight={lineHeight}
        withIntervals={withIntervals}
      />
      <VerticalBars barData={barData} barStyle={barStyle} />
    </div>
  );
};

export default ReportBarChart;
