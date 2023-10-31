import React, { useEffect, useState } from 'react';

import {
  Modal,
  ModalBody,
  Row,
  Col,
  ModalHeader,
  ModalFooter,
} from 'reactstrap';
import Alert from '../Alert/Alert';
import AlertWrapper from '../Alert/AlertWrapper';
import { useTenantContext } from '../../contexts/TenantContext';
import tenantService from '../../services/tenant.service';
const QuizResultModal = ({
  showModal,
  setShowModal,
  score,
  icon = 'info',
  onHandleCloseModal,
  ...props
}) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [quizConfig, setQuizConfig] = useState({});
  const [quizResult, setQuizResult] = useState('');
  const [actualScoreGot, setActualScoreGot] = useState(0);
  const { tenant } = useTenantContext();
  const getTenantQuizConfig = async () => {
    try {
      const tenantQuizConfiguration = await tenantService.getTenantsQuizConfig(
        tenant.id
      );

      const { quiz } = tenantQuizConfiguration;
      if (quiz) {
        setQuizConfig(quiz);
        const actualScore = (score / 100) * quiz.maxPoints;
        setActualScoreGot(actualScore);
        if (quiz.passingScore <= actualScore) {
          setQuizResult('Passed');
        } else {
          setQuizResult('Failed');
        }
      }
    } catch (error) {
      if (error.response.status === 404) {
        setQuizConfig({
          maxAttempts: 5,
          maxPoints: 100,
          passingScore: 60,
        });
      } else {
        setQuizConfig({
          maxAttempts: 5,
          maxPoints: 100,
          passingScore: 60,
        });
      }
    }
  };

  useEffect(() => {
    if (showModal) {
      getTenantQuizConfig();
    }
  }, [showModal]);

  return (
    <Modal isOpen={showModal} fade={false}>
      <AlertWrapper>
        <Alert
          message={errorMessage}
          setMessage={setErrorMessage}
          color="danger"
        />
      </AlertWrapper>
      <ModalHeader tag="h3" toggle={() => setShowModal(false)} className="p-3">
        Quiz Result
      </ModalHeader>
      <ModalBody className="border-top mb-0 p-3">
        <Row className="text-center">
          <Col xs={12}>
            <span className="material-icons-outlined alert-icon-size">
              {icon}
            </span>
          </Col>
          <Col xs={12} className="mt-4">
            <h4
              className={
                quizResult === 'Passed' ? 'text-success' : 'text-danger'
              }
            >
              {quizResult}
            </h4>
            <p>
              You have got {actualScoreGot} out of {quizConfig.maxPoints}
            </p>
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter className="px-3">
        <>
          <button className="btn btn-white btn-sm" onClick={onHandleCloseModal}>
            OK
          </button>
        </>
      </ModalFooter>
    </Modal>
  );
};

export default QuizResultModal;
