import React, { useState, useEffect } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { Col } from 'react-bootstrap';

import Card from './Cards';
import ButtonIcon from '../../components/commons/ButtonIcon';
import Skeleton from 'react-loading-skeleton';

const Columns = ({
  id,
  title,
  color,
  onGetDeals,
  setNotification,
  loading,
  onClick,
  value,
  onAddDeal,
}) => {
  const { deal_type, header, pagination, items } = value;
  const [load, setLoad] = useState(false);

  useEffect(() => {
    if (load) setLoad(false);
  }, [value]);

  const handleAddDeal = (e) => {
    e?.preventDefault();
    onAddDeal();
  };

  return (
    <Col className="px-1 deal-col pipelines-board-col">
      <div>
        {value.loading ? (
          <Skeleton count={6} height={80} className="my-2 d-block w-100" />
        ) : (
          <Droppable droppableId={title}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`column-deal ${
                  snapshot.isDraggingOver ? 'bg-gray-300 vh-100' : ''
                }`}
              >
                {items?.length === 0 ? (
                  <div className="d-flex align-items-center justify-content-center py-6 my-6">
                    <h5 className="text-muted font-weight-medium">
                      This stage is empty
                    </h5>
                  </div>
                ) : (
                  items?.map((deal, index) => (
                    <Card
                      key={deal.id}
                      tenant_deal_stage_id={deal.tenant_deal_stage_id}
                      deal={deal}
                      index={index}
                      onGetDeals={onGetDeals}
                      setNotification={setNotification}
                      loading={loading}
                      onAddDeal={handleAddDeal}
                    />
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        )}
        {pagination?.page < pagination?.totalPages ? (
          <ButtonIcon
            classnames="w-100 my-1 z-index-10"
            loading={load}
            disabled={load}
            label={'Load more'}
            onClick={() => {
              onClick(
                { name: deal_type, id: header.tenant_deal_stage_id },
                pagination?.page + 1,
                true
              );
              setLoad(true);
            }}
          />
        ) : null}
      </div>
    </Col>
  );
};

export default Columns;
