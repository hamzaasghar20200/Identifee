import { Card, CardBody } from 'reactstrap';
import React from 'react';
import MaterialIcon from '../../commons/MaterialIcon';

const DATA = [
  {
    id: 1,
    text: 'Verify email address',
    icon: 'check_circle',
  },
  {
    id: 2,
    text: 'Don’t money or data until verified',
    icon: 'report',
  },
  {
    id: 3,
    text: 'Maintain <br/> two-factor authentication',
    icon: 'group',
  },
  {
    id: 4,
    text: 'Use caution when pressured for quick action',
    icon: 'notifications_active',
  },
  {
    id: 5,
    text: 'Avoid interacting with unsolicited email or texts',
    icon: 'warning',
  },
];
const BusinessEmailCompromiseBlock = ({ whenPrinting }) => {
  return (
    <div className={`mb-2 ${whenPrinting ? 'px-5' : 'px-3'}`}>
      <Card>
        <CardBody className="bg-primary-soft">
          <h5 className="text-left d-flex justify-content-between mb-1 d-flex align-items-center gap-1">
            Business Email Compromise (BEC)
          </h5>
          <p
            className={`${
              whenPrinting ? 'fs-9 mb-0' : 'font-size-sm2'
            } text-left`}
          >
            Vigilance is paramount for businesses to shield against BEC attempts
            and uphold the security of sensitive data. Implement robust
            verification protocols, conduct thorough employee training, and
            fortify email security measures.
          </p>
          <div className="mt-3 d-flex align-items-center gap-2">
            {DATA.map((dt) => (
              <div
                key={dt.id}
                style={{ flex: 1, height: 125 }}
                className="bg-white gap-2 d-flex align-items-center flex-column p-2 rounded-lg text-center"
              >
                <MaterialIcon icon={dt.icon} filled clazz="text-primary fs-2" />
                <p
                  className={`mb-0 font-weight-medium ${
                    whenPrinting ? 'fs-9' : 'fs-8'
                  }`}
                  dangerouslySetInnerHTML={{ __html: dt.text }}
                />
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default BusinessEmailCompromiseBlock;
