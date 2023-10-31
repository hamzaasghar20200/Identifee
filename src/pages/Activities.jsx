import { useModuleContext } from '../contexts/moduleContext';
import AllActivities from '../views/ActivitiesViews/AllActivities';

const Activities = () => {
  const { moduleMap } = useModuleContext();

  return <>{moduleMap.task && <AllActivities data={moduleMap} />}</>;
};

export default Activities;
