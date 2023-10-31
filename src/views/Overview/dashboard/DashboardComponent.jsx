import MoreActions from '../../../components/MoreActions';
import { AnalyticsQuery } from '../../../components/analytics';
import { ComponentsDisplayType } from './dashboard.constants';
import KpiRankingsWidget from './components/KpiRankingsWidget';
import _ from 'lodash';
import {
  DATE_FORMAT,
  isModuleAllowed,
  isPermissionAllowed,
  percentageChange,
} from '../../../utils/Utils';
import { useNewPermissionContext } from '../../../contexts/newPermissionContext';
import React, { useContext, useEffect, useState } from 'react';
import KpiStandardWidget from './components/KpiStandardWidget';
import { NO_DATA_AVAILABLE } from '../../../utils/constants';
import NoDataFound from '../../../components/commons/NoDataFound';
import KpiBasicWidget from './components/KpiBasicWidget';
import KpiGrowthIndexWidget from './components/KpiGrowthIndexWidget';
import ChartBarWidget from './components/ChartBarWidget';
import ChartColumnWidget from './components/ChartColumnWidget';
import ChartDonutWidget from './components/ChartDonutWidget';
import ChartLineWidget from './components/ChartLineWidget';
import ChartTableWidget from './components/ChartTableWidget';
import MaterialIcon from '../../../components/commons/MaterialIcon';
import TooltipComponent from '../../../components/lesson/Tooltip';
import moment from 'moment';
import ChartFunnelWidget from './components/ChartFunnelWidget';
import { TenantContext } from '../../../contexts/TenantContext';

const noData = () => {
  const Title = () => {
    return (
      <div className="text-gray-search font-size-sm">{NO_DATA_AVAILABLE}</div>
    );
  };
  return (
    <NoDataFound
      icon="analytics"
      containerStyle="text-gray-search my-0 h-100 py-0"
      iconStyle="font-size-3xl"
      title={<Title />}
    />
  );
};

const actionItems = [
  {
    id: 'edit',
    icon: 'edit',
    name: 'Edit',
  },
  {
    id: 'add',
    icon: 'layers',
    name: 'Insights View',
  },
  {
    id: 'remove',
    icon: 'delete',
    name: 'Delete',
  },
];

const getMonthYearStringFromTimeDimension = (timeDimensions) => {
  const compareDateRange =
    timeDimensions &&
    timeDimensions.length &&
    timeDimensions[0].compareDateRange;
  return compareDateRange.length > 0 && compareDateRange[1]?.split(' ')[1];
};

const getStandardGrowthIndexData = (component, results) => {
  const dataObject = results[0].data[0];
  const dataObjectLastMonth = results[1]?.data[0] || {};
  let count = 0;
  let lastMonth = '';
  let percentage = '';

  if (!_.isEmpty(dataObject)) {
    count = dataObject[component.analytic.measures[0]];
  }

  if (!_.isEmpty(dataObjectLastMonth)) {
    lastMonth = dataObjectLastMonth[component.analytic.measures[0]];
    percentage = percentageChange(lastMonth, count).toFixed(0);
  }

  return { count, percentage, lastMonth };
};

const formatDate = (v) => {
  return moment(v).format(DATE_FORMAT);
};

const getChartData = (component, data, withoutLabels) => {
  // this for something like this ["Abc"] | ["John", "Doe"], then make it like Abc | John, Doe
  const parseDataValue = (val) => {
    try {
      const arr = JSON.parse(val);
      return arr.length ? arr.join(',') : val;
    } catch (err) {
      try {
        return _.isDate(new Date(val))
          ? formatDate(new Date(val).toISOString().split('T')[0])
          : val;
      } catch (err2) {
        return val;
      }
    }
  };

  return {
    labels: withoutLabels
      ? []
      : data.map((d) =>
          parseDataValue(combineColumnsAndGetValue(component, d))
        ),
    datasets: [
      {
        label: '',
        data: data.map((d) => d[component.analytic.measures[0]]),
        backgroundColor: ['#082ace', '#28ae60', '#FF5A2D'],
      },
    ],
  };
};

