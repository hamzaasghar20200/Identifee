import { BreadcrumbItem, Breadcrumb as RBreadcrumb } from 'react-bootstrap';
import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import routes from '../utils/routes.json';
import { BRANDING_LABEL } from './constants';
import { TenantContext } from '../contexts/TenantContext';
import { getRootComponentName } from '../utils/Utils';
import useIsTenant from '../hooks/useIsTenant';
import { useModuleContext } from '../contexts/moduleContext';

const breadcrumbLocation = ({ pathname }) => {
  const isSynovus = useIsTenant().isSynovusBank;
  const { moduleMap } = useModuleContext();
  if (
    pathname.includes(routes.dealsPipeline) &&
    !pathname.includes('settings')
  ) {
    return ['Pipeline'];
  } else if (pathname.includes(routes.prospecting)) {
    return ['Prospecting'];
  } else if (pathname.includes(routes.reporting)) {
    return ['Reporting'];
  } else if (
    pathname.includes(routes.pipeline2) &&
    !pathname.includes('settings')
  ) {
    return ['Pipeline'];
  } else if (pathname.includes(routes.quizConfiguration)) {
    return ['Quiz Configuration'];
  } else if (pathname.includes('organization/profile')) {
    return isSynovus ? ['Insights'] : ['Companies'];
  } else if (pathname === '/contacts') {
    return ['Contacts'];
  } else if (pathname.includes(routes.companies)) {
    return ['Companies'];
  } else if (pathname.includes('contacts/')) {
    return ['Contacts'];
  } else if (pathname.includes(routes.resources)) {
    return ['Resources'];
  } else if (pathname.includes('insights/dashboard')) {
    return ['Insights', 'Dashboard'];
  } else if (pathname.includes(routes.insights)) {
    return ['Insights'];
  } else if (pathname.includes(routes.insightsCompanies)) {
    return ['Insights'];
  } else if (pathname === '/settings') {
    return ['Settings'];
  } else if (pathname === '/settings/profile') {
    return ['Settings', 'Profile'];
  } else if (pathname.includes('/settings/security')) {
    return ['Settings', 'Security'];
  } else if (pathname.includes('/settings/notifications')) {
    return ['Settings', 'Notifications'];
  } else if (pathname.includes(routes.integrations)) {
    return ['Settings', 'Integrations'];
  } else if (pathname.includes(routes.pipelinesAndStages)) {
    return [
      'Settings',
      `${
        moduleMap.deal === undefined ? '' : moduleMap.deal.singular
      } and Stages`,
    ];
  } else if (pathname.includes(routes.fields)) {
    return ['Settings', 'Fields'];
  } else if (pathname.includes(routes.tenant)) {
    return ['Tenants'];
  } else if (pathname.includes(routes.Activities)) {
    return ['Activities'];
  } else if (pathname.includes(routes.aiAssist)) {
    return ['AI Assist'];
  } else if (
    pathname.includes(routes.learnMain) &&
    !pathname.includes('/settings')
  ) {
    return ['Learn'];
  } else if (
    pathname.includes('/settings/users') ||
    pathname.includes('/settings/profile/users')
  ) {
    return ['Settings', 'Users and Controls'];
  } else if (pathname.includes(routes.training)) {
    return ['Settings', 'Training'];
  } else if (pathname.includes(routes.learn)) {
    return ['Settings', 'Learn'];
  } else if (pathname.includes(routes.branding)) {
    return ['Settings', BRANDING_LABEL];
  } else if (pathname.includes('/settings/products')) {
    return ['Settings', 'Products'];
  } else if (pathname.includes(routes.favorites)) {
    return ['Learn', 'My Favorites'];
  } else if (pathname.includes(routes.selfAssessment)) {
    if (pathname.includes('results')) {
      return ['Training', 'Self-Assessment Results'];
    }
    return ['Learn', 'Self-Assessment'];
  } else if (pathname.includes('/learn/lessons')) {
    return ['Learn', 'Lessons'];
  } else if (pathname.includes('/learn/categories')) {
    return ['Learn', 'Explore'];
  } else if (pathname.includes('/learn/learningPath')) {
    return ['Learn', 'Learning Path'];
  } else if (pathname.includes('/learn/courses')) {
    return ['Learn', 'Learning Path'];
  } else if (pathname.includes(routes.notificationsAll)) {
    return ['Notifications'];
  } else {
    return [];
  }
};

export const getTitleBreadcrumb = (pathname) => {
  const { tenant } = useContext(TenantContext);
  let splitSection = breadcrumbLocation({ pathname });
  if (pathname === '/') {
    splitSection = getRootComponentName(tenant);
  }
  const tenantName = `${tenant?.name ?? 'Identifee'}`;
  if (splitSection.length === 0) return tenantName;
  return `${splitSection[splitSection.length - 1]} - ${tenantName}`;
};

const Breadcrumb = (props) => {
  const { tenant } = useContext(TenantContext);

  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  const getUrlBySection = (modules) => {
    if (modules.length > 1) {
      const mainModule = modules[0];
      if (mainModule === 'Settings') {
        return '/settings';
      } else if (mainModule === 'Contacts') {
        return '/contacts';
      }
    }

    return '#';
  };

  const location = useLocation();
  let splitSection = breadcrumbLocation(location);
  const modules = splitSection;
  if (location.pathname === '/') {
    splitSection = getRootComponentName(tenant);
  }

  const getTitle = (title) => {
    if (title === 'Companies')
      return capitalizeFirstLetter(props.moduleMap.organization.plural);
    else if (title === 'Contacts')
      return capitalizeFirstLetter(props.moduleMap.contact.plural);
    else if (title === 'Pipeline')
      return capitalizeFirstLetter(props.moduleMap.deal.plural);
    return capitalizeFirstLetter(title);
  };
  return (
    <RBreadcrumb className="mt-3 text-normal-bold">
      {splitSection?.map((section, index) =>
        splitSection?.length > 1 && !modules.includes('Training') ? (
          <BreadcrumbItem
            key={section}
            linkAs={Link}
            linkProps={{ to: getUrlBySection(modules) }}
            active={index > 0 && splitSection.length > 1 && 'text-muted'}
            className={index === 0 && splitSection.length > 1 && 'text-black'}
          >
            {section}
          </BreadcrumbItem>
        ) : (
          <BreadcrumbItem
            key={section}
            active
            className={index === 0 && splitSection.length > 1 && 'text-muted'}
          >
            {getTitle(section)}
          </BreadcrumbItem>
        )
      )}
    </RBreadcrumb>
  );
};

export default Breadcrumb;
