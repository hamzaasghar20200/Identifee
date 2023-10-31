import { Card, CardBody } from 'reactstrap';
import TextRoundBlock from './TextRoundBlock';
import MaterialIcon from '../../commons/MaterialIcon';
import React from 'react';

const ElectronicPaymentsSavingsBlock = ({
  title,
  source,
  texts,
  clientClasses,
  whenPrinting,
}) => {
  return (
    <div
      className={`${clientClasses} ${
        whenPrinting ? 'mb-1 px-5' : 'mb-2 px-3 pb-0'
      }`}
    >
      <Card>
        <CardBody className={`bg-primary-soft ${whenPrinting ? 'py-2' : ''}`}>
          <h5 className="text-left d-flex justify-content-between mb-1 d-flex align-items-center gap-1">
            {title}
            {source && (
              <span className="fs-9 text-muted font-weight-normal">
                {source}
              </span>
            )}
          </h5>

          <div
            className={`d-flex align-items-center gap-2 justify-content-center ${
              whenPrinting ? 'pt-0' : 'pt-2'
            }`}
          >
            <TextRoundBlock
              big="$2.98"
              small="Cash Per Check"
              color="text-danger"
            />
            <MaterialIcon icon="arrow_forward" clazz="font-size-2em" />
            <TextRoundBlock
              big="$0.30"
              color="rpt-green-box-heading"
              small="Per Card Transaction"
              bg="#ffffff"
            />
            <MaterialIcon icon="equal" symbols clazz="font-size-2em" />
            <TextRoundBlock
              big="$0.25"
              color="rpt-green-box-heading"
              small="Per ACH Transaction"
              bg="#ffffff"
            />
          </div>
          <div className={whenPrinting ? 'mt-1 fs-10' : 'mt-3 fs-9'}>
            {texts.map((txt, index) => (
              <p
                className={
                  index >= texts?.length - 1 || whenPrinting ? 'mb-0' : ''
                }
                key={index}
              >
                {txt}
              </p>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
export default ElectronicPaymentsSavingsBlock;
