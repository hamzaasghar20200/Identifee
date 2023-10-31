import { ListGroup, ListGroupItem } from 'react-bootstrap';
import BaseBlock from '../reportbuilder/blocks/BaseBlock';
import Skeleton from 'react-loading-skeleton';
import React from 'react';

const ReportBlock = ({ rows, containerStyle }) => {
  const rowCount = Array(rows).fill(0);
  const height = 10;
  return (
    <ListGroup>
      {rowCount.map((rr, index) => (
        <ListGroupItem key={index} className={containerStyle}>
          <BaseBlock
            showAdd={false}
            partner={
              <p className="mb-0 float-right d-inline-block">
                <Skeleton height={height} width={50} />{' '}
              </p>
            }
            direction={'flex-row-reverse'}
            dataBlock={
              <div className="d-flex flex-column align-items-center justify-content-center">
                <p className="mb-0" style={{ height: 100, width: 100 }}>
                  <Skeleton circle width={90} height={90} />{' '}
                </p>
                <p className="font-size-xs mb-0 font-weight-semi-bold">
                  <Skeleton height={height} width={100} />
                </p>
              </div>
            }
            textBlock={
              <>
                <p className="mb-2">
                  <Skeleton height={height} width={400} />{' '}
                </p>
                <p className="mb-0">
                  <Skeleton height={height} width={300} />{' '}
                </p>
              </>
            }
          />
        </ListGroupItem>
      ))}
    </ListGroup>
  );
};

export default ReportBlock;
