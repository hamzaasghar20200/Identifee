import React, { useState } from 'react';
import { Spinner } from 'reactstrap';
import { useHistory, useLocation } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import AuthService from '../services/auth.service';
import PageTitle from '../components/commons/PageTitle';
import InlineAlert from '../components/commons/InlineAlert';
const msgTimeout = 4000;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Reset() {
  const query = useQuery();
  const token = query.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  if (!token || token === '') {
    history.push('/login');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError('Password must match');
      setTimeout(() => {
        setError('');
      }, msgTimeout);
      return;
    }

    // validating password
    // show password strength meter
    // if password is weak, don't reset password

    try {
      setIsLoading(true);
      await AuthService.resetPassword(password, token);
      setSuccess('You have successfully updated your password.');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        history.push('/login');
      }, msgTimeout);
    } catch (e) {
      setError('There was an error while updating your password.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PublicLayout>
      <PageTitle page={'Reset Password'} pageModule="" />
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">
          <div className="card card-lg mb-5">
            <div className="card-body">
              <form className="js-validate" onSubmit={handleSubmit}>
                <div className="text-center">
                  <div className="mb-5">
                    <h1 className="display-4">Set new password</h1>
                    <p>Enter new password in the fields below.</p>
                  </div>
                </div>

                <InlineAlert
                  msg={error}
                  setMsg={setError}
                  variant="danger"
                  autoClose={true}
                />
                <InlineAlert
                  msg={success}
                  setMsg={setSuccess}
                  variant="success"
                  autoClose={true}
                />

                <div className="js-form-message form-group">
                  <label
                    className="input-label"
                    htmlFor="resetPasswordSrEmail"
                    tabIndex="0"
                  >
                    New Password
                  </label>

                  <input
                    type="password"
                    className="form-control form-control-lg"
                    name="email"
                    id="resetPasswordSrEmail"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    tabIndex="1"
                    placeholder="Enter new password"
                    aria-label="Enter your email address"
                    required
                  />
                </div>

                <div className="js-form-message form-group">
                  <label
                    className="input-label"
                    htmlFor="resetPasswordSrEmail"
                    tabIndex="0"
                  >
                    Confirm New Password
                  </label>

                  <input
                    type="password"
                    className="form-control form-control-lg"
                    name="email"
                    id="resetPasswordSrEmail"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    tabIndex="1"
                    placeholder="Confirm new password"
                    aria-label="Enter your email address"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-lg btn-block btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner /> : 'Change Password'}
                </button>

                <div className="text-center mt-2">
                  <a className="btn btn-link" href="/login">
                    <i className="tio-chevron-left"></i> Back to Login
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
