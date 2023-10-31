import { useProfileContext } from '../../contexts/profileContext';
import { useEffect, useState } from 'react';
import AnimatedTabs from '../commons/AnimatedTabs';

const UsersTab = [
  {
    tabId: '1',
    title: 'Users',
    icon: 'group_add',
    requiredAdminAccess: true,
    requiredOwnerAccess: true,
  },
  {
    tabId: '2',
    title: 'Profiles',
    icon: 'lock',
    requiredAdminAccess: false,
    requiredOwnerAccess: true,
  },
  {
    tabId: '3',
    title: 'Roles',
    icon: 'account_tree',
    requiredAdminAccess: false,
    requiredOwnerAccess: true,
  },
  {
    tabId: '4',
    title: 'Teams',
    icon: 'groups',
    requiredAdminAccess: false,
    requiredOwnerAccess: true,
  },
];

export default function UsersSubheading({ activeTab, toggle }) {
  const { profileInfo } = useProfileContext();
  const [adminAccess, setAdminAccess] = useState();
  useEffect(() => {
    setAdminAccess(profileInfo?.role?.admin_access);
  }, [profileInfo]);
  return (
    <>
      <AnimatedTabs
        tabsData={UsersTab}
        activeTab={activeTab}
        toggle={toggle}
        requiredAdminAccess={activeTab === '1' ? true : !adminAccess}
      />
    </>
  );
}
