import React, { useEffect, useState } from 'react';
import activityService from '../../services/activity.service';
import Skeleton from 'react-loading-skeleton';

const Counter = ({ max }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (count < max) {
        setCount(count + 1);
      }
    }, 2);

    return () => clearInterval(interval);
  }, [count, max]);

  return <span>{count}</span>;
};

const StatItem = ({ label, count, classNames }) => {
  return (
    <div className={`statsDiv cursor-pointer text-black  ${classNames || ''}`}>
      <div className="d-flex align-items-center justify-content-center gap-1">
        <label className="mb-0 font-weight-normal cursor-pointer">
          {label}
        </label>
        <span className="text-gray-400">•</span>
        <label className="mb-0 font-weight-bold cursor-pointer">
          <Counter max={count} />
        </label>
      </div>
    </div>
  );
};

const ActivityStats = ({
  tab,
  updateFilter,
  selectedCount,
  call,
  event,
  task,
}) => {
  const [loader, setLoader] = useState(false);
  const [stats, setStats] = useState({});
  const getStats = async () => {
    try {
      setLoader(true);
      const { data } = await activityService.getStats();
      setStats(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoader(false);
    }
  };
  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  useEffect(() => {
    getStats();
  }, []);

  const getCounts = () => {
    if (tab === 'all') {
      return (
        <>
          <ul>
            <li
              className="font-size-sm2"
              onClick={() =>
                updateFilter('changeTab', capitalizeFirstLetter(task))
              }
            >
              <StatItem count={stats?.counts?.task} label={task} />
            </li>
            <li
              className="font-size-sm2"
              onClick={() =>
                updateFilter('changeTab', capitalizeFirstLetter(event))
              }
            >
              <StatItem count={stats?.counts?.event} label={event} />
            </li>
            <li
              className="font-size-sm2"
              onClick={() =>
                updateFilter('changeTab', capitalizeFirstLetter(call))
              }
            >
              <StatItem count={stats?.counts?.call} label={call} />
            </li>
          </ul>
        </>
      );
    } else {
      const tabTitle = tab.charAt(0).toUpperCase() + tab.slice(1);
      return (
        <>
          <ul>
            <li className="font-size-sm2" onClick={() => updateFilter('all')}>
              <StatItem
                count={stats?.counts?.[tab]}
                label={`Total ${tabTitle
                  .replace(/Task/g, task)
                  .replace(/Event/g, event)
                  .replace(/Call/g, call)}`}
                classNames={
                  selectedCount === 'all' ? 'bg-primary text-white' : ''
                }
              />
            </li>
            <li
              className="font-size-sm2"
              onClick={() => updateFilter('pending')}
            >
              <StatItem
                count={stats?.pending?.[tab]}
                label={`Open ${tabTitle
                  .replace(/Task/g, task)
                  .replace(/Event/g, event)
                  .replace(/Call/g, call)}`}
                classNames={
                  selectedCount === 'pending' ? 'bg-primary text-white' : ''
                }
              />
            </li>
            <li
              className="font-size-sm2"
              onClick={() => updateFilter('completed')}
            >
              <StatItem
                count={stats?.completed?.[tab]}
                label={`Completed`}
                classNames={
                  selectedCount === 'completed' ? 'bg-primary text-white' : ''
                }
              />
            </li>
            <li
              className="font-size-sm2"
              onClick={() => updateFilter('overdue')}
            >
              <StatItem
                count={stats?.overdue?.[tab]}
                label={`Overdue`}
                classNames={
                  selectedCount === 'overdue' ? 'bg-primary text-white' : ''
                }
              />
            </li>
          </ul>
        </>
      );
    }
  };

  return (
    <div className="stats">
      {loader ? (
        <ul className="w-100">
          <li className="flex-fill">
            <Skeleton className="w-100" height={10} />
          </li>
        </ul>
      ) : (
        getCounts()
      )}
    </div>
  );
};

export default ActivityStats;
