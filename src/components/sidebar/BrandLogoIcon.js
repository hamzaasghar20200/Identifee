import React, { useEffect, useState } from 'react';
import TenantLogo from '../commons/TenantLogo';
import avatarService from '../../services/avatar.service';
import { changeFavIcon } from '../../utils/Utils';
import Skeleton from 'react-loading-skeleton';

export default function BrandLogoIcon({ tenant }) {
  const [isLoading, setIsLoading] = useState(false);
  const setFavIcon = async () => {
    setIsLoading(true);
    try {
      const logo = await avatarService.getAvatarMemo(tenant.icon, true);
      if (logo) {
        changeFavIcon(logo.url);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    setFavIcon();
  }, [tenant]);

  return (
    <>
      {isLoading ? (
        <div className="mb-4 text-center">
          <Skeleton height={52} width={160} />
        </div>
      ) : (
        <>
          {tenant?.logo && tenant?.use_logo && (
            <TenantLogo
              alt={`${tenant.name} Logo`}
              tenant={tenant}
              imageStyle="size-logo-login"
            />
          )}
          {tenant?.icon && !tenant?.use_logo && (
            <TenantLogo
              alt={`${tenant.name} Logo`}
              tenant={{ ...tenant, logo: tenant.icon }}
              imageStyle="size-logo-login"
            />
          )}
        </>
      )}
    </>
  );
}
