import { capitalize, isToFixedNoRound } from '../../../utils/Utils';
import KpiGrowthIndexWidget from './components/KpiGrowthIndexWidget';
import KpiBasicWidget from './components/KpiBasicWidget';
import KpiRankingsWidget from './components/KpiRankingsWidget';
import KpiStandardWidget from './components/KpiStandardWidget';
import ChartColumnWidget from './components/ChartColumnWidget';
import ChartDonutWidget from './components/ChartDonutWidget';
import ChartBarWidget from './components/ChartBarWidget';
import ChartTableWidget from './components/ChartTableWidget';
import _ from 'lodash';
import ChartLineWidget from './components/ChartLineWidget';

// hardcoding it for now
export const DASHBOARD_ICONS = {
  Overview: 'list_alt',
  Deal: 'monetization_on',
  Deals: 'monetization_on',
  Training: 'school',
  Trainings: 'school',
  Task: 'check_circle',
  Tasks: 'check_circle',
  Survey: 'analytics',
  Surveys: 'analytics',
};

export const MODULES_TO_SHOW = {
  contact: 'contact',
  deal: 'deal',
  training: 'training',
  organization: 'organization',
  activities: 'activities',
  product: 'product',
  user: 'user',
};

export const DASHBOARDS_LIST = [
  { id: 1, name: 'Overview', key: 'Overview', icon: 'list_alt' },
  { id: 2, name: 'Deals', key: 'Deals', icon: 'monetization_on' },
  { id: 3, name: 'Training', key: 'Training', icon: 'school' },
  { id: 4, name: 'Tasks', key: 'Tasks', icon: 'task_alt' },
];

export const RelativeTimeRange = [
  { name: 'today', title: 'Today' },
  { name: 'this week', title: 'This Week' },
  { name: 'this month', title: 'This Month' },
  { name: 'this year', title: 'This Year' },
];

export const LimitRange = [
  { name: '5', title: 'Top 5' },
  { name: '10', title: 'Top 10' },
  { name: '15', title: 'Top 15' },
  { name: '20', title: 'Top 20' },
];

export const RelativeTimeRangePast = [
  { name: 'last week', title: 'Last Week' },
  { name: 'last month', title: 'Last Month' },
  { name: 'last year', title: 'Last Year' },
];

export const OperatorsByType = {
  string: [
    { name: 'startsWith', title: 'starts with' },
    { name: 'endsWith', title: 'ends with' },
    { name: 'contains', title: 'contains' },
    { name: 'notContains', title: 'does not contain' },
    { name: 'equals', title: 'equals' },
    { name: 'notEquals', title: 'does not equal' },
    { name: 'set', title: 'is set' },
    { name: 'notSet', title: 'is not set' },
  ],
  number: [
    { name: 'startsWith', title: 'starts with' },
    { name: 'endsWith', title: 'ends with' },
    { name: 'equals', title: 'equals' },
    { name: 'notEquals', title: 'does not equal' },
    { name: 'set', title: 'is set' },
    { name: 'notSet', title: 'is not set' },
    { name: 'gt', title: '>' },
    { name: 'gte', title: '>=' },
    { name: 'lt', title: '<' },
    { name: 'lte', title: '<=' },
  ],
  time: [
    { name: 'beforeDate', title: 'before date' },
    { name: 'afterDate', title: 'after date ' },
  ],
};

export const getDisplayTypePretty = (uglyName, trailingLabel = '') => {
  const splitted = uglyName.split('_');
  return (
    splitted
      .slice(1, splitted.length)
      .map((n) => capitalize(n))
      .join(' ') + trailingLabel
  );
};

