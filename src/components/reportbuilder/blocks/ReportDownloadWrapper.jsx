const ReportDownloadWrapper = ({
  containerClass = 'px-3',
  whenPrinting,
  containerPrintClass = 'px-5',
  children,
}) => {
  const clientClassess = document.URL.includes('clientportal')
    ? 'px-0'
    : containerClass;
  return (
    <div className={whenPrinting ? containerPrintClass : clientClassess}>
      {children}
    </div>
  );
};

export default ReportDownloadWrapper;