const getTableData = (component, data) => {
  const { analytic } = component;
  // parsing dateString otherwise return whatever string we have
  const formatName = (val) => {
    try {
      return _.isDate(new Date(val))
        ? formatDate(new Date(val).toISOString().split('T')[0])
        : val;
    } catch (err) {
      return val;
    }
  };
  return {
    rows: data.map((item) => ({
      name: formatName(item[analytic.dimensions[0]]),
      count: item[analytic.measures[0]],
    })),
    columns: [analytic.dimensions[0], analytic.measures[0]].map(
      (val) => _.startCase(val.split('.')[1]) // converting Lesson.createdAt or Lesson.count to "Created At" and "Count"
    ),
  };
};

// this function combines [FirstName, LastName] etc. arrays and send one string back
const combineColumnsAndGetValue = (component, data) => {
  const dimensions = component.analytic.dimensions;
  const timeDimensions = component.analytic.timeDimensions;

  // this part removes the date from dimensions array to avoid showing in UI, it can be improved
  if (timeDimensions.length && dimensions.length > 1) {
    const timeDValue = timeDimensions.map((d) => d.dimension);
    const indexes = [];
    timeDValue.forEach((t) => {
      indexes.push(dimensions.indexOf(t));
    });

    indexes.forEach((id) => {
      if (id > -1) {
        dimensions.splice(id, 1);
      }
    });
  }

  let finalString = '';

  if (dimensions && dimensions.length) {
    finalString = dimensions.reduce((a, b) => {
      return `${data[a]} ${data[b]}`;
    });

    if (dimensions.length === 1) {
      finalString = data[dimensions[0]];
    }
  }

  return finalString;
};