export const ProgressData = {
  1: {
    headers: [
      { id: 1, name: 'This Month', color: 'bg-blue' },
      { id: 2, name: 'Last Month', color: 'bg-orange' },
    ],
    data: [
      {
        id: 1,
        name: 'Qualified',
        values: [
          { id: 1, value: 46, color: 'bg-blue' },
          { id: 2, value: 15, color: 'bg-orange' },
        ],
      },
      {
        id: 2,
        name: 'Meeting',
        values: [
          { id: 1, value: 40, color: 'bg-blue' },
          { id: 2, value: 18, color: 'bg-orange' },
        ],
      },
      {
        id: 3,
        name: 'Proposal',
        values: [
          { id: 1, value: 40, color: 'bg-blue' },
          { id: 2, value: 100, color: 'bg-orange' },
        ],
      },
      {
        id: 4,
        name: 'Negotiations',
        values: [
          { id: 1, value: 17, color: 'bg-blue' },
          { id: 2, value: 10, color: 'bg-orange' },
        ],
      },
    ],
  },
  2: {
    labels: ['Charles', 'Mary'],
    datasets: [
      {
        label: '',
        data: [50, 100],
        backgroundColor: ['#082ace', '#28ae60'],
      },
    ],
  },
  3: {
    labels: ['Charles', 'Mary', 'Richard'],
    datasets: [
      {
        label: '',
        data: [20, 30, 50],
        backgroundColor: ['#082ace', '#28ae60', '#FF5A2D'],
      },
    ],
  },
  4: {
    labels: ['Charles', 'Mary', 'Richard'],
    datasets: [
      {
        label: '',
        data: [22, 4, 53],
        borderColor: '#082ace',
        backgroundColor: '#082ace',
        lineTension: 0.3,
      },
      {
        label: '',
        data: [32, -12, -45],
        borderColor: '#28ae60',
        backgroundColor: '#28ae60',
        lineTension: 0.3,
      },
    ],
  },
  5: {
    labels: ['Charles', 'Mary', 'Richard'],
    datasets: [
      {
        data: [
          [10, 90],
          [30, 70],
          [60, 40],
        ],
      },
    ],
  },
  6: {
    labels: ['Pending', 'In Progress', 'Completed', 'Past Due'],
    datasets: [
      {
        label: '',
        data: [20, 30, 50, 80],
        backgroundColor: ['#082ace', '#28ae60', '#FF5A2D', '1a5a28'],
      },
    ],
  },
};

export const StatsData = {
  1: {
    count: 133,
    lastMonth: 190,
    percentage: -30,
  },
  2: {
    count: 47,
    lastMonth: 41,
    percentage: 15,
  },
  3: {
    count: 66,
    lastMonth: 88,
    percentage: -25,
  },
  4: {
    count: 136,
    lastMonth: 72,
    percentage: 90,
  },
  5: {
    count: 61,
    lastMonth: 101,
    percentage: -67,
  },
  6: {
    count: isToFixedNoRound(12900),
    lastMonth: isToFixedNoRound(12120),
    percentage: 6,
  },
};

export const ListData = {
  1: [
    { id: 1, name: 'Arlene Olson', count: 93, percentage: 12 },
    { id: 2, name: 'Roger Coleman', count: 65, percentage: -18 },
    { id: 3, name: 'Alicia Nelson', count: 60, percentage: 28 },
    { id: 4, name: 'Felicia Burke', count: 41, percentage: -68 },
    { id: 5, name: 'Mabel Erickson', count: 32, percentage: 30 },
  ],
  2: [
    { id: 1, name: 'Lloyd Norris', count: 19 },
    { id: 2, name: 'Jimmy Fleming', count: 15 },
    { id: 3, name: 'Hector Morgan', count: 14 },
    { id: 4, name: 'Laura Hall', count: 10 },
    { id: 5, name: 'Virgil Hughes', count: 6 },
  ],
  3: [
    { id: 1, name: 'Payment Technology - Nonprofit Use Case', count: 19 },
    { id: 2, name: 'Why Manage Financial Risk?', count: 15 },
    { id: 3, name: 'How to Guide: Adding A Profile Picture', count: 14 },
    { id: 4, name: 'What is Healthcare Receivables Management?', count: 10 },
    { id: 5, name: 'What is the main purpose of HRM?', count: 6 },
  ],
  4: [
    { id: 1, name: 'Payment Technology', count: 19 },
    { id: 2, name: 'Market Insights', count: 15 },
    { id: 3, name: 'Understanding Card Payments', count: 14 },
    { id: 4, name: 'Treasury Management Sales Strategy', count: 10 },
    { id: 5, name: 'Faster Payments 101', count: 6 },
  ],
  5: [
    { id: 1, name: 'Arlene Olson', count: 93 },
    { id: 2, name: 'Roger Coleman', count: 65 },
    { id: 3, name: 'Alicia Nelson', count: 60 },
    { id: 4, name: 'Felicia Burke', count: 41 },
    { id: 5, name: 'Mabel Erickson', count: 32 },
  ],
  6: [
    { id: 1, name: 'Lloyd Norris', count: 19 },
    { id: 2, name: 'Jimmy Fleming', count: 15 },
    { id: 3, name: 'Hector Morgan', count: 14 },
    { id: 4, name: 'Laura Hall', count: 10 },
    { id: 5, name: 'Virgil Hughes', count: 6 },
  ],
  7: [
    {
      id: 1,
      name: 'Pearson and Hardon',
      count: '19 Deals',
      revenue: isToFixedNoRound(12100),
    },
    {
      id: 2,
      name: 'ABC Corp.',
      count: '15 Deals',
      revenue: isToFixedNoRound(21222),
    },
    {
      id: 3,
      name: 'World Wide Technologies',
      count: '14 Deals',
      revenue: isToFixedNoRound(12223),
    },
    {
      id: 4,
      name: 'Amazon',
      count: '10 Deals',
      revenue: isToFixedNoRound(43111),
    },
    {
      id: 5,
      name: 'Apple Inc.',
      count: '6 Deals',
      revenue: isToFixedNoRound(11232),
    },
  ],
};

