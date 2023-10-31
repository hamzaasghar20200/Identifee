import { CardBody } from 'reactstrap';
import React from 'react';

const TextRoundBlock = ({
  big,
  small,
  color,
  bg = 'rgba(255, 255, 255, 0.50)',
}) => {
  return (
    <div
      className="shadow-lg"
      style={{
        borderRadius: 'var(--borderRadiusLg)',
        background: bg,
      }}
    >
      <CardBody className="text-center py-2">
        <h1 className={`mb-0 font-weight-bold ${color}`}>{big || 0}</h1>
        <p className="mb-0 fs-10">{small}</p>
      </CardBody>
    </div>
  );
};

export default TextRoundBlock;