const DashboardComponent = ({
  item,
  onHandleRemove,
  onHandleEdit,
  updatedQuery,
  onHandleView,
  componentHeight = 'h-100',
  config = {},
}) => {
  const { component } = item;
  const { displayType } = component.analytic;
  const isChartType = displayType.includes('chart_');
  const isChartTable = displayType.includes('_table');
  const [query, setQuery] = useState(updatedQuery || component.analytic);
  const { tenant } = useContext(TenantContext);
  const permissionContext = useNewPermissionContext();
  const [actionItemsList, setActionItemsList] = useState(actionItems);

  useEffect(() => {
    const { modules } = tenant;
    let allowReportsModule = true;
    if (modules !== '*') {
      allowReportsModule = isModuleAllowed(modules, 'reporting');
    }
    const allowReports = allowReportsModule
      ? isPermissionAllowed('insights', 'view', permissionContext)
      : false;
    const manageDashboard = isPermissionAllowed(
      'dashboard',
      'manage',
      permissionContext
    );
    const actions = actionItems.filter(function (item) {
      let isAllowed = false;
      if (item.name === 'Insights View' && allowReports) {
        isAllowed = true;
      } else if (
        (item.name === 'Edit' || item.name === 'Delete') &&
        manageDashboard
      ) {
        isAllowed = true;
      }

      return isAllowed;
    });
    setActionItemsList(actions);
  }, [permissionContext]);
  const cardStyling = {
    padding:
      displayType !== ComponentsDisplayType.kpi_rankings ||
      isChartType ||
      isChartTable
        ? ''
        : 'p-0',
    align:
      isChartType && !isChartTable
        ? 'text-center align-items-center d-flex justify-content-center'
        : '',
  };
  let chartData = {};
  let dataObject = {};
  let countVal;
  let list;

  // if config has hideActions true mean it is being opened from inside reports section
  const chartStyle = {
    height: config?.hideActions || config?.expand ? 400 : '100%',
    width: '100%',
  };

  const onHandleRefresh = () => {
    setQuery({});
    // just emptying query and re-fetching it after some ms.
    // just a hack for now
    setTimeout(() => {
      setQuery(component.analytic);
    });
  };

  return (
    <div
      className={`card setting-item overflow-x-hidden overflow-y-auto ${componentHeight}`}
    >
      <div className="card-header justify-content-between">
        <div className="d-flex align-items-center">
          <h4 className="card-title text-hover-primary mb-0">
            {config?.headingWithoutDash
              ? component.name.split('-')[0]?.trim()
              : component.name}
          </h4>
          <TooltipComponent title="Refresh">
            <a
              onClick={onHandleRefresh}
              className="refresh-icon cursor-pointer ml-1"
            >
              <MaterialIcon
                icon="refresh"
                clazz="text-gray-700 icon-hover-bg"
              />{' '}
            </a>
          </TooltipComponent>
        </div>
        {!config?.hideActions && (
          <MoreActions
            icon="more_horiz"
            items={actionItemsList}
            onHandleRemove={() => onHandleRemove(item)}
            onHandleEdit={() => onHandleEdit(item)}
            onHandleAdd={() => onHandleView(item)}
            toggleClassName="w-auto p-0 h-auto"
            iconStyle="icon-hover-bg"
          />
        )}

        {config?.customFilters && config.customFilters}
      </div>
      <div className={`card-body ${cardStyling.align} ${cardStyling.padding}`}>
        <AnalyticsQuery
          query={query}
          setQuery={setQuery}
          render={(results) => {
            const [{ data }] = results;
            // TODO: i am going to clean this up, once ready every widget/component rendering
            if (data.length === 0) {
              return noData();
            }
            switch (displayType) {
              case ComponentsDisplayType.kpi_rankings:
                list = data
                  .map((item) => {
                    return {
                      name: combineColumnsAndGetValue(component, item),
                      count: item[component.analytic.measures[0]],
                    };
                  })
                  .filter((item) => !!item);

                if (
                  list.length === 0 ||
                  list.every((item) => parseInt(item.count) === 0)
                ) {
                  return noData();
                }
                return (
                  <KpiRankingsWidget
                    data={list}
                    listType=""
                    wrap={config.wrap}
                  />
                );
              case ComponentsDisplayType.kpi_standard:
                if (results.length > 0) {
                  const { count, lastMonth, percentage } =
                    getStandardGrowthIndexData(component, results);
                  return (
                    <KpiStandardWidget
                      data={{ count, lastMonth, percentage }}
                    />
                  );
                } else {
                  return noData();
                }
              case ComponentsDisplayType.kpi_basic:
                dataObject = results[0]?.data[0];
                countVal = dataObject[component.analytic.measures[0]];
                return <KpiBasicWidget data={{ count: countVal }} />;
              case ComponentsDisplayType.kpi_growth_index:
                if (results.length > 0) {
                  const { count, lastMonth, percentage } =
                    getStandardGrowthIndexData(component, results);
                  const { timeDimensions } = component.analytic;
                  const monthYearString =
                    getMonthYearStringFromTimeDimension(timeDimensions);
                  return (
                    <KpiGrowthIndexWidget
                      data={{ count, lastMonth, percentage }}
                      monthYearString={monthYearString}
                    />
                  );
                } else {
                  return noData();
                }
              case ComponentsDisplayType.chart_column:
                chartData = getChartData(component, data);
                return (
                  <ChartColumnWidget
                    data={{
                      ...chartData,
                      style: chartStyle,
                    }}
                  />
                );
              case ComponentsDisplayType.chart_bar:
                chartData = getChartData(component, data);
                return <ChartBarWidget data={chartData} style={chartStyle} />;
              case ComponentsDisplayType.chart_donut:
                chartData = getChartData(component, data);
                return (
                  <ChartDonutWidget
                    data={{
                      ...chartData,
                      type: 'doughnut',
                      legendPosition: 'top',
                    }}
                    style={chartStyle}
                    legendPosition="top"
                    dataLabelsConfig={{ display: false }}
                  />
                );
              case ComponentsDisplayType.chart_pie:
                chartData = getChartData(component, data);
                return (
                  <ChartDonutWidget
                    data={{ ...chartData, type: 'pie', legendPosition: 'top' }}
                    style={chartStyle}
                  />
                );
              case ComponentsDisplayType.chart_line:
                chartData = getChartData(component, data);
                return <ChartLineWidget data={chartData} style={chartStyle} />;
              case ComponentsDisplayType.chart_table:
                chartData = getTableData(component, data);
                return (
                  <ChartTableWidget
                    data={chartData.rows}
                    columns={chartData.columns}
                  />
                );
              case ComponentsDisplayType.chart_funnel:
                chartData = getChartData(component, data);
                return (
                  <ChartFunnelWidget
                    data={{
                      ...chartData,
                    }}
                    style={chartStyle}
                  />
                );
              default:
                return noData();
            }
          }}
        />
      </div>
    </div>
  );
};

export default DashboardComponent;
