import * as chrono from 'chrono-node';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import DatePicker from '../../../components/dealsBreakdown/DatePicker';
import Loading from '../../../components/Loading';
import { InsightsQuery } from './InsightsQuery';
import { DATE_FORMAT } from '../../../utils/Utils';
import coursesService from '../../../services/course.service';
import AutoComplete from '../../../components/AutoComplete';
import NoDataFound from '../../../components/commons/NoDataFound';
import ButtonFilterDropdown from '../../../components/commons/ButtonFilterDropdown';
import { reportPages } from '../../../utils/constants';
export const InsightsTableFilters = ({
  dateRange,
  insight,
  insightName,
  render,
  setDateRange,
}) => {
  const [reportPage, setReportPage] = useState(reportPages[0]);
  const format = DATE_FORMAT;
  const [course, setcourse] = useState([]);
  const [queryFilters, setQueryFilters] = useState([]);
  // const [reportType, setReportType] = useState(ReportType.Course);  //TODO
  if (!dateRange || !setDateRange) {
    [dateRange, setDateRange] = useState(dateRange);
  }

  const [query, setQuery] = useState(insight);

  const isQueryReady = () => {
    return query && Object.keys(query).length > 0;
  };
  useEffect(() => {
    const queryis = query;
    if (query && Object.keys(query).length > 0 && queryFilters.length > 0) {
      const courseIds = queryFilters.map((course) => course.id.toString());
      if (courseIds[0] === '-1') {
        queryis.filters = [];
      } else {
        const courseFilter = queryis.filters.find(
          (filter) =>
            filter.operator === 'equals' && filter.member === 'Course.id'
        );
        const isSameFilter =
          courseIds.length === courseFilter?.values.length &&
          courseIds.every((id) => courseFilter?.values.includes(id));
        if (isSameFilter) {
          return;
        }

        if (courseFilter) {
          queryis.filters.forEach((filter) => {
            if (filter.operator === 'equals' && filter.member === 'Course.id') {
              filter.values = courseIds;
            }
          });
        } else {
          const filter = {};
          filter.operator = 'equals';
          filter.member = 'Course.id';
          filter.values = courseIds;
          queryis.filters.push(filter);
        }
      }
    } else {
      queryis.filters = [];
    }

    setQuery({});
    // just emptying query and re-fetching it after some ms.
    // just a hack for now
    setTimeout(() => {
      const courseProgressFilter = queryis.filters.find(
        (filter) =>
          filter.operator === 'gt' &&
          filter.member === 'CourseProgress.progress'
      );
      if (!courseProgressFilter?.values.length) {
        const filter = {};
        filter.operator = 'gt';
        filter.member = 'CourseProgress.progress';
        filter.values = ['1'];
        queryis.filters.push(filter);
      }
      setQuery(queryis);
    });
  }, [queryFilters]);

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
    (async () => {
      const { data } = await coursesService.getCourses({ page: 1, limit: 100 });
      // add All option in dropdown
      data.unshift({ id: -1, name: 'All courses' });
      setQueryFilters([]);
      setcourse(data);
    })();
  }, []);

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
  const Title = () => {
    return <div>{'No course selected, Please select a course'}</div>;
  };
  return (
    <>
      <Card>
        <Card.Header className="justify-content-between">
          <h4 className="card-title text-hover-primary mb-0">{insightName}</h4>
          <div className="w-35">
            <AutoComplete
              id={`courses_id`}
              placeholder="Select Course"
              name={`courses_id}`}
              data={course}
              customKey="name"
              onChange={(items, itemToRemove) => {
                // Added logic for select All options, when selected only select select all
                if (items.length > 0 && items[items.length - 1].id === -1) {
                  setQueryFilters(items.filter((t) => t.id === -1));
                } else {
                  setQueryFilters(items.filter((t) => t.id !== -1));
                }
              }}
              isMultiple={true}
              showClear={false}
              selected={queryFilters || ''}
            />
          </div>
          <div className="d-sm-flex justify-content-sm-end align-items-sm-center">
            <DatePicker
              range={dateRange}
              setRange={setDateRange}
              disablePastDate
              extraClass="p-0"
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
        {query && Object.keys(query).length > 0 && queryFilters.length > 0 ? (
          <InsightsQuery query={query} render={render} setQuery={setQuery} />
        ) : (
          <NoDataFound
            icon="manage_search"
            containerStyle="text-gray-900 my-6 py-6"
            title={<Title />}
          />
        )}
      </Card>
    </>
  );
};
