import React, { useEffect, useState } from 'react';
import { Accordion, Card, Col, Row } from 'react-bootstrap';
import { NO_REPORT_SELECTED } from '../../utils/constants';
import Alert from '../../components/Alert/Alert';
import { processableExamples, SwitchAllReports } from './SwitchAllReports';
import { cubeService } from '../../services';
import AlertWrapper from '../../components/Alert/AlertWrapper';
import NoDataFound from '../../components/commons/NoDataFound';
import DashboardService from '../../services/dashboard.service';
import {
  DATE_FORMAT,
  scrollToTop,
  isMatchInCommaSeperated,
} from '../../utils/Utils';
import DashboardComponent from '../Overview/dashboard/DashboardComponent';
import MaterialIcon from '../../components/commons/MaterialIcon';
import Skeleton from 'react-loading-skeleton';
import DatePicker from '../../components/dealsBreakdown/DatePicker';
import moment from 'moment';
import { useTenantContext } from '../../contexts/TenantContext';
import { useHistory } from 'react-router';
import Table from '../../components/GenericTable';
import ChecklistStatus from '../../components/checklist/ChecklistStatus';
import { ChecklistStatuses } from '../../utils/checklist.constants';
import {
  ComponentsDisplayType,
  StaticComponentsByType,
} from '../Overview/dashboard/dashboard.constants';
import WidgetWrapper from '../Overview/dashboard/components/WidgetWrapper';
import useIsTenant from '../../hooks/useIsTenant';

