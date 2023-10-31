import IconHeadingBlock from '../IconHeadingBlock';
import React from 'react';
import ReportBlockWrapper from '../../../reports/ReportBlockWrapper';
import AAReceivablesPaymentBreakdownBlock from '../AAReceivablesPaymentBreakdownBlock';
import ReconcilingPayments from '../ReconcilingPayments';

const Receivables = ({
  wrap = true,
  report,
  setReport,
  whenPrinting,
  insightsData,
  excelBankMode,
  ignoreHeadings,
  selectedTenant,
  loaderInsights,
}) => {
  const Blocks = () => {
    return (
      <>
        {!ignoreHeadings && whenPrinting && (
          <div className="text-left mb-1">
            <br />
            <IconHeadingBlock
              heading="Receivables"
              icon="price_check"
              containerStyle={
                whenPrinting ? 'gap-1 px-5 mb-1' : 'px-3 gap-1 mb-1'
              }
            />
          </div>
        )}
        <ReconcilingPayments whenPrinting={whenPrinting} />
        <AAReceivablesPaymentBreakdownBlock
          report={report}
          loader={loaderInsights}
          insightsData={insightsData}
          whenPrinting={whenPrinting}
          excelBankMode={excelBankMode}
          ignoreHeadings={true}
          setReport={setReport}
        />
      </>
    );
  };
  return (
    <>
      {!ignoreHeadings && (
        <div className="text-left mb-3">
          <br />
          <IconHeadingBlock
            heading="Receivables"
            icon="price_check"
            containerStyle={
              whenPrinting ? 'gap-1 px-5 mb-1' : 'px-3 gap-1 mb-1'
            }
          />
        </div>
      )}
      {wrap ? (
        <ReportBlockWrapper
          ignoreHeadings={ignoreHeadings}
          showLogo={whenPrinting === true}
          current={4}
          report={report}
          selectedTenant={selectedTenant}
        >
          <Blocks />
        </ReportBlockWrapper>
      ) : (
        <Blocks />
      )}
    </>
  );
};

export default Receivables;
