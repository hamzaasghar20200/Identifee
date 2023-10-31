import React, { useState } from 'react';
import { Spinner } from 'reactstrap';
import { useHistory } from 'react-router-dom';
import AuthService from '../services/auth.service';
import { PublicLayout } from '../layouts/PublicLayout';
import PageTitle from '../components/commons/PageTitle';

export default function Reset() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setIsLoading(true);
      await AuthService.requestPassword(email);
      setSuccess(true);
    } catch (e) {
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PublicLayout>
      <PageTitle page={'Forgot your password?'} pageModule="" />
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">
          <div className="card card-lg mb-5">
            <div className="card-body">
              {!success ? (
                <form className="js-validate" onSubmit={handleSubmit}>
                  <div className="text-center">
                    <div className="mb-5">
                      <span className="forget-label">
                        Forgot your password?
                      </span>
                      <p>{`To reset your password, enter your email address.`}</p>
                    </div>
                  </div>

                  <div className="js-form-message form-group">
                    <label
                      className="input-label"
                      htmlFor="resetPasswordSrEmail"
                      tabIndex="0"
                    >
                      Your Email
                    </label>

                    <input
                      type="email"
                      className="form-control form-control-lg"
                      name="email"
                      id="resetPasswordSrEmail"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      tabIndex="1"
                      placeholder="Enter your email address"
                      aria-label="Enter your email address"
                      required
                    />
                  </div>

                  <div className="d-flex align-items-center justify-content-between mt-3 gap-2">
                    <a
                      className="btn btn-lg btn-white w-50"
                      onClick={() => history.push('/login')}
                    >
                      Cancel
                    </a>
                    <button
                      type="submit"
                      className="btn btn-lg w-50 btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? <Spinner /> : 'Continue'}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="pt-2">
                    We&apos;ve sent you an email with a link to finish resetting
                    your password.
                  </p>
                  <p>
                    Can&apos;t find the email? Try checking your spam folder.
                  </p>
                  <div className="d-flex align-items-center justify-content-between mt-4 gap-2">
                    <a
                      className="btn btn-lg btn-white w-100"
                      onClick={() => history.push('/login')}
                    >
                      <i className="tio-chevron-left"></i> Back to Log In
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
