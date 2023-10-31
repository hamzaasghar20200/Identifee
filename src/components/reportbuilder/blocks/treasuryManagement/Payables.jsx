import ReportBlockWrapper from '../../../reports/ReportBlockWrapper';
import CompaniesSalesBlock from '../CompaniesSalesBlock';
import ImproveVendorRelationshipBlock from '../ImproveVendorRelationshipBlock';
import AAPayablesPaymentTypesBlock from '../AAPayablesPaymentTypesBlock';
import React from 'react';
import IconHeadingBlock from '../IconHeadingBlock';

const Payables = ({
  wrap = true,
  report,
  whenPrinting,
  insightsData,
  loaderInsights,
  ignoreHeadings,
  selectedTenant,
}) => {
  const Blocks = () => {
    return (
      <>
        {!ignoreHeadings && whenPrinting && (
          <div className="text-left mb-1">
            <br />
            <IconHeadingBlock
              heading="Payables"
              icon="price_check"
              containerStyle={
                whenPrinting ? 'gap-1 px-5 mb-1' : 'px-3 gap-1 mb-1'
              }
            />
          </div>
        )}
        <CompaniesSalesBlock whenPrinting={whenPrinting} />
        <AAPayablesPaymentTypesBlock
          report={report}
          whenPrinting={whenPrinting}
          insightsData={insightsData}
          loader={loaderInsights}
          ignoreHeadings={true}
        />
        <ImproveVendorRelationshipBlock whenPrinting={whenPrinting} />
      </>
    );
  };
  return (
    <>
      {!ignoreHeadings && (
        <div className="text-left mb-3">
          {!whenPrinting && <br />}
          <IconHeadingBlock
            heading="Payables"
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
          current={3}
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

export default Payables;
