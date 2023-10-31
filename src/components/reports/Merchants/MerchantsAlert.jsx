import MaterialIcon from '../../commons/MaterialIcon';

export const MerchantsAlert = ({ data, startDownload }) => {
  return (
    <div
      className={`${
        startDownload ? 'p-3' : 'p-3'
      } d-flex gap-3 align-items-center rounded-lg rpt-blue-box ${
        data?.classnames
      }`}
    >
      {data?.icon && (
        <MaterialIcon
          icon={data?.icon}
          clazz={`bg-white p-2 rounded-lg  ${
            startDownload ? 'font-size-2xl' : 'font-size-4xl'
          } ${data?.color}`}
        />
      )}

      <p className={`mb-0 px-1 font-size-sm2 ${data?.textClass}`}>
        {data?.desc}
      </p>
    </div>
  );
};