export const DashboardComponentTypes = {
  Stat: 1,
  VChart: 2,
  HChart: 3,
  List: 4,
  Progress: 5,
};

export const ComponentsDisplayType = {
  kpi_standard: 'kpi_standard',
  kpi_scorecard: 'kpi_scorecard',
  kpi_growth_index: 'kpi_growth_index',
  kpi_rankings: 'kpi_rankings',
  kpi_basic: 'kpi_basic',
  chart_column: 'chart_column',
  chart_donut: 'chart_donut',
  chart_pie: 'chart_pie',
  chart_bar: 'chart_bar',
  chart_line: 'chart_line',
  chart_table: 'chart_table',
  chart_funnel: 'chart_funnel',
  chart_area: 'chart_area',
  chart_heat: 'chart_heat',
};

export const getFieldsLabelByComponentType = (type) => {
  switch (type) {
    case ComponentsDisplayType.chart_funnel:
      return {
        one: 'Measure',
        second: 'Grouping (Stages)',
      };
    case ComponentsDisplayType.chart_donut:
    case ComponentsDisplayType.chart_pie:
      return {
        one: 'Measure',
        second: 'Grouping (Slices)',
      };
    case ComponentsDisplayType.chart_bar:
    case ComponentsDisplayType.chart_column:
    case ComponentsDisplayType.chart_line:
      return {
        one: 'Measure (y-axis)',
        second: 'Grouping (x-axis)',
      };
    case ComponentsDisplayType.chart_table:
      return {
        one: 'Measure (1st column)',
        second: 'Grouping (2nd column)',
      };
    default:
      return {
        one: 'Duration',
        second: '',
      };
  }
};

export const COMPONENTS_BY_DASH_ID = {
  Overview: [
    {
      id: 11,
      name: 'Contacts Created - This Month',
      type: DashboardComponentTypes.Stat,
      data: StatsData[1],
    },
    {
      id: 21,
      name: 'Revenue Won by Month',
      type: DashboardComponentTypes.VChart,
      style: { height: 345 },
    },
    {
      id: 31,
      name: 'Top Organizations',
      type: DashboardComponentTypes.List,
      data: ListData[7],
    },
    {
      id: 41,
      name: 'Deals Lost - This Month',
      type: DashboardComponentTypes.Stat,
      data: StatsData[2],
    },
    {
      id: 51,
      name: 'Activities Completed - This Month',
      type: DashboardComponentTypes.Stat,
      data: StatsData[5],
    },
    {
      id: 61,
      name: 'Tasks Closed - This Month',
      type: DashboardComponentTypes.Stat,
      data: StatsData[4],
    },
    {
      id: 71,
      name: 'Deals Won - This Month',
      type: DashboardComponentTypes.Stat,
      data: StatsData[3],
    },
  ],
  Deal: [
    {
      id: 12,
      name: 'Open Deals - This Month',
      type: DashboardComponentTypes.Stat,
      data: StatsData[1],
    },
    {
      id: 22,
      name: 'Top Users - Deals Won',
      type: DashboardComponentTypes.List,
      data: ListData[1],
    },
    {
      id: 32,
      name: 'Top Users - Deals Lost',
      type: DashboardComponentTypes.List,
      data: ListData[2],
    },
    {
      id: 42,
      name: 'Deals Won - This Month',
      type: DashboardComponentTypes.Stat,
      data: StatsData[2],
    },
  ],
  Training: [
    {
      id: 13,
      name: 'Top Lessons - Completed',
      type: DashboardComponentTypes.List,
      data: ListData[3],
    },
    {
      id: 23,
      name: 'Top Courses - Completed',
      type: DashboardComponentTypes.List,
      data: ListData[4],
    },
    {
      id: 33,
      name: 'Lessons Started - This Month',
      type: DashboardComponentTypes.Stat,
      data: StatsData[1],
    },
    {
      id: 43,
      name: 'Top Users By Lessons Completed',
      type: DashboardComponentTypes.List,
      data: ListData[6],
    },
    {
      id: 53,
      name: 'Top Users By Courses Completed',
      type: DashboardComponentTypes.List,
      data: ListData[5],
    },
    {
      id: 63,
      name: 'Lessons Completed - This Month',
      type: DashboardComponentTypes.Stat,
      data: StatsData[3],
    },
  ],
  Tasks: [
    {
      id: 14,
      name: 'Tasks Created - This Month',
      type: DashboardComponentTypes.Stat,
      data: StatsData[5],
    },
    {
      id: 24,
      name: 'Open Task - This Month',
      type: DashboardComponentTypes.Stat,
      data: StatsData[2],
    },
    {
      id: 34,
      name: 'Completed Task - This Month',
      type: DashboardComponentTypes.Stat,
      data: StatsData[3],
    },
    {
      id: 44,
      name: 'Overdue Tasks - This Month',
      type: DashboardComponentTypes.Stat,
      data: StatsData[4],
    },
    {
      id: 24,
      name: 'Top Users By Overdue Tasks',
      type: DashboardComponentTypes.List,
      data: ListData[1],
    },
    {
      id: 34,
      name: 'Top Users By Completed Tasks',
      type: DashboardComponentTypes.List,
      data: ListData[2],
    },
  ],
  Survey: [
    {
      id: 37,
      name: 'Completed Task - This Month',
      type: DashboardComponentTypes.Stat,
      data: StatsData[3],
    },
    {
      id: 47,
      name: 'Overdue Tasks - This Month',
      type: DashboardComponentTypes.Stat,
      data: StatsData[4],
    },
    {
      id: 47,
      name: 'Top Users By Lessons Completed',
      type: DashboardComponentTypes.List,
      data: ListData[6],
    },
    {
      id: 57,
      name: 'Top Users By Courses Completed',
      type: DashboardComponentTypes.List,
      data: ListData[5],
    },
    {
      id: 67,
      name: 'Open Deals by Stage - This Month',
      type: DashboardComponentTypes.Progress,
      data: ProgressData[1],
      className: 'expanded',
    },
  ],
};

