import MaterialIcon from '../../commons/MaterialIcon';
import { CardButton } from '../../layouts/CardLayout';
import React, { useEffect, useState } from 'react';
import prospectService from '../../../services/prospect.service';
import IconTextLoader from '../../loaders/IconText';
import RocketReachSocialLinks from './RocketReachSocialLinks';
import { formatPhoneNumber } from '../../../utils/Utils';
import { Badge } from 'react-bootstrap';

function filterArrayByDateAndSmtpValid(arr) {
  // filter out valid emails and then sort them by date descending
  const validEmails = arr.filter((email) => email.smtp_valid !== 'invalid');
  return validEmails;
}

const Count = ({ count, text, icon }) => {
  return (
    <div className="d-flex fs-7 align-items-center mr-4">
      <MaterialIcon
        icon={icon}
        clazz="p-1 bg-gray-300 rounded-circle fs-7 text-black mr-1"
      />
      <span className="text-gray-900 font-weight-semi-bold">
        {' '}
        {count} {text}
      </span>
    </div>
  );
};

const Detail = ({ text, grade, icon }) => {
  return (
    <div className="d-flex my-1 fs-8 align-items-center">
      <MaterialIcon
        icon={icon}
        clazz={`p-1 rounded-circle fs-7 mr-1 bg-gray-300 text-black`}
      />
      <span>
        {grade && (
          <Badge
            variant={grade === 'A' ? 'success' : 'yellow'}
            className={`${
              grade === 'A' ? 'text-white' : ''
            } rounded font-size-xs mr-1 text-uppercase`}
          >
            {grade}
          </Badge>
        )}
        <span className="text-gray-900">{text} </span>
      </span>
    </div>
  );
};

// this component contains all the logic for bottom "found" section according to figma design
// contains expand/collapse for emails/phones
// using same component in org profile right bar lookup and Find prospects page table, adjusting layout according
// load true means hit the api
const RocketReachViewInfoCard = ({
  prospect,
  setProspect,
  load = false,
  layout = 'row',
  setInfoLoading = () => {},
}) => {
  const [viewDetail, setViewDetail] = useState(false);
  const [emails, setEmails] = useState([]);
  const [phones, setPhones] = useState([]);
  const [organization, setOrganization] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isInfoLoaded, setIsInfoLoaded] = useState(false);
  const [socialLinks, setSocialLinks] = useState({});
  const componentLayout = {
    heading: layout === 'row' ? '' : '',
    container:
      layout === 'row'
        ? ` flex-row ${
            viewDetail
              ? 'align-items-end justify-content-end'
              : 'align-items-center'
          }`
        : 'flex-column justify-content-start align-items-start rr-card-width',
    btn: layout === 'row' ? '' : ' btn-block mt-2 ',
  };

  const getContactInfo = async (pros) => {
    try {
      setIsLoading(true);
      setInfoLoading(true);
      const { data } = await prospectService.getContact({ id: pros.id });
      const dataOrganization =
        pros.organization ||
        (await prospectService.getCompanyRR(pros.employer));

      setIsLoading(false);
      setIsInfoLoaded(true);
      setSocialLinks(data.links);

      setEmails(filterArrayByDateAndSmtpValid(data.emails));
      setPhones(data.phones.filter((p) => p.recommended));

      setOrganization(dataOrganization);

      if (data.emails && data.emails.length) {
        // once we have loaded it, dont call again RR to fetch these
        prospect.emails_list = data.emails;
        prospect.work_email = data.emails[0].email;
      }
      if (data.phones && data.phones.length) {
        // once we have loaded it, dont call again RR to fetch these
        prospect.phones_list = data.phones;
        prospect.work_phone = data.phones[0].number;
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
      setInfoLoading(false);
    }
  };

  const toggleViewInfo = (pros) => {
    setViewDetail(!viewDetail);
    if (!viewDetail) {
      getContactInfo(pros);
    } else {
      setIsLoading(false);
      setIsInfoLoaded(false);
      setInfoLoading(false);
    }
  };

  useEffect(() => {
    if (load) {
      setOrganization(prospect.organization || {});
      if (prospect.emails_list || prospect.phones_list) {
        setViewDetail(!viewDetail);
        setIsLoading(false);
        setIsInfoLoaded(true);
        setEmails(prospect.emails_list || emails);
        setPhones(prospect.phones_list || phones);
        setInfoLoading(false);
      } else {
        toggleViewInfo(prospect);
      }
    }
  }, []);

  useEffect(() => {
    if (emails && emails.length) {
      // once we have loaded it, dont call again RR to fetch these
      prospect.emails_list = emails;
      prospect.work_email = emails[0].email;
    }
    if (phones && phones.length) {
      // once we have loaded it, dont call again RR to fetch these
      prospect.phones_list = phones;
      prospect.work_phone = phones[0].number;
    }
    if (prospect.links) {
      setSocialLinks(prospect.links);
    }
    if (organization && organization.name) {
      prospect.organization = organization;
    }
    setProspect && setProspect(prospect);
  }, [emails, phones, organization]);
  const EmailPhone = () => {
    return (
      <>
        {isLoading && (
          <div className="w-100">
            {' '}
            <IconTextLoader count={3} />
          </div>
        )}
        {isInfoLoaded && !isLoading && (
          <div>
            {emails
              ?.filter((email) => email?.grade === 'A' || email?.grade === 'B')
              ?.map((email) => (
                <Detail
                  full={email}
                  key={email.email}
                  text={email.email}
                  grade={email.grade}
                  icon="email"
                />
              ))}

            {phones?.map((phone) => (
              <Detail
                full={phone}
                key={phone.number}
                text={formatPhoneNumber(phone.number)}
                icon="phone"
              />
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <>
      {!load &&
        (prospect.teaser?.emails.length > 0 ||
          prospect.teaser?.phones.length > 0) && (
          <div className="text-left mb-2">
            <div className={`d-flex ${componentLayout.container}`}>
              {!viewDetail && (
                <div className="d-flex align-items-center flex-grow-1">
                  {prospect.teaser?.emails.length > 0 && (
                    <Count
                      count={prospect.teaser.emails.length}
                      text="Emails"
                      icon="email"
                    />
                  )}
                  {prospect.teaser?.phones.length > 0 && (
                    <Count
                      count={prospect.teaser.phones.length}
                      text="Phones"
                      icon="phone"
                    />
                  )}
                </div>
              )}
              {viewDetail && layout === 'column' && <EmailPhone />}
              {!isInfoLoaded && !viewDetail && (
                <CardButton
                  type="button"
                  icon="visibility"
                  title={viewDetail ? 'Hide Info' : 'View Info'}
                  variant="white"
                  className={`btn-sm ${componentLayout.btn}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleViewInfo(prospect);
                  }}
                />
              )}
            </div>
            {viewDetail && layout === 'row' && <EmailPhone />}
          </div>
        )}
      {load && <EmailPhone />}
      {load && isInfoLoaded && <RocketReachSocialLinks links={socialLinks} />}
    </>
  );
};

export default RocketReachViewInfoCard;
