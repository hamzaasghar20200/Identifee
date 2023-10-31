import AAAddedValueBlock from '../AAAddedValueBlock';
import ElectronicPaymentsSavingsBlock from '../ElectronicPaymentsSavingsBlock';
import ReportBlockWrapper from '../../../reports/ReportBlockWrapper';
import React from 'react';
import IconHeadingBlock from '../IconHeadingBlock';

const Overview = ({
  wrap = true,
  report,
  excelBankMode,
  ignoreHeadings,
  whenPrinting,
  selectedTenant,
}) => {
  const Blocks = () => {
    return (
      <>
        {!ignoreHeadings && whenPrinting && (
          <div className="text-left mb-1">
            <br />
            <IconHeadingBlock
              heading="Overview"
              icon="account_balance"
              containerStyle={
                whenPrinting ? 'gap-1 px-5 mb-1' : 'px-3 gap-1 mb-1'
              }
            />
          </div>
        )}
        <AAAddedValueBlock
          report={report}
          whenPrinting={whenPrinting}
          excelBankMode={excelBankMode}
          ignoreHeadings={ignoreHeadings}
        />
        <ElectronicPaymentsSavingsBlock
          title="Electronic Payments = Savings"
          source="Source: AFP"
          texts={[
            'Checks are costly to send and receive. Manual processing, which involves tasks such as managing stock, preparing envelopes, and covering postage expenses, significantly escalates the overall cost of using checks as a payment method.',
            'Checks are also more susceptible to fraud than any other electronic payment method further contributing to their costliness.',
          ]}
          whenPrinting={whenPrinting}
        />
      </>
    );
  };
  return (
    <>
      {!ignoreHeadings && (
        <div className="text-left">
          <br />
          <IconHeadingBlock
            heading="Overview"
            icon="account_balance"
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
          current={2}
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

export default Overview;
