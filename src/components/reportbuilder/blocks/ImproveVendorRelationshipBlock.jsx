import { Card, CardBody } from 'reactstrap';
import React from 'react';
import MaterialIcon from '../../commons/MaterialIcon';

const BLOCK_DATA = [
  {
    id: 1,
    text: 'Faster Receipt <br/> of Payment',
    icon: 'credit_card',
    subText: 'Commercial and Virtual Card',
  },
  {
    id: 2,
    text: 'More Secure <br/> then Checks',
    icon: 'manage_history',
    subText: 'RTP',
  },
  {
    id: 3,
    text: 'Enhanced Remittance <br/> to improve reconciliation',
    icon: 'account_balance',
    subText: 'ACH',
  },
];

const TextIconTextBlock = ({ text, icon, subText }) => {
  return (
    <div className="d-flex flex-column p-3 flex-fill justify-content-center align-items-center gap-2">
      <p
        className="fs-8 mb-0 text-clamp"
        dangerouslySetInnerHTML={{ __html: text }}
      />
      <MaterialIcon icon={icon} clazz="text-primary fs-1" />
      <p className="fs-8 mb-0 font-weight-medium">{subText}</p>
    </div>
  );
};
const ImproveVendorRelationshipBlock = ({ whenPrinting }) => {
  return (
    <div className={whenPrinting ? 'px-5' : 'px-3'}>
      <Card className={whenPrinting ? 'mb-0' : 'mb-2'}>
        <CardBody>
          <h5 className="text-left mb-1 d-flex align-items-center gap-1">
            Improve Vendor Relationships
          </h5>
          <p className="text-muted mb-1 fs-8 text-left">
            Vendors increasingly favor electronic payments due to their
            universal acceptance and benefits.
          </p>
          <div className="d-flex align-items-center px-3">
            {BLOCK_DATA.map((blk) => (
              <TextIconTextBlock key={blk.id} {...blk} />
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
export default ImproveVendorRelationshipBlock;