export const MIXED_COMPONENTS = [
  {
    id: 37,
    name: 'Completed Task - This Month',
    type: DashboardComponentTypes.Stat,
    data: StatsData[3],
  },
  {
    id: 47,
    name: 'Overdue Tasks - This Month',
    type: DashboardComponentTypes.Stat,
    data: StatsData[4],
  },
  {
    id: 47,
    name: 'Top Users By Lessons Completed',
    type: DashboardComponentTypes.List,
    data: ListData[6],
  },
  {
    id: 57,
    name: 'Top Users By Courses Completed',
    type: DashboardComponentTypes.List,
    data: ListData[5],
  },
  {
    id: 67,
    name: 'Open Deals by Stage - This Month',
    type: DashboardComponentTypes.Progress,
    data: ProgressData[1],
    className: 'expanded',
  },
];

export const StaticComponentsByType = {
  KPI: [
    {
      id: 1,
      name: 'Revenue - This Month',
      displayType: ComponentsDisplayType.kpi_standard,
      component: KpiStandardWidget,
      data: StatsData[1],
    },
    {
      id: 2,
      name: 'Revenue - This Month',
      displayType: ComponentsDisplayType.kpi_growth_index,
      component: KpiGrowthIndexWidget,
      data: StatsData[2],
    },
    {
      id: 3,
      name: 'Open Deals',
      displayType: ComponentsDisplayType.kpi_basic,
      component: KpiBasicWidget,
      data: StatsData[3],
    },
    {
      id: 5,
      name: 'Top Deal Owners',
      displayType: ComponentsDisplayType.kpi_rankings,
      component: KpiRankingsWidget,
      data: ListData[5],
    },
  ],
  Chart: [
    {
      id: 1,
      displayType: ComponentsDisplayType.chart_column,
      component: ChartColumnWidget,
      data: { ...ProgressData[2], style: { height: 150, width: 300 } },
    },
    {
      id: 2,
      displayType: ComponentsDisplayType.chart_donut,
      component: ChartDonutWidget,
      data: { ...ProgressData[3], type: 'doughnut', legendPosition: 'right' },
      style: { width: 210 },
    },
    {
      id: 3,
      displayType: ComponentsDisplayType.chart_pie,
      component: ChartDonutWidget,
      data: { ...ProgressData[3], type: 'pie', legendPosition: 'right' },
      style: { width: 210 },
    },
    {
      id: 4,
      displayType: ComponentsDisplayType.chart_bar,
      component: ChartBarWidget,
      data: { ...ProgressData[2] },
    },
    {
      id: 5,
      displayType: ComponentsDisplayType.chart_line,
      component: ChartLineWidget,
      data: { ...ProgressData[4] },
    },
    {
      id: 6,
      displayType: ComponentsDisplayType.chart_table,
      component: ChartTableWidget,
      data: ListData[1],
    },
    {
      id: 7,
      displayType: ComponentsDisplayType.chart_bar,
      component: ChartBarWidget,
      data: { ...ProgressData[6] },
    },
    {
      id: 8,
      displayType: ComponentsDisplayType.chart_column,
      component: ChartColumnWidget,
      data: { ...ProgressData[6] },
    },
  ],
};

export const getComponentByDisplayType = (displayType) => {
  const allComponentTypes = _.flatten(_.values(StaticComponentsByType));
  return allComponentTypes.find(
    (component) => component.displayType === displayType
  );
};
