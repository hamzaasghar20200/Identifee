import { Card, CardBody } from 'reactstrap';
import React from 'react';

const ReferencesBlock = ({ whenPrinting }) => {
  return (
    <div className={whenPrinting ? 'px-5' : 'px-3'}>
      <Card className={whenPrinting ? 'mb-0' : 'mb-2'}>
        <CardBody className={whenPrinting ? 'py-2' : ''}>
          <h5 className="text-left mb-1 d-flex align-items-center gap-1">
            References
          </h5>
          <p
            className={`text-muted ${
              whenPrinting ? 'fs-10 mb-0' : 'fs-8 mb-1'
            } text-left`}
          >
            <div className="d-flex align-items-center gap-1">
              <sup style={{ top: '-1.2em', right: '-0.1rem' }}>1</sup>
              AFP® 2022 Payments Fraud and Control Report Copyright © 2022 by
              the Association for Financial Professionals (AFP). All Rights
              Reserved.
            </div>
          </p>
        </CardBody>
      </Card>
    </div>
  );
};
export default ReferencesBlock;
