import React, { useState, useEffect, useContext } from 'react';
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  FormGroup,
  Label,
} from 'reactstrap';
import { Col } from 'react-bootstrap';

import dataReportConstants from '../../utils/constants/dataReport.json';
import { CardButton } from '../layouts/CardLayout';
import authService from '../../services/auth.service';
import AutoComplete from '../AutoComplete';
import contactService from '../../services/contact.service';
import { useTenantContext } from '../../contexts/TenantContext';
import { AlertMessageContext } from '../../contexts/AlertMessageContext';

const constants = dataReportConstants.strings;

const SendOrDownloadModal = ({
  contact,
  showModal,
  setShowModal,
  getProfileInfo,
  setToast,
  setColorToast,
  organizationId,
}) => {
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const { tenant } = useTenantContext();
  const { clientPortalUrl, id } = tenant;
  const { setSuccessMessage } = useContext(AlertMessageContext);

  const sendReport = async (emails) => {
    const invitationResults = emails?.map(async (email) => {
      await authService.guestToken(email.email, organizationId);
    });

    await Promise.all(invitationResults);
  };

  const handleCloseModal = () => {
    setIsLoadingEmail(false);
    setShowModal(false);
  };

  const handleAlreadySentReportNotif = () => {
    handleCloseModal();

    setColorToast(constants.colors.danger);
    return setToast('Email already sent before');
  };

  const handleSendReport = async () => {
    setIsLoadingEmail(true);

    await sendReport(selectedItem).catch(() => handleAlreadySentReportNotif());

    handleCloseModal();

    setToast('E-mail sent successfully');
    setColorToast(constants.colors.success);
  };

  const [selectedItem, setSelectedItem] = useState([]);
  const [data, setData] = useState([]);

  const onCopyLink = (e) => {
    const params = new URLSearchParams();
    params.set('tenant_id', id);
    if (selectedItem.length > 0) {
      params.set('email', selectedItem[0].email);
    }
    navigator.clipboard.writeText(
      `${clientPortalUrl}/clientportal/login?${params.toString()}`
    );
    setSuccessMessage('Link copied!');
  };
  const searchContacts = async () => {
    try {
      const { data } = await contactService.getContact(
        { organization_id: organizationId },
        { limit: 10, page: 1 }
      );
      setData(
        data.contacts?.map((u) => ({
          ...u,
          name: `${u.first_name} ${u.last_name}`,
        }))
      );
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    searchContacts();
  }, []);

  return (
    <Modal isOpen={showModal} fade={false} size="lg" className="w-600">
      <ModalHeader tag="h2" className="p-3" toggle={() => setShowModal(false)}>
        Share Client Portal
      </ModalHeader>
      <ModalBody className="border-top mb-0 p-3">
        <FormGroup>
          <Label className="mb-0">{`Select ${contact}`}</Label>
        </FormGroup>
        <AutoComplete
          id="assigned_user_id"
          placeholder={`Search for ${contact}`}
          name="assigned_user_id"
          showAvatar={true}
          loading={false}
          onChange={(items, itemToRemove) => {
            const updatedContacts = [...items].filter(
              (c) => c.id !== itemToRemove.id
            );

            const contacts = updatedContacts?.map((c) => ({
              ...c,
              email:
                c.email_work || c.email_home || c.email_fax || c.email_other,
            }));
            setSelectedItem(contacts);
            if (!contacts.length) {
              setSelectedItem([]);
            }
          }}
          data={data}
          showIcon={false}
          isMultiple={true}
          selected={selectedItem}
          onHandleSelect={(item) => {
            const updatedContacts = [...selectedItem, item];
            const contacts = updatedContacts?.map((c) => ({
              ...c,
              email:
                c.email_work || c.email_home || c.email_fax || c.email_other,
            }));
            setSelectedItem(contacts);
          }}
          customKey="name"
        />
      </ModalBody>
      <ModalFooter className="p-3 gap-2">
        <Col
          className={`d-flex align-items-center justify-content-between p-0`}
        >
          <div>
            <CardButton
              type="button"
              className={'btn-sm btn-primary'}
              title="Copy Login Link"
              icon="copy_all"
              onClick={onCopyLink}
            />
          </div>
          <div className="d-flex align-items-center gap-1 ml-auto">
            <CardButton
              className={'font-weight-500 btn-sm btn-white'}
              title={`Cancel`}
              onClick={handleCloseModal}
            />
            {selectedItem?.length > 0 && (
              <CardButton
                className={'font-weight-500 btn-sm btn-primary'}
                title={`Send`}
                icon={`email`}
                isLoading={isLoadingEmail}
                onClick={handleSendReport}
              />
            )}
          </div>
        </Col>
      </ModalFooter>
    </Modal>
  );
};

export default SendOrDownloadModal;
