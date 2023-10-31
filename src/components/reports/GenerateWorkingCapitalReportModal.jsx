import Alert from '../Alert/Alert';
import AlertWrapper from '../Alert/AlertWrapper';
import React, { useEffect, useState } from 'react';
import {
  formatCurrency,
  NAICS_STORAGE_KEY,
  overflowing,
  parseCurrencyOrNormal,
} from '../../utils/Utils';
import SimpleModalCreation from '../modal/SimpleModalCreation';
import { Card, CardBody, Col, FormGroup, Label, Row } from 'reactstrap';
import SicNaicsAutoComplete from '../prospecting/v2/common/SicNaicsAutoComplete';
import ReactDatepicker from '../inputs/ReactDatpicker';
import { InputGroup } from 'react-bootstrap';
import _ from 'lodash';
import OrganizationService from '../../services/organization.service';
import { ActionTypes, ReportTypes } from './reports.constants';
import { useProfileContext } from '../../contexts/profileContext';
import ReportService from '../../services/report.service';
import DeleteConfirmationModal from '../modal/DeleteConfirmationModal';

const WorkingCapitalFields = [
  'Accounts Payable',
  'Accounts Receivable',
  'Net Sales',
  'Cost of Goods Sold',
  'Inventory',
  'Cost of Capital',
];

const WCInputField = ({ report, label, labelKey, handleChange }) => {
  return (
    <div className="d-flex py-1 justify-content-between align-items-center">
      <h6 className="mb-0" style={{ minWidth: 160 }}>
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
          value={parseCurrencyOrNormal(report[labelKey] || '')}
          onChange={(e) => handleChange(e, labelKey)}
          className="form-control"
        />
      </InputGroup>
    </div>
  );
};

const GenerateWorkingCapitalReportModal = ({
  report,
  isEdited,
  setReport,
  organization,
  selectedReport,
  openGenerateReport,
  handleGenerateReport,
  setOpenGenerateReport,
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
    setReport({
      ...report,
      [key]: currency,
    });
  };

  const createOrUpdateReport = async () => {
    try {
      setGenerating(true);
      let reportObject = null;
      // update case
      if (report?.reportId) {
        reportObject = await ReportService.updateReport(report?.reportId, {
          name: report.companyName,
          date: report.reportDate,
          type: ReportTypes.WorkingCapital,
          manualInput: report,
        });
      } else {
        reportObject = await OrganizationService.createManualReport(
          organization.id,
          {
            name: report.companyName,
            date: report.reportDate,
            type: ReportTypes.WorkingCapital,
            manualInput: report,
          }
        );
      }
      handleGenerateReport(
        report,
        report?.reportId ? ActionTypes.UPDATE : ActionTypes.ADD,
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
      // call delete api
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
          modalTitle="Generate Working Capital Report"
          open={openGenerateReport}
          bankTeam={false}
          saveButton="Generate"
          bodyClassName="p-0"
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
                  <Label for="title">Company Name</Label>
                  <input
                    name="name"
                    type="text"
                    value={report.companyName}
                    placeholder="Enter Company Name"
                    onChange={(e) => {
                      setReport({
                        ...report,
                        companyName: e.target.value,
                      });
                    }}
                    className="form-control"
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="title">NAICS</Label>
                  <SicNaicsAutoComplete
                    data={report}
                    setData={setReport}
                    placeholder="Enter a NAICS code"
                    customKey="valueN"
                    callKey={NAICS_STORAGE_KEY}
                    callType="getNaicsCodes"
                    onSelect={(item, naicsSicOnly) => {
                      setReport({
                        ...report,
                        valueN: [item],
                        valueNaicsSic: naicsSicOnly,
                      });
                    }}
                  />
                </FormGroup>
                <FormGroup className="date-wrapper">
                  <Label for="title">Report Date</Label>
                  <ReactDatepicker
                    id={'rptDate'}
                    name={'reportDate'}
                    todayButton="Today"
                    value={report.reportDate}
                    autoComplete="off"
                    className="form-control mx-0 mb-0"
                    placeholder="Select Report Date"
                    format="MMMM, yyyy"
                    onChange={(date) => {
                      setReport({
                        ...report,
                        reportDate: date,
                      });
                    }}
                    showMonthYearPicker
                    showFullMonthYearPicker
                  />
                </FormGroup>
              </div>
            </Col>
            <Col md={7} className="bg-gray-5">
              <h5 className="py-2 mt-2 mb-0">Overview</h5>
              <Card className="mr-3 mb-3">
                <CardBody>
                  <div className="d-flex align-items-center py-1 justify-content-between">
                    <h6 style={{ minWidth: 160 }}>&nbsp;</h6>
                    <div
                      style={{ fontSize: '0.765625rem', fontWeight: 600 }}
                      className="d-flex flex-fill text-center justify-content-center align-items-center gap-1"
                    >
                      Enter Current Financial Data
                    </div>
                  </div>
                  {WorkingCapitalFields.map((field) => (
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

export default GenerateWorkingCapitalReportModal;
