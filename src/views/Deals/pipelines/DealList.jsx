import React from 'react';
import { Card } from 'react-bootstrap';

import DealTable from '../../../components/deals/DealTable';

const DealList = ({
  allDeals,
  pagination,
  onPaginationChange,
  showLoading,
  service,
  onAddDeal,
  sortingTable,
  sortingOrder,
}) => {
  return (
    <Card>
      <DealTable
        data={allDeals}
        paginationInfo={pagination}
        onPageChange={(page) => onPaginationChange(page)}
        service={service}
        showLoading={showLoading}
        onAddDeal={onAddDeal}
        dataInDB={pagination?.totalPages > 1}
        sortingTable={sortingTable}
        sortingOrder={sortingOrder}
      />
    </Card>
  );
};

export default DealList;
