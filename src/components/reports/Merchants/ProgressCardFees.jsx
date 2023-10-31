import { Card } from 'react-bootstrap';
import { ProgressCircleDefaultWithLabels } from '../../commons/Progress';

export const ProgressCardFees = ({ data, startDownload, readOnly }) => {
  return (
    <Card className="mt-3 h-100">
      <Card.Body className={`${startDownload ? 'px-3' : ''}`}>
        <div>
          <p
            className={`${
              startDownload ? 'mb-3 font-size-sm' : 'mb-5 font-size-md'
            }`}
          >
            {data?.name}
          </p>
          <ProgressCircleDefaultWithLabels
            label={true}
            now={data?.progress}
            value={data?.progress}
            strokeWidth={7}
            textColor={data?.textColor}
            classnames={`${
              startDownload ? 'progress-circle-pdf' : 'progress-circle-size'
            } m-auto`}
            variant={data?.variant}
          />
          <p
            className={`mb-0 ${
              startDownload
                ? 'px-0  mt-4 font-size-sm2'
                : ' mt-5 px-3 font-size-sm2'
            }`}
          >
            {data?.description}
          </p>
          <p
            className={`font-weight-bold mt-2 ${
              startDownload ? 'mb-0 px-0 font-size-sm' : ''
            }`}
          >
            {data?.boldText}
          </p>
        </div>
      </Card.Body>
    </Card>
  );
};
