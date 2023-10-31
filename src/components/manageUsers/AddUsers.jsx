import React, { useEffect, useState } from 'react';
import { ListGroup, ListGroupItem } from 'reactstrap';

import { validateEmail } from '../../utils/Utils';
import {
  INVITATION_SENT,
  INVITE_FORM_TEXT,
  UNKNOWN_ERROR,
} from '../../utils/constants';

const AddUsers = ({ inputValue, setInputValue, setEmails, sentReport }) => {
  const [error] = useState('');

  useEffect(() => {
    let emailList = inputValue.split(/[\s,]+/).map((email) => email.trim());
    emailList = emailList.filter((email) => validateEmail(email));
    setEmails(emailList);
  }, [inputValue]);

  return (
    <>
      {sentReport.length > 0 ? (
        <>
          <p>{INVITATION_SENT}</p>
          <ListGroup>
            {sentReport.map((report) => (
              <ListGroupItem key={report.email}>
                {report.email}{' '}
                {report.isValid ? (
                  `✅`
                ) : report.error.message ? (
                  <span className="text-danger">❌ {report.error.message}</span>
                ) : (
                  <span className="text-danger">❌ {UNKNOWN_ERROR}</span>
                )}
              </ListGroupItem>
            ))}
          </ListGroup>
        </>
      ) : (
        <>
          <p>{INVITE_FORM_TEXT}</p>
          <div className="form-group">
            <textarea
              className={`form-control ${error ? 'has-error' : ''}`}
              rows="4"
              placeholder="john.doe@abc.com  john.doe@gmail.com"
              aria-label="User Emails"
              onChange={(e) => setInputValue(e.target.value)}
              value={inputValue}
            ></textarea>
            {error && <p className="error">{error}</p>}
            <small className="form-text text-muted">
              Duplicate email addresses will be removed.
            </small>
          </div>
        </>
      )}
    </>
  );
};

export default AddUsers;
