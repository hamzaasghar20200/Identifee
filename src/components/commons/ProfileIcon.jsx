import MaterialIcon from './MaterialIcon';
import TooltipComponent from '../lesson/Tooltip';

const ProfileIcon = ({ prospect, defaultSize }) => {
  const innerSize = defaultSize === 'xl' ? 'lg' : 'sm';
  return (
    <TooltipComponent title={prospect.full_name}>
      <div
        className={`avatar avatar-${defaultSize} avatar-circle`}
        style={{ background: '#cfd7db' }}
      >
        <p className={`p-1 avatar-initials text-center avatar-icon-font-size`}>
          <span
            className={`avatar-${innerSize} rounded-circle avatar-circle text-white`}
            style={{ background: '#718594', color: '#cfd7db' }}
          >
            <MaterialIcon
              icon={prospect?.employees ? 'domain' : 'person'}
              style={{ verticalAlign: '-0.1em', fontSize: '1.7rem' }}
            />
          </span>
        </p>
      </div>
    </TooltipComponent>
  );
};

export default ProfileIcon;
