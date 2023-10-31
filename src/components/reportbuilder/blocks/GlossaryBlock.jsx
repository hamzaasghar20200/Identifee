import { Card, CardBody, FormGroup, Label } from 'reactstrap';
import React from 'react';
import { defaultGlossary } from '../../../utils/constants';

const GlossaryTypes = {
  'Accounts Payable (AP) Automation': 'Accounts Payable (AP) Automation',
  'Accounts Receivable (AR) Automation': 'Accounts Receivable (AR) Automation',
  'Cash Conversion Cycle (CCC)': 'Cash Conversion Cycle (CCC)',
  'Commercial Card': 'Commercial Card',
  'Days Inventory Outstanding (DIO)': 'Days Inventory Outstanding (DIO)',
  'Days Payable Outstanding (DPO)': 'Days Payable Outstanding (DPO)',
  'Days Sales Outstanding (DSO)': 'Days Sales Outstanding (DSO)',
  'Earnings Credit Rate (ECR)': 'Earnings Credit Rate (ECR)',
  'Enterprise Resource Planning (ERP) System':
    'Enterprise Resource Planning (ERP) System',
  EstimatedTotalPayments: 'Estimated Total Payments',
  'Estimated Total Payments': 'Estimated Total Payments',
  EstimatedTotalReceivables: 'Estimated Total Receivables',
  'Estimated Total Receivables': 'Estimated Total Receivables',
  'Positive Pay': 'Positive Pay',
};

const GlossaryItems = ({ report, setReport, whenPrinting }) => {
  const items = [];
  for (const key in defaultGlossary) {
    items.push({
      id: key,
      text: defaultGlossary[key],
    });
  }
  return (
    <div>
      {items.map((glos) => (
        <GlossaryItem
          key={glos.id}
          report={report}
          setReport={setReport}
          keyName={glos.id}
          clazz="font-size-sm2"
          readOnly={true}
          whenPrinting={whenPrinting}
        />
      ))}
    </div>
  );
};
const GlossaryItem = ({
  report,
  setReport,
  keyName,
  readOnly,
  clazz,
  whenPrinting,
}) => {
  const glossary = report?.glossary || defaultGlossary;
  const handleChangeInput = (e, key) => {
    setReport({
      ...report,
      glossary: {
        ...report.glossary,
        [key]: e.target.value,
      },
    });
  };
  return (
    <>
      {readOnly ? (
        <div
          className={`${clazz} ${
            whenPrinting ? 'fs-10 py-1' : 'py-2'
          } glossary-item border-bottom`}
        >
          <p
            className={`font-weight-semi-bold mb-0 ${
              whenPrinting ? 'pb-0 fs-10 mb-0' : ''
            }`}
          >
            {keyName}
          </p>
          <p className={whenPrinting ? 'pb-0 fs-10 mb-0' : 'mb-0'}>
            {glossary[keyName]}
          </p>
        </div>
      ) : (
        <FormGroup>
          <Label for="title">{keyName}</Label>
          <textarea
            rows="3"
            name={keyName?.replace(' ', '')}
            maxLength={320}
            value={glossary[keyName]}
            onChange={(e) => {
              handleChangeInput(e, keyName);
            }}
            className="form-control"
          />
        </FormGroup>
      )}
    </>
  );
};

const GlossaryBlock = ({ report, setReport, whenPrinting, editable }) => {
  return (
    <div className={whenPrinting ? 'px-5' : 'px-3'}>
      {editable ? (
        <>
          <GlossaryItem
            report={report}
            setReport={setReport}
            keyName={GlossaryTypes.EstimatedTotalPayments}
          />
          <GlossaryItem
            report={report}
            setReport={setReport}
            keyName={GlossaryTypes.EstimatedTotalReceivables}
          />
          <GlossaryItem
            report={report}
            setReport={setReport}
            keyName={GlossaryTypes.PaymentRisk}
          />
          <GlossaryItem
            report={report}
            setReport={setReport}
            keyName={GlossaryTypes.AutomatingAccountsReceivables}
          />
        </>
      ) : (
        <Card className={`text-left mb-2`}>
          <CardBody className="py-2 glossary-items">
            <GlossaryItems whenPrinting={whenPrinting} />
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default GlossaryBlock;
