import { ChecklistStatuses } from '../../utils/checklist.constants';
import React from 'react';

const ChecklistStatus = ({ item }) => {
  return (
    <span
      className={`badge badge-lg label ${
        item?.status?.color || ChecklistStatuses.InProgress.color
      }`}
    >
      {item?.status?.text || ChecklistStatuses.InProgress.text}
    </span>
  );
};
export default ChecklistStatus;
