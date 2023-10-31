import React from 'react';
import AAPaymentRisksBlock from '../AAPaymentRisksBlock';
import IconHeadingBlock from '../IconHeadingBlock';
import ReportBlockWrapper from '../../../reports/ReportBlockWrapper';
import FraudMitigationBlock from '../FraudMitigationBlock';
import BusinessEmailCompromiseBlock from '../BusinessEmailCompromiseBlock';

const Fraud = ({
  wrap = true,
  report,
  whenPrinting,
  selectedTenant,
  ignoreHeadings,
}) => {
  const Blocks = () => {
    return (
      <>
        {!ignoreHeadings && whenPrinting && (
          <div className="text-left mb-1">
            <br />
            <IconHeadingBlock
              heading="Fraud"
              icon="price_check"
              containerStyle={
                whenPrinting ? 'gap-1 px-5 mb-1' : 'px-3 gap-1 mb-1'
              }
            />
          </div>
        )}
        <AAPaymentRisksBlock whenPrinting={whenPrinting} report={report} />
        <FraudMitigationBlock whenPrinting={whenPrinting} />
        <BusinessEmailCompromiseBlock whenPrinting={whenPrinting} />
      </>
    );
  };
  return (
    <>
      {!ignoreHeadings && (
        <div className="text-left mb-3">
          <br />
          <IconHeadingBlock
            heading="Fraud"
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
          current={5}
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

export default Fraud;
