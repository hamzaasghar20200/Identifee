import AAFeeSummaryOverviewBlock from '../AAFeeSummaryOverviewBlock';
import AAFeeSummaryAllocationBlock from '../AAFeeSummaryAllocationBlock';
import ReportBlockWrapper from '../../../reports/ReportBlockWrapper';
import React from 'react';
import IconHeadingBlock from '../IconHeadingBlock';

const FeeSummary = ({
  wrap = true,
  report,
  totalPages,
  excelBankMode,
  whenPrinting,
  selectedTenant,
  ignoreHeadings,
  feeAllocationData,
}) => {
  const Blocks = () => {
    return (
      <>
        {!ignoreHeadings && whenPrinting && (
          <div className="text-left mb-1">
            <br />
            <IconHeadingBlock
              heading="Fee Summary"
              icon="price_check"
              containerStyle={
                whenPrinting ? 'gap-1 px-5 mb-1' : 'px-3 gap-1 mb-1'
              }
            />
          </div>
        )}
        <AAFeeSummaryOverviewBlock
          report={report}
          whenPrinting={whenPrinting}
          excelBankMode={excelBankMode}
          ignoreHeadings={true}
        />
        <AAFeeSummaryAllocationBlock
          feeAllocation={feeAllocationData}
          whenPrinting={whenPrinting}
          current={5}
          total={totalPages}
          report={report}
          excelBankMode={excelBankMode}
          selectedTenant={selectedTenant}
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
            heading="Fee Summary"
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
          current={6}
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

export default FeeSummary;
