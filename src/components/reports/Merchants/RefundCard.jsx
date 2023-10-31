import React from 'react';
import { Card } from 'react-bootstrap';
export const RefundCard = ({ data, startDownload }) => {
  return (
    <Card className="h-100">
      <Card.Body className={startDownload ? 'p-3' : ''}>
        <h4 className={`text-left font-size-sm2 mb-0`}>{data?.name}</h4>
        <div
          className={`${
            startDownload
              ? 'merchant-progress-pdf mt-2'
              : 'merchant-progress mt-3'
          } rounded-lg`}
          style={{
            backgroundColor: `${data?.varient}`,
            color: `${data?.textColor}`,
          }}
        >
          <span>{data?.progress}%</span>
        </div>
        <p
          className={`mb-0 mt-3 px-3 ${
            startDownload ? 'font-size-xs' : 'font-size-sm2'
          }`}
          style={{ lineHeight: '20px' }}
        >
          {data?.description}
        </p>
      </Card.Body>
    </Card>
  );
};
