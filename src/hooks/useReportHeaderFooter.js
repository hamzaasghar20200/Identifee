import useIsTenant from './useIsTenant';
import { DemoTenantsKeys } from '../components/reports/reports.constants';
import { useTenantContext } from '../contexts/TenantContext';

const useReportHeaderFooter = (selectedTenant) => {
  const { isSynovusBank, isComericaBank, isSVB } = useIsTenant();
  const { tenant } = useTenantContext();
  let reportHeaderWhiteLogo =
    isComericaBank ||
    selectedTenant?.key === DemoTenantsKeys.cb ||
    tenant?.domain?.includes('comerica')
      ? 'https://iili.io/HvYYdlt.png'
      : 'https://iili.io/HU7z4Ps.png'; // default excel bank one

  let reportFooterImage =
    isComericaBank ||
    selectedTenant?.key === DemoTenantsKeys.cb ||
    tenant?.domain?.includes('comerica')
      ? 'https://iili.io/HvYY2UX.png'
      : 'https://iili.io/HU7IIUv.png'; // default excel bank one

  if (
    isSynovusBank ||
    selectedTenant?.key === DemoTenantsKeys.sb ||
    tenant?.domain?.includes('synovus')
  ) {
    reportHeaderWhiteLogo = 'https://iili.io/HrJg6hl.png';
    reportFooterImage = 'https://iili.io/HrJgQ49.png';
  }
  if (
    isSVB ||
    selectedTenant?.key === DemoTenantsKeys.svb ||
    tenant?.domain?.includes('svb')
  ) {
    reportHeaderWhiteLogo = 'https://iili.io/HZJpi2n.png';
    reportFooterImage = 'https://iili.io/HZJps7s.png';
  }

  return { reportFooterImage, reportHeaderWhiteLogo };
};

export default useReportHeaderFooter;
