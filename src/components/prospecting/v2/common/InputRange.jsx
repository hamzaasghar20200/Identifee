import React, { useEffect, useState } from 'react';
import TooltipComponent from '../../../lesson/Tooltip';
import MaterialIcon from '../../../commons/MaterialIcon';
const InputRange = ({
  data,
  setData,
  onEnter,
  label = 'Radius',
  keyType,
  keyFilter,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [refresh, setRefresh] = useState(0);

  const updateData = (newData) => {
    const payload = {
      ...data,
      [keyType]: {
        ...data[keyType],
        [keyFilter]: `::~${newData}mi`,
      },
    };
    setData({ type: 'set', payload });
    if (data?.location?.location?.length) {
      setRefresh((prevState) => prevState + 1);
    }
  };

  const handleInputChange = (e) => {
    const miles = e.currentTarget.value;
    setCurrentStepIndex(miles);
    updateData(miles);
  };

  useEffect(() => {
    onEnter();
  }, [refresh]);

  return (
    <div className="mb-2 mt-3">
      <div className="mt-2 mb-0 text-capitalize font-weight-semi-bold fs-7 d-flex align-items-center">
        <span>
          {label} <span className="text-lowercase">(mi)</span>
        </span>
        <TooltipComponent title="Optionally set radius (mi) from the city. Note: Leaving at 'Nearby' will disable this feature.">
          <a href="" className="text-muted ml-1">
            <MaterialIcon icon="help" />{' '}
          </a>
        </TooltipComponent>
      </div>
      <div className="position-relative">
        <input
          onInput={handleInputChange}
          type="range"
          min="0"
          value={currentStepIndex}
          max="100"
          step="25"
          list="tick-list"
          className="w-100 form-range text-secondary"
        />
        <datalist id="tick-list">
          <option>0</option>
          <option>25</option>
          <option>50</option>
          <option>75</option>
          <option>100</option>
        </datalist>
        <div className="ticks">
          <span className="tick-text">Nearby</span>
          <span className="tick-text">25</span>
          <span className="tick-text">50</span>
          <span className="tick-text">75</span>
          <span className="tick-text">100</span>
        </div>
        <div
          className="bg-primary position-absolute"
          style={{
            width: currentStepIndex + '%',
            height: 7,
            borderRadius: 8,
            top: 8,
          }}
        />
      </div>
    </div>
  );
};

export default InputRange;
