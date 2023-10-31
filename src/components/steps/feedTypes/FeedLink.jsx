import React from 'react';
import { Image } from 'react-bootstrap';
export const items = () => {
  return [
    {
      id: 'del',
      icon: 'delete',
      name: 'Delete',
    },
  ];
};

const FeedLink = ({ isOwner, data }) => {
  return (
    <div className="card">
      <div className="card-body">
        <div className={`d-flex`}>
          <div className="text-left flex-grow-1">
            <p className="prospect-typography-h4 p-0 mb-1 text-wrap font-weight-semi-bold">
              <a
                href={data.url}
                target="_blank"
                rel="noreferrer"
                className="text-dark"
              >
                {data.title}
              </a>
            </p>
          </div>
          <div className="ml-3">
            <a href={data.url} target="_blank" rel="noreferrer">
              <Image
                className="cursor-pointer"
                rounded="true"
                src={`${data.image}`}
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

FeedLink.defaultProps = {
  data: {},
};

export default FeedLink;
