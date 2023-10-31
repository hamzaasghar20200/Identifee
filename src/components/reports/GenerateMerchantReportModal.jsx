import Alert from '../Alert/Alert';
import AlertWrapper from '../Alert/AlertWrapper';
import React, { useEffect, useState } from 'react';
import {
  formatCurrency,
  numberWithCommas,
  overflowing,
  parseCurrency,
  parseCurrencyOrNormal,
} from '../../utils/Utils';
import SimpleModalCreation from '../modal/SimpleModalCreation';
import { Card, CardBody, Col, FormGroup, Label, Row } from 'reactstrap';
import { InputGroup } from 'react-bootstrap';
import _ from 'lodash';
import OrganizationService from '../../services/organization.service';
import { ActionTypes, ReportTypes } from './reports.constants';
import { useProfileContext } from '../../contexts/profileContext';
import ReportService from '../../services/report.service';
import DeleteConfirmationModal from '../modal/DeleteConfirmationModal';

const MerchantsFields = [
  'Total Dollars Processed',
  'Total Fees',
  'Refund',
  'Chargebacks',
  'Interchange and Network Fees',
  'Processor Fees',
];

const WCInputField = ({ report, label, labelKey, handleChange }) => {
  return (
    <>
      <div className="d-flex py-1 justify-content-between align-items-center">
        <h6 className="mb-0 mr-1" style={{ minWidth: 149 }}>
          {label}
        </h6>
        <InputGroup className="align-items-center">
          <InputGroup.Prepend>
            <InputGroup.Text>$</InputGroup.Text>
          </InputGroup.Prepend>
          <input
            name={labelKey}
            type="text"
            placeholder="0"
            disabled={label === 'Total Fees'}
            value={parseCurrencyOrNormal(report[labelKey] || '')}
            onChange={(e) => handleChange(e, labelKey)}
            className="form-control"
          />
        </InputGroup>
      </div>
    </>
  );
};

