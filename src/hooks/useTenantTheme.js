import { useTenantContext } from '../contexts/TenantContext';
import { hexToHSL, isDisplayWelcomeScreen } from '../utils/Utils';
import { useEffect } from 'react';

const useTenantTheme = () => {
  const { tenant } = useTenantContext();

  const setTheme = () => {
    if (tenant?.colors) {
      document.documentElement.style.setProperty(
        '--primaryColor',
        tenant.colors.primaryColor
      );
      document.documentElement.style.setProperty(
        '--secondaryColor',
        tenant.colors.secondaryColor
      );
      const primaryHslCode = hexToHSL(tenant.colors.secondaryColor)?.colorCode;
      document.documentElement.style.setProperty(
        '--primaryColorHsl',
        primaryHslCode + ''
      );

      document.documentElement.style.setProperty(
        '--primaryColorRgb',
        `hsla(${primaryHslCode}, 100%, 5%, 1)`
      );
      document.documentElement.style.setProperty(
        '--primaryColorRgba',
        `hsla(${primaryHslCode}, 100%, 50%, 0.8)`
      );
    }
    if (isDisplayWelcomeScreen(tenant?.modules)) {
      document.documentElement.style.setProperty('--body-bg-color', `#ffffff`);
    }
  };

  useEffect(() => {
    setTheme();
  }, [tenant]);
};

export default useTenantTheme;
