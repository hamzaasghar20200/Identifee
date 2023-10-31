import MaterialIcon from './MaterialIcon';
import TooltipComponent from '../lesson/Tooltip';
import React, { useContext, useState, useEffect } from 'react';
import ImportOrganization from '../organizationProfile/overview/ImportOrganization';
import { ProspectTypes } from '../prospecting/v2/constants';
import prospectService from '../../services/prospect.service';
import ImportProfile from '../organizationProfile/overview/ImportProfile';
import contactService from '../../services/contact.service';
import {
  convertDataToNewDataObject,
  getDiffBetweenObjects,
  overflowing,
} from '../../utils/Utils';
import { AlertMessageContext } from '../../contexts/AlertMessageContext';

const RR_TO_CONTACT_API_DATA_OBJECT = {
  first_name: 'first_name',
  last_name: 'last_name',
  work_email: 'email_work',
  work_phone: 'phone_work',
  profile_pic: 'avatar',
  title: 'title',
  city: 'primary_address_city',
  state: 'primary_address_state',
};

const getFilterByOrganizationOrContact = (data) => {
  if (data?.first_name) {
    return {
      name: [`${data.first_name} ${data?.last_name}`],
      current_employer: [data?.organization?.name],
    }; // for people
  }

  if (data?.name) {
    return { name: [data?.name] }; // for organization
  }
};

const AutoAwesomeImport = ({ data, type, refresh }) => {
  const [openImportOrgModal, setOpenImportOrgModal] = useState(false);
  const [openImportContactModal, setOpenImportContactModal] = useState(false);
  const [importingContact, setImportingContact] = useState(false);
  const [mergingContact, setMergingContact] = useState(false);
  const [prospect, setProspect] = useState({});
  const [fromAutoAwesome, setFromAutoAwesome] = useState({
    show: true,
    loading: mergingContact,
  });
  const isImported = !!data?.external_id; // if we have external_id means this record has been imported already
  const { setSuccessMessage, setErrorMessage } =
    useContext(AlertMessageContext);

  const importedData = {
    first_name: data.first_name,
    last_name: data.last_name,
    work_email: data.email_work,
    work_phone: data.phone_work,
    profile_pic: data.avatar,
    title: data.title,
    city: data.primary_address_city,
    state: data.primary_address_state,
  };

  const getDataFromRocketReach = async () => {
    try {
      const filter = getFilterByOrganizationOrContact(data);
      const response = await prospectService.query(
        { ...filter },
        {
          page: 1,
          limit: 1,
          type: type === ProspectTypes.people ? 'query' : ProspectTypes.company,
          order_by: 'popularity',
        }
      );

      const responseData = response?.data;
      if (responseData?.data?.length) {
        const prospectData = responseData?.data[0];
        if (type === ProspectTypes.people) {
          const { data: prospectDetails } = await prospectService.getContact({
            id: prospectData.id,
          });
          const prospectWithDetails = {
            ...prospectData,
            email_work: prospectDetails?.emails?.length
              ? prospectDetails.emails[0].email
              : '',
            phone_work: prospectDetails?.phones?.length
              ? prospectDetails.phones[0].number
              : '',
            profile_pic: prospectDetails.profile_pic,
          };
          setProspect(prospectWithDetails);

          const rrData = {
            first_name: prospectWithDetails.first_name,
            last_name: prospectWithDetails.last_name,
            title: prospectWithDetails.title,
            city: prospectWithDetails.city,
            state: prospectWithDetails.state,
            work_email: prospectWithDetails.email_work,
            work_phone: prospectWithDetails.phone_work,
            profile_pic: prospectWithDetails.profile_pic,
          };
          const diff = getDiffBetweenObjects(importedData, rrData);
          const canMerge = Object.keys(diff).length !== 0;
          setFromAutoAwesome({ ...fromAutoAwesome, canMerge });
        } else {
          setProspect(prospectData);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleAutoAwesomeClick = async (e) => {
    e.preventDefault();
    if (type === ProspectTypes.company) {
      setOpenImportOrgModal(true);
    } else {
      setOpenImportContactModal(true);
    }
  };

  const handleImportContact = async () => {
    setImportingContact(true);
    try {
      const dataContact = {
        first_name: prospect.first_name,
        last_name: prospect.last_name,
        email_work: prospect.work_email,
        phone_work: prospect.work_phone || prospect.phone_work,
        avatar: prospect.profile_pic,
        title: prospect.title,
        primary_address_city: prospect.city,
        primary_address_state: prospect.state,
        external_id: '' + prospect.id,
        organization_id: data?.organization?.id || null, // importing contact and added as contact in current opened organization
      };
      await contactService.updateContact(data.id, dataContact);
      setOpenImportContactModal(false);
      overflowing();
      setSuccessMessage('Contact imported successfully.');
      if (refresh) {
        refresh(); // call to refresh data of parent.
      }
    } catch (e) {
      console.log(e);
      setErrorMessage('Error importing contact. Please try again later.');
    } finally {
      setImportingContact(false);
    }
  };

  const handleMerge = async () => {
    setMergingContact(true);
    const rrData = {
      first_name: prospect.first_name,
      last_name: prospect.last_name,
      title: prospect.title,
      city: prospect.city,
      state: prospect.state,
      work_email: prospect.email_work,
      work_phone: prospect.phone_work,
      profile_pic: prospect.profile_pic,
    };
    const diff = getDiffBetweenObjects(importedData, rrData);
    const newApiData = convertDataToNewDataObject(
      RR_TO_CONTACT_API_DATA_OBJECT,
      diff
    );
    if (Object.keys(newApiData)?.length > 0) {
      try {
        await contactService.updateContact(data.id, newApiData);
        setOpenImportContactModal(false);
        overflowing();
        setSuccessMessage('Contact data merged successfully.');
        if (refresh) {
          refresh(); // call to refresh data of parent.
        }
      } catch (e) {
        console.log(e);
        setErrorMessage('Error merging contact. Please try again later.');
      } finally {
        setMergingContact(false);
      }
    } else {
      setMergingContact(false);
      setOpenImportContactModal(false);
      overflowing();
      setSuccessMessage('Contact data merged successfully.');
    }
  };

  useEffect(() => {
    if (data?.id) {
      getDataFromRocketReach();
    }
  }, [data]);

  return (
    <>
      {openImportOrgModal && (
        <ImportOrganization
          openImportModal={openImportOrgModal}
          setOpenImportModal={setOpenImportOrgModal}
          data={data}
          prospect={prospect}
          refresh={refresh}
          modalDescription={`Would you like to Merge or Import Company? <br /> Importing will overwrite existing Company details.`}
        />
      )}
      {openImportContactModal && (
        <ImportProfile
          openImportModal={openImportContactModal}
          setOpenImportModal={setOpenImportContactModal}
          prospect={[prospect]}
          data={data}
          handleImport={handleImportContact}
          loading={importingContact}
          fromAutoAwesome={{
            ...fromAutoAwesome,
            handleMerge,
            loading: mergingContact,
          }}
          modalDescription={`Would you like to Merge or Import Contact? <br /> Importing will overwrite existing Contact details.`}
        />
      )}
      {prospect?.id ? (
        <TooltipComponent
          title={isImported ? 'Auto Complete Done!' : 'Magic Auto Complete'}
        >
          <a href="" className="icon-hover-bg" onClick={handleAutoAwesomeClick}>
            <MaterialIcon
              icon="auto_awesome"
              clazz={isImported ? 'text-gray' : 'text-warning'}
            />
          </a>
        </TooltipComponent>
      ) : (
        <></>
      )}
    </>
  );
};

export default AutoAwesomeImport;