const allData = [
  {
    name: 'Kassulke and Baumbach, LLC.',
    checklist_name: 'ACH Origination Audit',
    status: ChecklistStatuses.NotViewed,
    created_on: '8/23/2023',
    due_date: '11/01/2023',
    progress: '10%',
  },
  {
    name: 'Walsh, Inc.',
    checklist_name: 'ACH Origination Audit',
    status: ChecklistStatuses.InProgress,
    created_on: '8/25/2023',
    due_date: '11/15/2023',
    progress: '30%',
  },
  {
    name: 'Bartoletti, Inc.',
    checklist_name: 'ACH Origination Audit',
    status: ChecklistStatuses.InProgress,
    created_on: '7/25/2023',
    due_date: '9/08/2023',
    progress: '20%',
  },
  {
    name: 'Doyle, LLC',
    checklist_name: 'ACH Origination Audit',
    status: ChecklistStatuses.Pending,
    created_on: '7/25/2023',
    due_date: '9/08/2023',
    progress: '70%',
  },
  {
    name: 'Lehner-Champlin, Inc.',
    checklist_name: 'ACH Origination Audit',
    status: ChecklistStatuses.InProgress,
    created_on: '7/25/2023',
    due_date: '9/08/2023',
    progress: '89%',
  },
  {
    name: 'Rutherford-Gaylord, Inc.',
    checklist_name: 'ACH Origination Audit',
    status: ChecklistStatuses.Completed,
    created_on: '7/25/2023',
    due_date: '9/08/2023',
    progress: '70%',
  },
  {
    name: 'Bosco, Inc.',
    checklist_name: 'ACH Origination Audit',
    status: ChecklistStatuses.InProgress,
    created_on: '7/25/2023',
    due_date: '9/08/2023',
    progress: '70%',
  },
  {
    name: 'Corwin, Inc.',
    checklist_name: 'ACH Origination Audit',
    status: ChecklistStatuses.InProgress,
    created_on: '7/25/2023',
    due_date: '9/08/2023',
    progress: '70%',
  },
  {
    name: 'Hirthe and Sons, LLC.',
    checklist_name: 'ACH Origination Audit',
    status: ChecklistStatuses.Pending,
    created_on: '7/25/2023',
    due_date: '9/08/2023',
    progress: '100%',
  },
  {
    name: 'Stoltenberg, Inc.',
    checklist_name: 'ACH Origination Audit',
    status: ChecklistStatuses.InProgress,
    created_on: '7/25/2023',
    due_date: '9/08/2023',
    progress: '100%',
  },
];
const ChecklistDashboards = () => {
  const component = StaticComponentsByType.Chart[6];
  const componentBar = StaticComponentsByType.Chart[7];
  return (
    <Card>
      <Card.Header className="justify-content-between">
        <h4 className="card-title text-hover-primary mb-0">
          Checklist Dashboards
        </h4>
      </Card.Header>
      <Card.Body>
        <div className="row mb-3">
          <div className="col-md-12">
            <Card>
              <Card.Body className="px-3 py-2">
                <h6>Checklists Generated</h6>
                <h1 className="text-center font-size-4em">894</h1>
              </Card.Body>
            </Card>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <Card>
              <Card.Body className="p-0">
                <h6 className="px-3 py-2">Completed vs In Progress</h6>
                <WidgetWrapper
                  key={componentBar.id}
                  component={{
                    ...componentBar,
                    onClick: () => {},
                  }}
                  withHeader={false}
                  withFooter={false}
                  containerStyle={
                    componentBar.displayType !==
                    ComponentsDisplayType.chart_table
                      ? 'align-items-center border-0 shadow-0 shadow-none'
                      : 'border-0 shadow-0 shadow-none'
                  }
                />
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-6 pl-0">
            <Card>
              <Card.Body className="p-0">
                <h6 className="px-3 py-2">Status</h6>
                <WidgetWrapper
                  key={component.id}
                  component={{
                    ...component,
                    onClick: () => {},
                  }}
                  withHeader={false}
                  withFooter={false}
                  containerStyle={
                    component.displayType !== ComponentsDisplayType.chart_table
                      ? 'align-items-center border-0 shadow-0 shadow-none'
                      : 'border-0 shadow-0 shadow-none'
                  }
                />
              </Card.Body>
            </Card>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};
const ChecklistReports = () => {
  const columns = [
    {
      key: 'company_name',
      orderBy: '',
      component: 'Company Name',
    },
    {
      key: 'status',
      orderBy: '',
      component: 'Status',
    },
    {
      key: 'progress',
      orderBy: '',
      component: 'Progress',
    },
    {
      key: 'due_date',
      orderBy: '',
      component: 'Due Date',
    },
    {
      key: 'created_on',
      orderBy: '',
      component: 'Created On',
    },
    {
      key: 'due_date',
      orderBy: '',
      component: 'Updated',
    },
  ];
  const data = allData?.map((item) => ({
    ...item,
    dataRow: [
      {
        key: 'company_name',
        component: <span className={`pl-3 fw-bold`}>{item?.name}</span>,
      },
      {
        key: 'status',
        component: <ChecklistStatus item={item} />,
      },
      {
        key: 'progress',
        component: <span>{item?.progress}</span>,
      },
      {
        key: 'due_date',
        component: <span>{item?.due_date}</span>,
      },
      {
        key: 'created_on',
        component: <span>{item?.created_on}</span>,
      },
      {
        key: 'created_on',
        component: <span>{item?.due_date}</span>,
      },
    ],
  }));
  return (
    <Card>
      <Card.Header className="justify-content-between">
        <h4 className="card-title text-hover-primary mb-0">
          Checklist Reports
        </h4>
      </Card.Header>
      <Card.Body className="p-0">
        <Table
          columns={columns}
          data={data}
          dataInDB={true}
          usePagination={false}
        />
      </Card.Body>
    </Card>
  );
};

const staticChecklistReports = [
  {
    dashboardId: '4bf121b0-6b8a-4c33-a864-74014b04cb63',
    componentId: '67ad349d-24ae-4598-9907-4b790d6c829b2',
    createdAt: '2023-01-02T19:16:32.912Z',
    updatedAt: '2023-01-02T19:16:32.912Z',
    component: {
      id: '67ad349d-24ae-4598-9907-4b790d6c829b2',
      name: 'Checklist Dashboards',
      type2: 'static',
      enabled: true,
      analyticId: 'edd49bce-17e2-4ebe-9aa1-56b1ce63663f',
      componentTextId: null,
      createdById: '6d94e45b-4201-4e0c-9ae5-add9c8a6baad',
      tenantId: 'cacadeee-0000-4000-a000-000000000001',
      createdAt: '2023-01-02T19:16:20.512Z',
      updatedAt: '2023-01-02T19:16:20.512Z',
      analytic: {
        id: 'edd49bce-17e2-4ebe-9aa1-56b1ce63663f',
        name: 'Open Tasks',
        position: 20,
        type: 'Activities',
        relatedTypes: [],
        displayType: 'kpi_standard',
        icon: 'monetization_on',
        isMulti: true,
        dimensions: [],
        filters: [
          {
            member: 'Activities.type',
            values: ['task'],
            operator: 'equals',
          },
          {
            member: 'Activities.done',
            values: ['in progress'],
            operator: 'equals',
          },
        ],
        limit: 10000,
        measures: ['Activities.count'],
        order: [],
        segments: [],
        timeDimensions: [
          {
            compareDateRange: ['this month', 'last month'],
            dimension: 'Activities.updatedAt',
            granularity: 'month',
          },
        ],
        createdById: null,
        tenantId: null,
        createdAt: '2023-01-02T18:58:23.057Z',
        updatedAt: '2023-07-15T17:15:29.040Z',
      },
      componentText: null,
    },
  },
  {
    dashboardId: '4bf121b0-6b8a-4c33-a864-74014b04cb63',
    componentId: '67ad349d-24ae-4598-9907-4b790d6c829b3',
    createdAt: '2023-01-02T19:16:32.912Z',
    updatedAt: '2023-01-02T19:16:32.912Z',
    component: {
      id: '67ad349d-24ae-4598-9907-4b790d6c829b3',
      name: 'Checklist Reports',
      type2: 'static',
      enabled: true,
      analyticId: 'edd49bce-17e2-4ebe-9aa1-56b1ce63663f',
      componentTextId: null,
      createdById: '6d94e45b-4201-4e0c-9ae5-add9c8a6baad',
      tenantId: 'cacadeee-0000-4000-a000-000000000001',
      createdAt: '2023-01-02T19:16:20.512Z',
      updatedAt: '2023-01-02T19:16:20.512Z',
      analytic: {
        id: 'edd49bce-17e2-4ebe-9aa1-56b1ce63663f',
        name: 'Open Tasks',
        position: 20,
        type: 'Activities',
        relatedTypes: [],
        displayType: 'kpi_standard',
        icon: 'monetization_on',
        isMulti: true,
        dimensions: [],
        filters: [
          {
            member: 'Activities.type',
            values: ['task'],
            operator: 'equals',
          },
          {
            member: 'Activities.done',
            values: ['in progress'],
            operator: 'equals',
          },
        ],
        limit: 10000,
        measures: ['Activities.count'],
        order: [],
        segments: [],
        timeDimensions: [
          {
            compareDateRange: ['this month', 'last month'],
            dimension: 'Activities.updatedAt',
            granularity: 'month',
          },
        ],
        createdById: null,
        tenantId: null,
        createdAt: '2023-01-02T18:58:23.057Z',
        updatedAt: '2023-07-15T17:15:29.040Z',
      },
      componentText: null,
    },
  },
];
const ReportSkeletonLoader = ({ rows }) => {
  const [rowCount] = useState(Array(rows).fill(0));
  const Circle = ({ children }) => {
    return (
      <div className="rounded-circle" style={{ height: 20, width: 20 }}>
        {children}
      </div>
    );
  };
  return (
    <>
      {rowCount.map((r, idx) => (
        <div key={idx} className="d-flex col py-1 align-items-center">
          <Circle>
            <Skeleton circle style={{ borderRadius: '50%', lineHeight: 1.3 }} />
          </Circle>
          <div className="w-100 ml-2">
            <Skeleton height="5" />
          </div>
        </div>
      ))}
    </>
  );
};

const format = DATE_FORMAT;

const InsightReports = () => {
  const [dashboardList, setDashboardList] = useState([]);
  const [selectedDashboard, setSelectedDashboard] = useState({});
  const { tenant } = useTenantContext();
  const [insightReport, setInsightReport] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [active, setActive] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [dashboardComponents, setDashboardComponents] = useState([]);
  const [dashboardWithComponents, setDashboardWithComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState({});
  const [query, setQuery] = useState({});
  const [staticComponent, setStaticComponent] = useState({});
  const [dateRange, setDateRange] = useState({});
  const history = useHistory();
  const { isExcelBank } = useIsTenant();

  useEffect(() => {
    if (selectedComponent?.component) {
      const updatedTimeDimensions = [
        ...selectedComponent?.component?.analytic?.timeDimensions,
      ];
      if (updatedTimeDimensions && updatedTimeDimensions.length) {
        delete updatedTimeDimensions[0]?.compareDateRange;
        updatedTimeDimensions[0].dateRange = [
          moment(dateRange.startDate).format(format),
          moment(dateRange.endDate).format(format),
        ];
      }
      const queryBackup = {
        ...selectedComponent,
        component: {
          ...selectedComponent.component,
          analytic: {
            ...selectedComponent.component.analytic,
            timeDimensions: updatedTimeDimensions,
          },
        },
      };

      setSelectedComponent({});
      setQuery({});
      scrollToTop();

      setDashboardComponents(
        [...dashboardComponents].map((comp) => ({
          ...comp,
          component:
            comp.componentId === queryBackup.componentId
              ? queryBackup.component
              : comp.component,
        }))
      );

      setTimeout(() => {
        setQuery(queryBackup.component.analytic);
        setSelectedComponent(queryBackup);
      });
    }
  }, [dateRange]);

  const dashboardComponentConfig = {
    hideActions: true,
    headingWithoutDash: true,
    wrap: 'text-nowrap', // for wrapping/truncate
  };

  const getDefaultReports = (analytics) => {
    const typeMap = {
      Course: 'TRAINING REPORTS',
      CourseProgress: 'TRAINING REPORTS',
      Deal: 'DEALS REPORTS',
      Lesson: 'TRAINING REPORTS',
      LessonProgress: 'TRAINING REPORTS',
      SelfAssessment: 'TRAINING REPORTS',
    };
    return analytics.reduce(
      (acc, analytic, idx) => {
        if (!processableExamples[analytic.name]) {
          return acc;
        }
        const type = typeMap[analytic.type];
        acc[type].push({
          ...analytic,
          id: idx,
          insightName: processableExamples[analytic.name],
        });
        acc[type].sort((a, b) => a.position - b.position);

        return acc;
      },
      {
        'DEALS REPORTS': [],
        'TRAINING REPORTS': [],
      }
    );
  };

  const getDashboardComponents = (dashboard) => {
    return (
      dashboardWithComponents.find((d) => d.dashboard.id === dashboard.id)
        ?.components || []
    );
  };

  const getDashboardFromList = (list, dashId) => {
    return list.find(({ dashboard }) => dashboard.id === dashId) || {};
  };

  const getComponentFromList = (list, cId) => {
    return list.find((cmp) => cmp.componentId === cId) || {};
  };

  const buildLegacyReports = (dashboard, list) => {
    return [...list].map((l) => {
      return {
        component: {
          ...l,
          componentId: l.id,
          analytic: l,
        },
        insightName: l.name,
        rptType: 'legacy',
        componentId: l.id,
        dashboardId: dashboard.id,
      };
    });
  };

  const getDashboards = async () => {
    setLoading(true);

    const urlParams = new URLSearchParams(history.location.search);
    const dashId = urlParams.get('dashboard');
    const componentId = urlParams.get('component');

    const requests = [];
    requests.push(cubeService.getAnalytics({ isPublic: true }));
    requests.push(DashboardService.getDashboards());
    const responses = await Promise.all(requests);
    const defaultReports = getDefaultReports(responses[0]); // this comes as object

    const { data } = responses[1];
    const dashboards = data.map((d) => ({
      ...d,
      key: d.id,
    }));
    const uniqueDashboards = dashboards.filter((dashboard) => {
      const settingsInput = 'reporting_' + dashboard?.name;
      return (
        tenant.modules === '*' ||
        isMatchInCommaSeperated(tenant.modules, settingsInput)
      );
    });
    const componentsRequest = uniqueDashboards.map((dashboard) => {
      return DashboardService.getDashboardsComponents(dashboard.id);
    });
    const componentsResponse = await Promise.all(componentsRequest);

    let dashboardWithComponents = componentsResponse
      .map((dwc) => {
        return {
          dashboard: uniqueDashboards.find(
            (ud) => ud.id === dwc.data[0]?.dashboardId
          ),
          components: dwc.data,
        };
      })
      .filter((f) => f.components.length);

    // updating Training with default/legacy reports too
    dashboardWithComponents = dashboardWithComponents.map((dwc) => ({
      ...dwc,
      components:
        dwc.dashboard.name === 'Training'
          ? [
              ...dwc.components,
              ...buildLegacyReports(
                dwc.dashboard,
                defaultReports['TRAINING REPORTS']
              ),
            ]
          : dwc.dashboard.name === 'Deal'
          ? [
              ...dwc.components,
              ...buildLegacyReports(
                dwc.dashboard,
                defaultReports['DEALS REPORTS']
              ),
            ]
          : dwc.components,
    }));
    setLoading(false);
    const first = dashId
      ? getDashboardFromList(dashboardWithComponents, dashId)
      : uniqueDashboards[0];

    setDashboardList(uniqueDashboards);
    setSelectedDashboard(first?.dashboard || first);
    setDashboardWithComponents(dashboardWithComponents);
    setDashboardComponents(
      first?.components || dashboardWithComponents[0]?.components
    );

    if (componentId) {
      const component = getComponentFromList(first?.components, componentId);
      const updatedDashboardComponents = [...first?.components].map((comp) => ({
        ...comp,
        isActive: comp.componentId === component.componentId,
      }));
      setDashboardComponents(updatedDashboardComponents);
      setTimeout(() => {
        setQuery(component.component.analytic);
        setSelectedComponent(component);
      });
    }
  };

  useEffect(() => {
    if (tenant) {
      getDashboards();
    }
  }, [tenant]);

  useEffect(() => {
    if (selectedDashboard) {
      setDashboardComponents(getDashboardComponents(selectedDashboard));
    }
  }, [selectedDashboard]);

  const Title = () => {
    return <div className="text-muted">{NO_REPORT_SELECTED}</div>;
  };

  const TitleNoReports = () => {
    return <div className="text-muted font-size-md">No reports available</div>;
  };

  const getStaticComponent = (comp) => {
    const componentMap = {
      'Checklist Dashboards': {
        name: 'Checklist Dashboards',
        component: <ChecklistDashboards />,
      },
      'Checklist Reports': {
        name: 'Checklist Reports',
        component: <ChecklistReports />,
      },
    };

    return componentMap[comp.name];
  };

  const handleComponentClick = (dashboardId, component) => {
    setInsightReport({});
    setSelectedComponent({});
    setQuery({});
    setStaticComponent({});
    scrollToTop();

    if (component?.component?.type2 === 'static') {
      setStaticComponent(getStaticComponent(component?.component));
      setSelectedComponent(component);
      setInsightReport(component?.component);
    } else {
      if (component?.rptType === 'legacy') {
        setTimeout(() => {
          setSelectedComponent(component);
          setInsightReport(component?.component);
        });
      } else {
        setTimeout(() => {
          setQuery(component.component.analytic);
          setSelectedComponent(component);
        });
      }
    }
  };

  const renderCollapseOfDashboard = (dashboard) => {
    const components = getDashboardComponents(dashboard);
    let subComponents = components.filter(
      (i) => i.dashboardId === dashboard.id
    );
    if (dashboard.name === 'Activities' && isExcelBank) {
      subComponents = subComponents.concat(staticChecklistReports);
    }
    if (subComponents) {
      return (
        <>
          {subComponents.map((component) => (
            <Row
              key={component.id}
              onClick={() =>
                handleComponentClick(component?.dashboard?.id, component)
              }
              className={`cursor-pointer align-items-center p-2 px-3 nav-link item-filter ${
                selectedComponent?.component?.id === component.component.id
                  ? 'bg-primary text-white active'
                  : ''
              }`}
            >
              <Col>
                <p className="d-flex align-items-center py-0 my-0">
                  <i className="material-symbols-outlined nav-icon">
                    {component?.component?.analytic.icon
                      ? component?.component?.analytic?.icon
                      : 'analytics'}
                  </i>
                  <span className="font-weight-medium text-truncate font-size-sm2 mb-0">
                    {component.component.name?.split('-')[0]?.trim()}
                  </span>
                </p>
              </Col>
            </Row>
          ))}
        </>
      );
    } else {
      return <></>;
    }
  };

  const shouldShowDatePicker = () => {
    const keys = Object.keys(selectedComponent).length;
    return keys && selectedComponent.rptType !== 'legacy';
  };
  return (
    <div>
      <AlertWrapper>
        <Alert message={successMessage} setMessage={setSuccessMessage} />
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
      </AlertWrapper>
      <Row className="mt-1">
        <Col xl={3} md={3} className="mb-3">
          <Card className="bg-transparent border-0 shadow-none">
            {loading && (
              <>
                <Accordion defaultActiveKey={1} key={1}>
                  <Card>
                    <Accordion.Toggle
                      as={Card.Header}
                      onClick={() => {
                        setActive(!active);
                      }}
                      eventKey={1}
                      className="nav-subtitle card-title text-hover-primary cursor-pointer font-size-sm text-muted font-weight-semibold text-capitalize"
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <h4 className="mb-0">{'My Reports'}</h4>
                        <MaterialIcon
                          icon={active ? 'expand_more' : 'expand_less'}
                        />
                      </div>
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey={1}>
                      <Card.Body className="p-1">
                        <ReportSkeletonLoader rows={15} />
                      </Card.Body>
                    </Accordion.Collapse>
                  </Card>
                </Accordion>
              </>
            )}
            {dashboardList.map((i, index) => {
              return (
                <>
                  <Accordion defaultActiveKey={index === 0 && i.id} key={i.id}>
                    <Card>
                      <Accordion.Toggle
                        as={Card.Header}
                        onClick={() => {
                          setActive(!active);
                        }}
                        eventKey={i.id}
                        className="nav-subtitle card-title text-hover-primary cursor-pointer font-size-sm text-muted font-weight-semibold text-capitalize"
                      >
                        <div className="d-flex align-items-center justify-content-between">
                          <h4 className="mb-0">{i.name}</h4>
                          <MaterialIcon
                            icon={active ? 'expand_more' : 'expand_less'}
                          />
                        </div>
                      </Accordion.Toggle>
                      <Accordion.Collapse eventKey={i.id}>
                        <Card.Body className="p-1">
                          {
                            <>
                              {loading ? (
                                <ReportSkeletonLoader rows={15} />
                              ) : (
                                <>
                                  {dashboardComponents?.length > 0 ? (
                                    <> {renderCollapseOfDashboard(i)} </>
                                  ) : (
                                    <NoDataFound
                                      title={<TitleNoReports />}
                                      icon="analytics"
                                      containerStyle="w-100 text-muted h-100"
                                      iconStyle="font-size-2xl"
                                    />
                                  )}
                                </>
                              )}
                            </>
                          }
                        </Card.Body>
                      </Accordion.Collapse>
                    </Card>
                  </Accordion>
                </>
              );
            })}
          </Card>
        </Col>
        <Col xl={9} md={12} className="pl-0 position-relative">
          <div
            className="position-absolute z-index-5"
            style={{
              top: 15,
              right: 35,
              pointerEvents: shouldShowDatePicker() ? '' : 'none',
              opacity: shouldShowDatePicker() ? 1 : 0,
            }}
          >
            <DatePicker
              range={dateRange}
              setRange={setDateRange}
              extraClass="p-0"
            />
          </div>

          {staticComponent?.component ? (
            <>{staticComponent?.component}</>
          ) : (
            <>
              {selectedComponent?.component || insightReport?.insightName ? (
                <>
                  {insightReport?.insightName ? (
                    SwitchAllReports({
                      insight: { ...insightReport },
                      insightName: insightReport.insightName,
                    })
                  ) : (
                    <DashboardComponent
                      item={selectedComponent}
                      query={query}
                      componentHeight={'auto'}
                      config={dashboardComponentConfig}
                    />
                  )}
                </>
              ) : (
                <NoDataFound
                  title={<Title />}
                  icon="analytics"
                  containerStyle="w-100 height-300 text-muted"
                />
              )}
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default InsightReports;
