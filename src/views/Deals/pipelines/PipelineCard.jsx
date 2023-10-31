const PipelineCard = ({
  children,
  title,
  classNameProp,
  customFields = [],
  onClick,
  noEditIcon,
  isPrincipalOwner,
}) => {
  const objLength = Object.keys(customFields).length;

  return (
    <div className={`card ${classNameProp}`}>
      <div className="card-header py-2 px-3" style={{ minHeight: 45 }}>
        <h4 className="card-title">{title}</h4>
        {!noEditIcon && isPrincipalOwner && objLength > 0 && (
          <div className="ml-auto">
            <button
              className="btn btn-icon btn-sm icon-hover-bg rounded-circle"
              title="Edit all fields"
              onClick={onClick}
            >
              <i className="material-icons-outlined">edit</i>
            </button>
          </div>
        )}
      </div>

      {children}
    </div>
  );
};

export default PipelineCard;