const GenerateMerchantReportModal = ({
  report,
  isEdited,
  setReport,
  organization,
  selectedReport,
  openGenerateReport,
  handleGenerateReport,
  setOpenGenerateReport,
  pastReports,
}) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [generating, setGenerating] = useState(false);
  const [deleteBtnConfig, setDeleteBtnConfig] = useState(null);
  const [showDeleteReportModal, setShowDeleteReportModal] = useState(false);
  const [reportsToDelete, setReportsToDelete] = useState([]);
  const { profileInfo } = useProfileContext();

  const handleChange = (e, key) => {
    const { value } = e.target;

    // Ensure input does not start with a dot
    if (value?.startsWith('.')) {
      setReport({
        ...report,
        [key]: '',
      });
      return;
    }
    const currency = formatCurrency(value);
    const updatedReport = {
      ...report,
      [key]: currency,
    };
    setReport(updatedReport);
  };
  const createOrUpdateReport = async () => {
    try {
      setGenerating(true);
      let reportObject = null;
      // update case
      if (report?.key) {
        reportObject = await ReportService.updateReport(report?.key, {
          name: report.name,
          reportDate: report.date,
          type: ReportTypes.Merchant,
          manualInput: report,
        });
      } else {
        reportObject = await OrganizationService.createManualReport(
          organization.id,
          {
            name: organization?.name,
            date: new Date(),
            type: ReportTypes.Merchant,
            manualInput: report,
          }
        );
      }
      handleGenerateReport(
        report,
        report?.key ? ActionTypes.UPDATE : ActionTypes.ADD,
        reportObject
      );
    } catch (e) {
      console.log(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleConfirmDeleteReport = async () => {
    try {
      await ReportService.deleteReport(selectedReport.key);
      overflowing();
      setSuccessMessage('Report deleted successfully.');
      setShowDeleteReportModal(false);
      handleGenerateReport(selectedReport, ActionTypes.REMOVE, selectedReport);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    // if the owner viewing give him a delete option only
    if (isEdited && profileInfo.id === selectedReport.createdById) {
      console.log(selectedReport);
      setDeleteBtnConfig({
        label: 'Delete Report',
        show: true,
        loading: false,
        onClick: () => {
          setReportsToDelete([selectedReport]);
          setShowDeleteReportModal(true);
        },
      });
    } else {
      setDeleteBtnConfig(null);
    }
  }, [isEdited]);
  useEffect(() => {
    if (report?.processorFees || report?.interchangeAndNetworkFees) {
      const processorFees = parseCurrency(report?.processorFees) || 0;
      const interchangeAndNetworkFees =
        parseCurrency(report?.interchangeAndNetworkFees) || 0;
      const total = processorFees + interchangeAndNetworkFees;
      const formattedTotal = numberWithCommas(total);
      const data = {
        ...report,
        totalFees: formattedTotal,
      };
      setReport(data);
    } else {
      const data = {
        ...report,
        totalFees: '',
      };
      setReport(data);
    }
  }, [report?.processorFees, report?.interchangeAndNetworkFees]);
  return (
    <>
      <AlertWrapper className="alert-position">
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
        <Alert
          color="success"
          message={successMessage}
          setMessage={setSuccessMessage}
        />
      </AlertWrapper>
      <DeleteConfirmationModal
        showModal={showDeleteReportModal}
        setShowModal={setShowDeleteReportModal}
        setSelectedCategories={setReportsToDelete}
        event={handleConfirmDeleteReport}
        itemsConfirmation={reportsToDelete}
        description="Are you sure you want to delete this Report?"
        itemsReport={[]}
        setErrorMessage={setErrorMessage}
        setSuccessMessage={setSuccessMessage}
        positiveBtnText="Yes, Delete"
      />
      {openGenerateReport && (
        <SimpleModalCreation
          modalTitle="Generate Merchant Report"
          open={openGenerateReport}
          bankTeam={false}
          saveButton="Generate"
          bodyClassName="p-0 merchant-p-0"
          isLoading={generating}
          deleteButton={deleteBtnConfig}
          handleSubmit={() => {
            overflowing();
            createOrUpdateReport();
          }}
          size="lg"
          onHandleCloseModal={() => {
            overflowing();
            setOpenGenerateReport(!openGenerateReport);
          }}
        >
          <Row>
            <Col md={5}>
              <div className="pl-3 py-3">
                <FormGroup>
                  <Label for="title">MID</Label>
                  <input
                    name="mid"
                    type="number"
                    value={report?.mid}
                    placeholder="MID"
                    onChange={(e) => {
                      setReport({
                        ...report,
                        mid: e.target.value,
                      });
                    }}
                    className="form-control"
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="title">Total Transactions</Label>
                  <input
                    name="total_transactions"
                    type="number"
                    value={report?.total_transactions}
                    placeholder="Total Transactions"
                    onChange={(e) => {
                      setReport({
                        ...report,
                        total_transactions: e.target.value,
                      });
                    }}
                    className="form-control"
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="title">Refund</Label>
                  <input
                    name="refund_count"
                    type="number"
                    value={report?.refund_count}
                    placeholder="Refund (count)"
                    onChange={(e) => {
                      setReport({
                        ...report,
                        refund_count: e.target.value,
                      });
                    }}
                    className="form-control"
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="title">Chargebacks</Label>
                  <input
                    name="chargebacks_count"
                    type="number"
                    value={report?.chargebacks_count}
                    placeholder="Chargebacks  (count)"
                    onChange={(e) => {
                      setReport({
                        ...report,
                        chargebacks_count: e.target.value,
                      });
                    }}
                    className="form-control"
                  />
                </FormGroup>
              </div>
            </Col>
            <Col md={7} className="bg-gray-5">
              <h5 className="py-2 mt-2 mb-0">Overview</h5>
              <Card className="mr-3 mb-3">
                <CardBody>
                  {MerchantsFields.map((field) => (
                    <WCInputField
                      key={field}
                      report={report}
                      label={field}
                      labelKey={_.camelCase(field)}
                      handleChange={handleChange}
                    />
                  ))}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </SimpleModalCreation>
      )}
    </>
  );
};

export default GenerateMerchantReportModal;
