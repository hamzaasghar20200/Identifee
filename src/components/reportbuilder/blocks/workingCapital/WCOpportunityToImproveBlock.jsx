import { Card, CardBody } from 'reactstrap';
import { PayableBlockTypes } from '../../../reports/reports.constants';
import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { ProgressBar } from 'react-bootstrap';
import { formatNumberV2 } from '../../../../utils/Utils';
import MaterialIcon from '../../../commons/MaterialIcon';
import naicsService from '../../../../services/naics.service';
import OrganizationService from '../../../../services/organization.service';
import TextRoundBlock from '../TextRoundBlock';

const VendorPeerPayments = ({
  whenPrinting,
  rpmg,
  setRpmg,
  report,
  organization,
}) => {
  const [loader, setLoader] = useState(false);
  const [allCardsPayment, setAllCardsPayment] = useState(rpmg?.data || 0);

  const getInsights = async () => {
    try {
      setLoader(true);
      let data = {};
      const naicsCode = report?.valueNaicsSic || organization.naics_code;
      if (naicsCode) {
        // get rpmg/sp summary by naics if company has it
        const naicsFirstTwo = naicsCode.slice(0, 2);
        data = await naicsService.getNaicsRpmgSummary(naicsFirstTwo);
        const lessThan2500 = data?.transaction_summary.find(
          (ts) => ts.transaction.range === '<2500'
        );
        setAllCardsPayment(lessThan2500?.all_card_platforms);
        setRpmg({ data: lessThan2500?.all_card_platforms });
      } else {
        data = await OrganizationService.getInsightsByOrganization(
          organization.id
        );
        const lessThan2500 = data?.transaction_summary.find(
          (ts) => ts.transaction.range === '<2500'
        );
        setAllCardsPayment(lessThan2500?.all_card_platforms);
        setRpmg({ data: lessThan2500?.all_card_platforms });
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    !whenPrinting && getInsights();
  }, []);
  return (
    <>
      <div className="py-1 pt-1 mt-3">
        <div
          style={{
            borderRadius: 'var(--borderRadius)',
            background: 'var(--lightGreyColor)',
          }}
        >
          <ProgressBar
            style={{ height: 12 }}
            isChild={true}
            now={allCardsPayment || 0}
            max={100}
            className={'progress-bar-green'}
            key={1}
          />
        </div>
        <div className="d-flex mt-2 justify-content-center align-items-center gap-2">
          <div className="d-flex align-items-center gap-1">
            <span
              className={`rounded-circle bg-success`}
              style={{ height: 12, width: 12 }}
            ></span>
            <p className="fs-10 mb-0">Vendor payments by card</p>
          </div>
          <div className="d-flex align-items-center gap-1">
            <span
              className="rounded-circle"
              style={{
                height: 12,
                width: 12,
                background: 'var(--lightGreyColor)',
              }}
            ></span>
            <p className="fs-10 mb-0">Vendor payments by other</p>
          </div>
        </div>
      </div>
      <p className="pt-2 fs-7 mb-0 text-center">
        Your peers pay{' '}
        {loader ? <Skeleton width={50} height={20} /> : <>{allCardsPayment}%</>}{' '}
        of their payables using Commercial Card. Moving payments to Commercial
        Card can greatly benefit Working Capital while not sacrificing
        vendor/supplier relationships.
      </p>
    </>
  );
};

const WCDSO = () => {
  return (
    <p className="pt-2 fs-7 mb-0 text-center mt-3">
      To improve working capital and DSO, most companies will employ offering
      multiple payment methods including the acceptance of card (merchant) and
      enable customers to receive and pay invoices online.
    </p>
  );
};

const WCOpportunityToImproveBlock = ({
  report,
  type,
  whenPrinting,
  title = 'Opportunity to Improve',
  organization,
  rpmg,
  setRpmg,
}) => {
  const { key, short } = type;
  const opportunities = {
    DPO: 'apOpportunity',
    DSO: 'arOpportunity',
  };
  const calculateDSODPO = (dsoDPO) => {
    let calcValue = report[opportunities[short]];
    if (short === PayableBlockTypes.DSO.short) {
      if (dsoDPO < report.bestInClassDSO) {
        calcValue = '';
      }
    } else if (short === PayableBlockTypes.DPO.short) {
      if (dsoDPO > report.bestInClassDPO) {
        calcValue = '';
      }
    }
    return calcValue;
  };

  const clientClassess = document.URL.includes('clientportal')
    ? 'px-0'
    : 'px-3';

  return (
    <div className={`${clientClassess} ${whenPrinting ? 'mb-1' : 'mb-3'}`}>
      <Card>
        <CardBody className="bg-primary-soft">
          <h5 className="text-left mb-1 d-flex align-items-center gap-1">
            {title}
          </h5>

          <div
            className={`d-flex align-items-center gap-2 pt-2 justify-content-center`}
          >
            <TextRoundBlock
              big={report[`your${short}`]}
              small={`Your current ${short}`}
            />
            <MaterialIcon icon="arrow_forward" clazz="font-size-2em" />
            <TextRoundBlock
              big={report[`bestInClass${short}`]}
              small={`Best-In-Class ${short}`}
            />
            <MaterialIcon icon="equal" symbols clazz="font-size-2em" />
            <TextRoundBlock
              big={formatNumberV2(
                Math.abs(calculateDSODPO(report[`your${short}`] || 0) || 0)
              )}
              color="rpt-green-box-heading"
              small="Free Cash Flow"
              bg="#ffffff"
            />
          </div>

          {key === PayableBlockTypes.DPO.key && (
            <VendorPeerPayments
              whenPrinting={whenPrinting}
              report={report}
              organization={organization}
              rpmg={rpmg}
              setRpmg={setRpmg}
            />
          )}
          {key === PayableBlockTypes.DSO.key && <WCDSO />}
        </CardBody>
      </Card>
    </div>
  );
};
export default WCOpportunityToImproveBlock;
