import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import MentionsInput from '../../mentions/MentionsInput';
import Alert from '../../Alert/Alert';
import AlertWrapper from '../../Alert/AlertWrapper';
import feedService from '../../../services/feed.service';
import stringConstants from '../../../utils/stringConstants.json';
import IdfSelectMultiOpp from '../../idfComponents/idfDropdown/IdfSelectMultiOpp';
import routes from '../../../utils/routes.json';
import { useProfileContext } from '../../../contexts/profileContext';
import { createBlobObject } from '../../../utils/Utils';
import { MAX_WEIGHT, MAX_WEIGHT_ERROR_MESSAGE } from '../../../utils/constants';
import filesService from '../../../services/files.service';
import { useTenantContext } from '../../../contexts/TenantContext';

const constants = stringConstants.deals.contacts.profile;

const AddNote = ({
  contactId,
  getProfileInfo,
  organizationId,
  dealId,
  getDeal,
  fromNavbar,
  onChange,
  setOpenNote,
  setOverlay,
  activityId,
  from,
  feedInfoNotes,
  defaultState,
  notes,
  richNote,
  setRichNote,
  getNotes,
  placeholder,
  assigned_user_id,
  fromClientPortal,
}) => {
  const history = useHistory();
  const { profileInfo } = useProfileContext();
  const { tenant } = useTenantContext();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fileInput, setFileInput] = useState([]);

  const [name, setName] = useState('');

  const getRedirect = () => {
    if (contactId) {
      history.push(`${routes.contacts}/${contactId}/profile`);
    } else if (organizationId) {
      history.push(
        `${routes.companies}/${organizationId}/organization/profile`
      );
    } else if (dealId) {
      history.push(`${routes.dealsPipeline}/${contactId}`);
    }
  };

  const handleSubmit = async (raw) => {
    if (
      !fromClientPortal &&
      contactId === null &&
      organizationId === null &&
      dealId === null
    ) {
      setErrorMessage(constants.companyContactDealSelectMsg);
      return;
    }
    try {
      const data = await feedService.createNote(
        name,
        raw,
        contactId,
        organizationId,
        dealId,
        activityId,
        fromClientPortal ? tenant?.id : profileInfo?.tenant_id,
        fromClientPortal ? assigned_user_id : profileInfo?.id,
        fromClientPortal ? contactId : profileInfo?.id
      );
      if (data && fileInput?.length) {
        fileInput?.map(async (file) => {
          const form = new FormData();

          const formBlob = await createBlobObject(file);

          const { size } = formBlob || {};

          if (size > MAX_WEIGHT) {
            return setErrorMessage(MAX_WEIGHT_ERROR_MESSAGE);
          }
          form.append('note_id', data?.id);
          form.append('isPublic', false);
          form.append('file', formBlob, file.name);
          if (fromClientPortal && organizationId) {
            form.append('organization_id', organizationId);
          }
          try {
            await filesService.uploadFile(form);
            setSuccessMessage(constants.fileUploaded);
            setFileInput([]);
            if (activityId || fromClientPortal) {
              getNotes();
            }
          } catch (error) {
            setErrorMessage(constants.fileUploadError);
          }
        });
      }
      setSuccessMessage(constants.noteAdded);
      setName();
      if (activityId || fromClientPortal) {
        getNotes();
      }
      if (dealId) getDeal();
      if (getProfileInfo) getProfileInfo();

      if (fromNavbar) {
        setTimeout(() => {
          setOpenNote(false);
          getRedirect();
        }, 3000);
      }
    } catch (error) {
      setErrorMessage(constants.noteError);
    }

    if (fromNavbar) {
      setTimeout(() => setOpenNote(false), 3000);
    }
  };

  return (
    <div className={!fromNavbar ? 'mb-1 py-2' : ''}>
      <AlertWrapper>
        <Alert message={successMessage} setMessage={setSuccessMessage} />
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
      </AlertWrapper>

      {fromNavbar && <IdfSelectMultiOpp onChange={onChange} />}

      <MentionsInput
        fileInput={fileInput}
        setFileInput={setFileInput}
        defaultState={defaultState}
        handleSubmit={handleSubmit}
        alignButtons={`right`}
        setNoteTitle={setName}
        setOverlay={setOverlay}
        from={from}
        activityId={activityId}
        notes={notes}
        feedInfoNotes={feedInfoNotes}
        richNote={richNote}
        setRichNote={setRichNote}
        placeholder={placeholder}
        fromNavbar={fromNavbar}
        fromClientPortal={fromClientPortal}
      />
    </div>
  );
};

export default AddNote;
