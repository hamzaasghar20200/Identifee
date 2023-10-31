import * as chrono from 'chrono-node';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import DatePicker from '../../../components/dealsBreakdown/DatePicker';
import Loading from '../../../components/Loading';
import { InsightsQuery } from './InsightsQuery';
import { DATE_FORMAT } from '../../../utils/Utils';
import ButtonFilterDropdown from '../../../components/commons/ButtonFilterDropdown';
import { reportPages } from '../../../utils/constants';

export const InsightsTable = ({
  dateRange,
  insight,
  insightName,
  render,
  setDateRange,
}) => {
  const [reportPage, setReportPage] = useState(reportPages[0]);
  const format = DATE_FORMAT;

  if (!dateRange || !setDateRange) {
    [dateRange, setDateRange] = useState(dateRange);
  }

  const [query, setQuery] = useState(insight);

  const isQueryReady = () => {
    return query && Object.keys(query).length > 0;
  };

  const compareRelativeTime = (timeDateRange) => {
    const parsedRange =
      chrono.parseDate(timeDateRange) || moment().subtract(6, 'months');
    const parsedStartDate = moment(parsedRange).format(format);
    const now = moment().format(format);
    const relativeRange = {
      isSame: false,
      startDate: parsedStartDate,
      endDate: now,
    };

    if (dateRange) {
      const startDate = moment(dateRange.startDate).format(format);
      const endDate = moment(dateRange.endDate).format(format);
      relativeRange.isSame = startDate === parsedStartDate && endDate === now;
    }
    return relativeRange;
  };

  const getDateType = () => {
    const { startDate, endDate } = dateRange;
    const startDay = moment(startDate);
    const endDay = moment(endDate);

    return endDay.diff(startDay, 'days') > 31 ? 'month' : 'day';
  };

  useEffect(() => {
    setQuery(insight);
  }, [insightName]);

  // Initialize date range here as we want to initialize with the query
  // value. If not provided, fallback to 90 days
  useEffect(() => {
    if (!isQueryReady()) {
      return;
    }

    if (query.timeDimensions) {
      const [{ dateRange: timeDateRange }] = query.timeDimensions;
      if (typeof timeDateRange !== 'string') {
        return;
      }
      const relativeTime = compareRelativeTime(timeDateRange);
      if (relativeTime.isSame) {
        return;
      }

      setDateRange({
        startDate: relativeTime.startDate,
        endDate: relativeTime.endDate,
      });
    } else {
      const relativeDate = chrono.parseDate('from 90 day ago to now');
      setDateRange({
        startDate: moment(relativeDate).format(format),
        endDate: moment().format(format),
      });
    }
  }, [query]);

  useEffect(() => {
    if (!isQueryReady() || !dateRange) {
      return;
    }

    const [{ dateRange: timeDateRange, granularity }] = query.timeDimensions;

    const startDate = moment(dateRange.startDate).format(format);
    const endDate = moment(dateRange.endDate).format(format);

    if (timeDateRange) {
      if (
        Array.isArray(timeDateRange) &&
        timeDateRange.length === 2 &&
        startDate === timeDateRange[0] &&
        endDate === timeDateRange[1]
      ) {
        return;
      } else if (typeof timeDateRange === 'string') {
        const relativeTime = compareRelativeTime(timeDateRange);
        if (relativeTime.isSame) {
          return;
        }
      }
    }
    const dateType = getDateType();
    if (granularity && granularity !== dateType) {
      query.timeDimensions[0].granularity = dateType;
    }

    setQuery({
      ...query,
      timeDimensions: [
        {
          ...query.timeDimensions[0],
          dateRange: [
            moment(dateRange.startDate).format(format),
            moment(dateRange.endDate).format(format),
          ],
        },
      ],
    });
  }, [dateRange]);

  useEffect(() => {
    if (!isQueryReady() || !reportPage) {
      return;
    }
    if (reportPage.key === 'all') {
      delete query.limit;
      setQuery({
        ...query,
      });
    } else {
      setQuery({
        ...query,
        limit: parseInt(reportPage.key),
      });
    }
  }, [reportPage]);

  if (!isQueryReady() || !dateRange) {
    return <Loading />;
  }

  return (
    <>
      <Card>
        <Card.Header className="justify-content-between">
          <h4 className="card-title text-hover-primary mb-0">{insightName}</h4>
          <div className="d-sm-flex justify-content-sm-end align-items-sm-center">
            <DatePicker
              range={dateRange}
              setRange={setDateRange}
              disablePastDate
              extraClass="mx-1"
            />
            <ButtonFilterDropdown
              buttonText="Timeline"
              options={reportPages}
              filterOptionSelected={reportPage}
              handleFilterSelect={(e, item) => {
                setReportPage(item);
              }}
            />
          </div>
        </Card.Header>
        <InsightsQuery query={query} render={render} setQuery={setQuery} />
      </Card>
    </>
  );
};
