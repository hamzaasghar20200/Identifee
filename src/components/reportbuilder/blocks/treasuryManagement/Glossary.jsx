import IconHeadingBlock from '../IconHeadingBlock';
import React from 'react';
import ReportBlockWrapper from '../../../reports/ReportBlockWrapper';
import GlossaryBlock from '../GlossaryBlock';
import ReferencesBlock from '../ReferencesBlock';

const Glossary = ({
  wrap = true,
  whenPrinting,
  report,
  setReport,
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
              heading="Glossary of Terms"
              icon="menu_book"
              containerStyle={
                whenPrinting ? 'gap-1 px-5 mb-1' : 'px-3 gap-1 mb-1'
              }
            />
          </div>
        )}
        <GlossaryBlock
          report={report}
          whenPrinting={whenPrinting}
          setReport={setReport}
        />
        <ReferencesBlock whenPrinting={whenPrinting} />
      </>
    );
  };
  return (
    <>
      {!ignoreHeadings && (
        <div className="text-left mb-3">
          <br />
          <IconHeadingBlock
            heading="Glossary of Terms"
            icon="menu_book"
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
          current={7}
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

export default Glossary;
