const KpiBasicWidget = ({ data }) => {
  return (
    <div className="d-flex align-items-center justify-content-center px-0">
      <div>
        <h1 className="font-size-3em text-center">{data.count}</h1>
      </div>
    </div>
  );
};

export default KpiBasicWidget;
