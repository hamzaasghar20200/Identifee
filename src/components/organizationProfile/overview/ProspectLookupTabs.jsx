import LookupPeople from './LookupPeople';

const ProspectLookupTabs = ({ profileInfo }) => {
  return (
    <div className="px-4">
      <LookupPeople profileInfo={profileInfo} />
    </div>
  );
};

export default ProspectLookupTabs;
