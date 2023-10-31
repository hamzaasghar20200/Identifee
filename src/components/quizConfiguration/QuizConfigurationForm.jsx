import React, { useEffect, useState } from 'react';

import Loading from '../Loading';
import Alert from '../Alert/Alert';
import AlertWrapper from '../Alert/AlertWrapper';
import InputValidation from '../commons/InputValidation';
import {
  MAX_POINTS,
  QUIZ_CONFIGURATION_LABEL,
  MAX_ATTEMPTS,
  PASSING_SCORE,
} from '../../utils/constants';
import ButtonIcon from '../commons/ButtonIcon';
import { FormGroup, Label } from 'reactstrap';
import Asterick from '../commons/Asterick';
import tenantService from '../../services/tenant.service';
import { useTenantContext } from '../../contexts/TenantContext';
import stringConstants from '../../utils/stringConstants.json';
import { useForm } from 'react-hook-form';
const QuizConfigurationForm = () => {
  const {
    register,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {},
  });
  const { tenant } = useTenantContext();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [tenantInfo] = useState(false);
  const [quizConfigForm, setQuizConfigForm] = useState();
  const [updateConfig, setUpdateConfig] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const { maxPoints, passingScore, maxAttempts } = quizConfigForm || {};
  const constants = stringConstants.tenants;
  const getTenantQuizConfig = async () => {
    setShowLoading(true);
    try {
      const tenantQuizConfiguration = await tenantService.getTenantsQuizConfig(
        tenant.id
      );
      setShowLoading(false);
      const { quiz } = tenantQuizConfiguration;
      if (quiz) {
        setQuizConfigForm({
          maxAttempts: quiz?.maxAttempts,
          maxPoints: quiz?.maxPoints,
          passingScore: quiz?.passingScore,
        });
      }
    } catch (error) {
      if (error.response.status === 404) {
        setQuizConfigForm({
          maxAttempts: 5,
          maxPoints: 100,
          passingScore: 60,
        });
        setUpdateConfig(true);
      } else {
        setErrorMessage(constants.edit.errorGetTenants);
      }
    }
    setShowLoading(false);
  };

  useEffect(() => {
    if (tenant.name) {
      getTenantQuizConfig();
    }
  }, [tenant]);

  useEffect(() => {
    if (quizConfigForm) {
      setValue('maxPoints', [quizConfigForm?.maxPoints || 0]);
      setValue('maxAttempts', [quizConfigForm?.maxAttempts || 0]);
      setValue('passingScore', [quizConfigForm?.passingScore || 0]);
    }
  }, [quizConfigForm]);
  useEffect(() => {
    if (updateConfig) {
      updateTenantQuizConfig();
    }
  }, [updateConfig]);
  const handleChange = (e) => {
    const target = e.target;
    const data = {
      ...quizConfigForm,
      [target.id]: parseInt(target.value),
    };
    setQuizConfigForm(data);
    setValue(target.name, target.value);
  };
  const updateTenantQuizConfig = async () => {
    if (
      !Number.isFinite(maxPoints) ||
      maxPoints === 0 ||
      !Number.isFinite(passingScore) ||
      passingScore === 0 ||
      !Number.isFinite(maxAttempts) ||
      maxAttempts === 0
    )
      setErrorMessage('Invalid value');
    else
      try {
        setShowLoading(true);
        setUpdateConfig(false);
        const createResponce = await tenantService.updateTenantsQuizConfig(
          { quiz: quizConfigForm },
          tenant.id
        );
        setShowLoading(false);

        if (!createResponce.response) {
          getTenantQuizConfig();
          if (!updateConfig)
            setSuccessMessage(constants.edit.quizConfigurationSucess);
        } else {
          setErrorMessage(constants.edit.quizConfigurationFailed);
        }
      } catch (error) {
        setErrorMessage(constants.edit.TenantUpdateFailed);
      }
    setShowLoading(false);
  };
  return (
    <>
      <AlertWrapper>
        <Alert
          message={errorMessage}
          setMessage={setErrorMessage}
          color="danger"
        />
        <Alert
          message={successMessage}
          setMessage={setSuccessMessage}
          color="success"
        />
      </AlertWrapper>

      {tenantInfo === undefined || showLoading ? (
        <Loading />
      ) : (
        <div className="card mb-3 mb-lg-5">
          <div className="card-header">
            <h4 className="card-title">{QUIZ_CONFIGURATION_LABEL}</h4>
          </div>
          <div className="card-body px-2">
            <div className="col-md-12">
              <FormGroup>
                <Label htmlFor={MAX_POINTS}>
                  Max Points <Asterick />
                </Label>
                <InputValidation
                  type="input"
                  name={MAX_POINTS.replace('_p', 'P')}
                  id={'maxPoints'}
                  placeholder="Marks"
                  value={quizConfigForm?.maxPoints || 0}
                  classNames="fs-7 mb-0 flex-grow-1 font-weight-medium"
                  errorDisplay="position-absolute error-show-right"
                  validationConfig={{
                    required: true,
                    inline: true,
                    onChange: (e) => handleChange(e),
                  }}
                  errors={errors}
                  register={register}
                />
              </FormGroup>
            </div>
            <div className="col-md-12">
              <FormGroup>
                <Label htmlFor="passingScore">
                  Passing Score <Asterick />
                </Label>
                <InputValidation
                  type="input"
                  name={PASSING_SCORE.replace('_s', 'S')}
                  id={'passingScore'}
                  placeholder="Marks"
                  value={quizConfigForm?.passingScore || 0}
                  classNames="fs-7 mb-0 flex-grow-1 font-weight-medium"
                  errorDisplay="position-absolute error-show-right"
                  validationConfig={{
                    required: true,
                    inline: true,
                    onChange: (e) => handleChange(e),
                  }}
                  errors={errors}
                  register={register}
                />
              </FormGroup>
            </div>
            <div className="col-md-12">
              <FormGroup>
                <Label htmlFor={MAX_ATTEMPTS}>
                  Max Attempts <Asterick />
                </Label>
                <InputValidation
                  type="input"
                  name={MAX_ATTEMPTS.replace('_a', 'A')}
                  id={'maxAttempts'}
                  placeholder="Marks"
                  value={quizConfigForm?.maxAttempts || 0}
                  classNames="fs-7 mb-0 flex-grow-1 font-weight-medium"
                  errorDisplay="position-absolute error-show-right"
                  validationConfig={{
                    required: true,
                    inline: true,
                    onChange: (e) => handleChange(e),
                  }}
                  errors={errors}
                  register={register}
                />
              </FormGroup>
            </div>
          </div>

          <div className="card-footer">
            <div className="d-flex justify-content-end">
              <ButtonIcon
                label="Save Changes"
                type="submit"
                color="primary"
                classnames="btn-sm"
                onclick={() => updateTenantQuizConfig()}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuizConfigurationForm;
