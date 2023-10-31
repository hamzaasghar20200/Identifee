import authService from '../services/auth.service';
import { Spinner } from 'reactstrap';
import AlertWrapper from '../components/Alert/AlertWrapper';
import Alert from '../components/Alert/Alert';
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import ButtonIcon from '../components/commons/ButtonIcon';
import { validateEmail } from '../utils/Utils';
import { useTenantContext } from '../contexts/TenantContext';
import BrandLogoIcon from '../components/sidebar/BrandLogoIcon';
import PageTitle from '../components/commons/PageTitle';
import useUrlSearchParams from '../hooks/useUrlSearchParams';
import useTenantTheme from '../hooks/useTenantTheme';

const SUCCESSFUL_MESSAGE = 'Sign-in link has been sent to your email.';

const ClientLogin = () => {
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const { tenant } = useTenantContext();
  const params = useUrlSearchParams();

  const sendEmail = async (email) => {
    try {
      // validate email
      if (validateEmail(email)) {
        setEmail(email);
        setLoading(true);
        await authService.guestToken(email);
        setSuccessMessage(SUCCESSFUL_MESSAGE);
        setEmailSent(true);
      } else {
        setErrorMessage('Your email is not valid');
      }
    } catch (error) {
      setErrorMessage('Your email is not valid');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const emailContact = params.get('email');
      if (emailContact) {
        sendEmail(emailContact);
      }
    })();
  }, [history.location]);

  async function handleSubmit(e) {
    e.preventDefault();
    sendEmail(email);
  }
  useTenantTheme();
  return (
    <>
      <PageTitle page={'Client Login'} pageModule="" />
      <main id="content" role="main" className="main">
        <div className="container py-5 py-sm-7">
          <div className="d-flex justify-content-center mt-5 mb-5">
            <BrandLogoIcon tenant={tenant} />
          </div>

          <div className="row justify-content-center">
            <div className="col-md-7 col-lg-5">
              <div className="card card-lg mb-5">
                <div className="card-body">
                  {!emailSent ? (
                    <form className="js-validate" onSubmit={handleSubmit}>
                      <h3>Welcome Back</h3>
                      <p className="text-muted">
                        Please enter your email address to receive a sign-in
                        link
                      </p>
                      <label>Email</label>
                      <div className="js-form-message form-group">
                        <input
                          type="email"
                          className="form-control form-control-lg"
                          name="email"
                          id="signinEmail"
                          tabIndex="0"
                          placeholder="email@address.com"
                          aria-label="email@address.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn btn-lg btn-block btn-primary"
                      >
                        {loading ? (
                          <Spinner />
                        ) : (
                          <span>Send me a sign-in link</span>
                        )}
                      </button>
                    </form>
                  ) : (
                    <>
                      <p className="font-size-md">
                        We&apos;ve sent a link to <b>{email}</b>. Please look
                        for an email with subject &quot;You&apos;ve been invited
                        to an organization&quot; and then click the Relevant
                        organization link to access our organization portal. The
                        link will expire in 24 hours.
                      </p>
                      <ButtonIcon
                        color="white"
                        classnames="mt-3 btn-lg btn-block"
                        icon="arrow_back"
                        onclick={() => {
                          setEmailSent(false);
                          setEmail('');
                        }}
                        label="Back to Login"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AlertWrapper>
        <Alert message={successMessage} setMessage={setSuccessMessage} />
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
      </AlertWrapper>
    </>
  );
};

export default ClientLogin;
