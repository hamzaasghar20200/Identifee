import React from 'react';
import { ProgressBar } from 'react-bootstrap';
import {
  CircularProgressbar,
  buildStyles,
  CircularProgressbarWithChildren,
} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export const ProgressBarDefault = ({ now = 0, variant, label = '' }) => {
  return (
    <div className="w-100 d-flex justify-content-center align-items-center text-primary fw-bold">
      <ProgressBar
        now={parseInt(now)}
        className={label ? 'w-100' : 'w-75 mx-2'}
        variant={variant}
      />
      {label ? (
        ''
      ) : (
        <span className={variant ? 'text-success' : 'text-primary'}>
          {parseFloat(now)?.toFixed(2)}%
        </span>
      )}
    </div>
  );
};

export const ProgressCircleDefault = ({
  now,
  label = false,
  classnames,
  simple,
}) => {
  const nowParsed = parseInt(now);
  return (
    <div className={`size-progress-circle ${classnames}`}>
      {nowParsed !== 100 && (
        <CircularProgressbar
          value={parseInt(now)}
          text={label && `${parseFloat(now)?.toFixed(2)}%`}
          styles={buildStyles({
            textColor: 'red',
            pathColor: 'var(--secondaryColor)',
            trailColor: 'lightgray',
          })}
          strokeWidth={10}
        />
      )}
      {nowParsed === 100 && !simple && (
        <CircularProgressbarWithChildren
          value={now}
          strokeWidth={50}
          styles={buildStyles({
            pathColor: 'var(--secondaryColor)',
            strokeLinecap: 'butt',
          })}
        >
          <span className="material-icons-outlined text-white">done</span>
        </CircularProgressbarWithChildren>
      )}
    </div>
  );
};

export const ProgressCircleDefaultWithLabels = ({
  now,
  label = false,
  classnames,
  simple,
  variant,
  value,
  textColor,
  strokeWidth,
}) => {
  const nowParsed = parseInt(now);
  return (
    <div className={`size-progress-circle ${classnames}`}>
      {nowParsed !== 100 && (
        <CircularProgressbar
          value={parseInt(now)}
          text={
            label && !value ? `${parseFloat(now)?.toFixed(2)}%` : `${value}%`
          }
          styles={buildStyles({
            textColor: `${textColor || 'red'}`,
            pathColor: `${variant || 'var(--secondaryColor)'}`,
            trailColor: 'lightgray',
          })}
          strokeWidth={strokeWidth || 10}
        />
      )}
      {nowParsed === 100 && !simple && (
        <CircularProgressbarWithChildren
          value={now}
          strokeWidth={50}
          styles={buildStyles({
            pathColor: 'var(--secondaryColor)',
            strokeLinecap: 'butt',
          })}
        >
          <span className="material-icons-outlined text-white">done</span>
        </CircularProgressbarWithChildren>
      )}
    </div>
  );
};
