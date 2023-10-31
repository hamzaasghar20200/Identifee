import { isToFixedNoRound } from '../../../../utils/Utils';

const Percentage = ({ value }) => {
  const foreClass = value < 0 ? 'text-danger' : 'text-success';
  return (
    <div className="d-flex align-items-center">
      <span className={`${foreClass} font-weight-semi-bold`}>
        {!isNaN(value) ? Math.abs(value) : '0'}%
      </span>
    </div>
  );
};

const KpiGrowthIndexWidget = ({ data, monthYearString }) => {
  return (
    <div className="d-flex align-items-center px-0">
      <div>
        <h1 className="font-size-3em">
          <Percentage value={data.percentage} />
        </h1>
      </div>
      <div className="ml-2">
        <p className="mb-0 pb-0">{isToFixedNoRound(data.count) || '$0'}</p>
        <span className="text-muted font-size-xs">
          Last {monthYearString}: {isToFixedNoRound(data.lastMonth) || '$0'}
        </span>
      </div>
    </div>
  );
};

export default KpiGrowthIndexWidget;
