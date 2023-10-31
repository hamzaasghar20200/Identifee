import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { useContext } from 'react';
import Home from './views/Overview/Home';
import MyLessons from './views/Resources/MyLessons';
import Category from './views/Resources/category/Category';
import Lesson from './views/Resources/Lesson';
import Login from './pages/Login';
import Reset from './pages/Reset';
import Request from './pages/Request';
import SignUp from './pages/SignUp';
import PrivateRoute from './routes/private';
import Deals from './pages/Deals';
import PipelineDetail from './pages/PipelineDetail';
import Insights from './pages/Insights';
import Settings from './views/settings/Settings';
import ResendInvite from './views/settings/Resources/ResendInvite';
import CaseStudy from './views/Resources/casestudies/CaseStudy';
import CaseStudyVideo from './views/Resources/casestudies/CaseStudyVideo';
import Security from './pages/Security';
import Notification from './pages/Notification';
import SiteSettings from './pages/SiteSettings';
import Users from './pages/Users';
import Resources from './pages/Resources';
import Products from './pages/Products';
import Roles from './pages/Roles';
import PeopleProfile from './pages/PeopleProfile';
import Contacts from './pages/Contacts';
import OrganizationProfile from './pages/OrganizationProfile';
import routes from './utils/routes.json';
import LearningPath from './pages/LearningPath';
import Questionary from './pages/Questionary';
import Accounts from './pages/Accounts';
import Resrcs from './pages/Resrcs';
import AIAssist from './pages/AIAssist';
import CompanyDetail from './components/prospecting/v2/Profile/CompanyDetail';
import UserProfile from './views/settings/ManageUsers/Profile';
import Groups from './pages/Groups';
import ManageRoles from './pages/ManageRoles';
import Unauthorized from './views/Errors/403';
import PeopleDetail from './components/prospecting/v2/Profile/PeopleDetail';
import BulkImportPage from './pages/BulkImport';
import BulkImport from './components/BulkImport';
import Integrations from './pages/Integrations';
import { TenantContext } from './contexts/TenantContext';
import {
  checkStringsInInput,
  isDisplayWelcomeScreen,
  isModuleAllowed,
} from './utils/Utils';
import Tenants from './pages/Tenant';
import PipelinesAndStages from './pages/PipelinesAndStages';
import Fields from './pages/Fields';
import WorkFlow from './pages/WorkFlow';
import { WorkFlowDetail } from './components/workFlow/workFlowDetail';
import { useProfileContext } from './contexts/profileContext';
import ClientLogin from './pages/ClientLogin';
import ClientDashboard from './pages/ClientDashboard';
import ClientDashboardConv from './components/ClientPortal/Conversations';
import ClientDashboardVideos from './components/ClientPortal/Videos';
import ClientDashboardFiles from './components/ClientPortal/Files';
import ProspectCompanyDetails from './pages/ProspectCompanyDetails';
import NotificationsAll from './pages/NotificationsAll';
import Activities from './pages/Activities';
import OrganizationsPage from './pages/Organizations';
import ProfilePage from './pages/ProfilePage';
import SelfAssessment from './views/Resources/selfAssessment/SelfAssessment';
import Maintenance from './pages/Maintenance';
import SelfAssessmentResults from './views/Resources/selfAssessment/SelfAssessmentResults';
import ScrollToTop from './hooks/useScrollToTop';
import Learn from './views/Learn/Learn';
import Welcome from './pages/ComericaWelcome';
import VideoPlayer from './pages/VideoPlayer';
export const AppRouter = () => {
  const { tenant } = useContext(TenantContext);

  const getComponent = (name, component) => {
    if (isDisplayWelcomeScreen(tenant.modules)) {
      return Welcome;
    }
    if (tenant.modules === '*') return component;
    else if (isModuleAllowed(tenant.modules, name)) {
      return component;
    } else {
      return Home;
    }
  };

  const getRootComponent = () => {
    if (isDisplayWelcomeScreen(tenant.modules)) {
      return Welcome;
    }
    if (tenant.modules === '*') return Home;

    if (
      checkStringsInInput(tenant.modules, ['dashboards', 'home', 'new_home'])
    ) {
      return Home;
    }
    if (isModuleAllowed(tenant.modules, 'companies')) {
      return OrganizationsPage;
    }
    if (isModuleAllowed(tenant.modules, 'contacts')) {
      return Contacts;
    }
    if (isModuleAllowed(tenant.modules, 'pipelines')) {
      return Deals;
    }
    if (isModuleAllowed(tenant.modules, 'activities')) {
      return Activities;
    }
    if (isModuleAllowed(tenant.modules, 'prospecting')) {
      return Resrcs;
    }
    if (isModuleAllowed(tenant.modules, 'reporting')) {
      return Insights;
    }
    if (isModuleAllowed(tenant.modules, 'learn')) {
      return MyLessons;
    }
    return Unauthorized;
  };
  const { profileInfo } = useProfileContext();
  return (
    <Router>
      <ScrollToTop />
      <Switch>
        <Route exact path="/sign-up" component={SignUp} />
        <Route exact path="/login" component={Login} />
        {!tenant?.modules && <Route exact path="/" component={Login} />}
        <Route
          exact
          path="/login?access_token=:access_token&refresh_token=:refresh_token"
          component={Login}
        />
        <Route exact path="/request-password" component={Request} />
        <Route exact path="/reset-password" component={Reset} />

        <Route exact path="/clientportal/login" component={ClientLogin} />
        <Route
          exact
          path="/clientportal/dashboard"
          component={ClientDashboard}
        />
        <Route
          exact
          path="/clientportal/dashboard/conversations"
          component={ClientDashboardConv}
        />
        <Route
          exact
          path="/clientportal/dashboard/videos"
          component={ClientDashboardVideos}
        />
        <Route
          exact
          path="/clientportal/dashboard/files"
          component={ClientDashboardFiles}
        />

        <PrivateRoute exact path={routes.accounts} component={Accounts} />

        <PrivateRoute
          exact
          path={routes.pipeline}
          component={getComponent('pipelines', Deals)}
        />
        <PrivateRoute
          exact
          path={routes.pipeline2}
          component={getComponent('pipelines', Deals)}
        />
        <PrivateRoute
          exact
          path={`${routes.pipeline}/:id/activity/:activityId`}
          component={getComponent('activities', PipelineDetail)}
        />
        <PrivateRoute
          exact
          path={`${routes.pipeline}/:id`}
          component={PipelineDetail}
        />
        <PrivateRoute
          exact
          path={`${routes.pipeline2}/:id`}
          component={PipelineDetail}
        />

        <PrivateRoute
          exact
          path={routes.contacts}
          component={getComponent('contacts', Contacts)}
        />
        <PrivateRoute
          exact
          path={routes.companies}
          component={getComponent('companies', OrganizationsPage)}
        />
        <PrivateRoute
          isSplitView={true}
          path={`${routes.contacts}/:contactId/profile/activity/:activityId`}
          component={getComponent('contacts', PeopleProfile)}
        />
        <PrivateRoute
          isSplitView={true}
          path={`${routes.contacts}/:contactId/profile`}
          component={getComponent('contacts', PeopleProfile)}
        />
        <PrivateRoute
          isSplitView={true}
          path={routes.Activities}
          component={getComponent('activities', Activities)}
        />
        <PrivateRoute
          isSplitView={true}
          path={`${routes.contacts}/:organizationId/organization/profile/activity/:activityId`}
          component={getComponent('companies', OrganizationProfile)}
        />
        <PrivateRoute
          isSplitView={true}
          path={`${routes.companies}/:organizationId/organization/profile`}
          component={getComponent('companies', OrganizationProfile)}
        />

        <PrivateRoute
          path={routes.insights}
          component={getComponent('reporting', Insights)}
        />
        <PrivateRoute
          isSplitView={true}
          path={`${routes.insightsCompanies}/:organizationId/organization/profile`}
          component={getComponent('companies', OrganizationProfile)}
        />
        <PrivateRoute
          path={routes.insightsCompanies}
          component={getComponent('companies', OrganizationsPage)}
        />
        <PrivateRoute
          path={routes.reporting}
          component={getComponent('reporting', Insights)}
        />

        <PrivateRoute
          path={routes.favorites}
          component={getComponent('learn', MyLessons)}
        />
        <Route
          exact
          path={`${routes.selfAssessmentPublic}/:id/results`}
          component={SelfAssessmentResults}
        />
        <Route
          exact
          path={`${routes.videoPlayer}/:videoId`}
          component={VideoPlayer}
        />
        <Route
          exact
          path={routes.selfAssessmentPublic}
          component={getComponent('self_assessment', SelfAssessment)}
        />
        <Route
          exact
          path={`${routes.selfAssessmentAdaption}/:id/results`}
          component={getComponent('self_assessment', SelfAssessmentResults)}
        />
        <Route
          exact
          path={routes.selfAssessmentAdaption}
          component={SelfAssessment}
        />
        <Route exact path={routes.maintenance} component={Maintenance} />
        <PrivateRoute exact path={routes.welcome} component={Welcome} />

        <PrivateRoute
          path={`${routes.selfAssessment}/:id/results`}
          component={getComponent('learn', SelfAssessmentResults)}
        />
        <PrivateRoute
          path={routes.selfAssessment}
          component={getComponent('learn', SelfAssessment)}
        />
        <PrivateRoute
          path="/learn/categories/:slug"
          component={getComponent('learn', Category)}
        />
        <PrivateRoute
          path="/learn/lessons/:id/page/:page_id/course/:course_id"
          component={getComponent('learn', Lesson)}
        />
        <PrivateRoute
          path="/learn/lessons/:id/page/:page_id"
          component={getComponent('learn', Lesson)}
        />
        <PrivateRoute
          path={routes.lesson}
          component={getComponent('learn', Lesson)}
        />
        <PrivateRoute
          exact
          path={routes.learnMain}
          component={getComponent('learn', Learn)}
        />
        <PrivateRoute
          path="/learn/courses/:id"
          exact
          component={getComponent('learn', Lesson)}
        />
        <PrivateRoute
          path="/learn/courses/:courseId/take-quiz"
          exact
          component={getComponent('learn', Questionary)}
        />
        <PrivateRoute
          path="/learn/case-studies/:slug"
          component={getComponent('learn', CaseStudyVideo)}
        />
        <PrivateRoute
          path="/learn/case-studies"
          component={getComponent('learn', CaseStudy)}
        />
        <PrivateRoute
          path="/learn/learningPath"
          component={getComponent('learn', LearningPath)}
        />
        <PrivateRoute
          exact
          path="/settings"
          component={getComponent('settings', Settings)}
        />
        <PrivateRoute
          exact
          path="/settings/profile"
          component={getComponent('settings_profile', ProfilePage)}
        />
        <PrivateRoute
          path="/settings/security"
          component={getComponent('settings_security', Security)}
        />
        <PrivateRoute
          path="/settings/notifications"
          component={getComponent('settings_notifications', Notification)}
        />
        <PrivateRoute
          path={routes.notificationsAll}
          component={NotificationsAll}
        />
        <PrivateRoute
          path={routes.branding}
          component={getComponent('settings_branding', SiteSettings)}
        />
        <PrivateRoute
          path={routes.integrations}
          component={getComponent('settings_integrations', Integrations)}
        />
        <PrivateRoute
          path={routes.pipelinesAndStages}
          component={getComponent(
            'settings_pipeline_stages',
            PipelinesAndStages
          )}
        />
        <PrivateRoute
          path={routes.fields}
          component={getComponent('settings_fields', Fields)}
        />
        <PrivateRoute
          path="/settings/bulk-import"
          component={getComponent('resources', BulkImportPage)}
          exact
        />
        <PrivateRoute
          path="/settings/bulk-import/:type"
          component={getComponent('resources', BulkImport)}
          exact
        />
        <PrivateRoute
          exact
          path={routes.training}
          component={getComponent('learn', Resources)}
        />
        <PrivateRoute
          exact
          path={routes.learn}
          component={getComponent('learn', Resources)}
        />
        <PrivateRoute
          requireAdminAccess
          exact
          path="/settings/resources/:userId"
          component={getComponent('resources', ResendInvite)}
        />
        <PrivateRoute
          requireAdminAccess
          exact
          path="/settings/workflow"
          component={WorkFlow}
        />
        <PrivateRoute
          requireAdminAccess
          exact
          path={`${routes.workflow}/view`}
          component={WorkFlowDetail}
        />
        <PrivateRoute
          requireAdminAccess
          exact
          path={routes.users}
          component={getComponent('settings_profile', Users)}
        />
        <PrivateRoute
          requireAdminAccess
          exact
          path="/settings/products"
          component={getComponent('settings_products', Products)}
        />

        <PrivateRoute
          requireAdminAccess
          path={`${routes.roles}/:id`}
          component={getComponent('setting_profile', Roles)}
        />
        <PrivateRoute
          isSplitView={true}
          path={`${routes.contacts}/:organizationId/organization/profile/activity/:activityId`}
          component={getComponent('companies', OrganizationProfile)}
        />

        <PrivateRoute
          exact
          path={routes.resources}
          component={getComponent('prospecting', Resrcs)}
        />
        <PrivateRoute
          exact
          path={routes.prospecting}
          component={getComponent('prospecting', Resrcs)}
        />
        <PrivateRoute
          exact
          path={routes.aiAssist}
          component={getComponent('ai_assist', AIAssist)}
        />
        <PrivateRoute
          exact
          path={routes.resourcesOrganization}
          component={ProspectCompanyDetails}
        />
        <PrivateRoute
          exact
          path="/prospects/people/:id"
          component={getComponent('contacts', PeopleDetail)}
        />
        <PrivateRoute
          exact
          path="/prospects/company/:id"
          component={getComponent('companies', CompanyDetail)}
        />
        <PrivateRoute
          requireAdminAccess
          exact
          path={`${routes.users}/:id`}
          component={ResendInvite}
        />
        <PrivateRoute
          exact
          path={`${routes.usersProfile}/:id`}
          component={UserProfile}
        />
        <PrivateRoute
          requireAdminAccess
          path={`${routes.groups}/:id`}
          component={Groups}
        />
        <PrivateRoute
          requireAdminAccess
          path={`${routes.ManageRoles}/:id`}
          component={ManageRoles}
        />
        <PrivateRoute
          requireAdminAccess
          exact
          path={routes.tenant}
          component={Tenants}
        />
        <PrivateRoute
          requireAdminAccess
          exact
          path="/training"
          component={Resources}
        />

        {/* Errors views */}

        <PrivateRoute
          exact
          path={routes.errors.Unauthorized}
          component={Unauthorized}
        />
        {!profileInfo?.role?.admin_access && tenant?.modules && (
          <PrivateRoute path={'/'} component={getRootComponent()} />
        )}
        {profileInfo?.role?.admin_access && (
          <>
            {window.location.pathname === '/tenants' ||
            window.location.pathname === '/settings' ? (
              <>
                <PrivateRoute path={routes.tenant} component={Tenants} />
                <PrivateRoute path="/settings" component={Settings} />
                <PrivateRoute
                  path="/settings/profile"
                  component={ProfilePage}
                />
                <PrivateRoute path="/settings/security" component={Security} />
                <PrivateRoute
                  path="/settings/notifications"
                  component={Notification}
                />
                <PrivateRoute path={routes.branding} component={SiteSettings} />
              </>
            ) : (
              <Redirect to="/tenants" />
            )}
            <Redirect to="/tenants" />
          </>
        )}
      </Switch>
    </Router>
  );
};
