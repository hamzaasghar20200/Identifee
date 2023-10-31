import React, { useContext, useEffect, useRef, useState } from 'react';
import { useProfileContext } from '../../contexts/profileContext';
import { DemoTenantsKeys, InputType, ReportTypes } from './reports.constants';
import {
  formatCurrency,
  NAICS_STORAGE_KEY,
  numbersWithComma,
  overflowing,
  parseCurrencyOrNormal,
  sortAndRearrangeJSONByKeyAtEnd,
} from '../../utils/Utils';
import ReportService from '../../services/report.service';
import OrganizationService from '../../services/organization.service';
import AlertWrapper from '../Alert/AlertWrapper';
import Alert from '../Alert/Alert';
import DeleteConfirmationModal from '../modal/DeleteConfirmationModal';
import SimpleModalCreation from '../modal/SimpleModalCreation';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  FormGroup,
  Label,
  Row,
} from 'reactstrap';
import SicNaicsAutoComplete from '../prospecting/v2/common/SicNaicsAutoComplete';
import ReactDatepicker from '../inputs/ReactDatpicker';
import {
  Accordion,
  AccordionContext,
  Dropdown,
  InputGroup,
  useAccordionToggle,
} from 'react-bootstrap';
import TooltipComponent from '../lesson/Tooltip';
import MaterialIcon from '../commons/MaterialIcon';
import { SwitchInputWithEditableControls } from '../layouts/CardLayout';
import NoDataFound from '../commons/NoDataFound';
import useOutsideClickDropDown from '../../hooks/useOutsideClickDropDown';
import useIsTenant from '../../hooks/useIsTenant';
import Overview from '../reportbuilder/blocks/treasuryManagement/Overview';
import Payables from '../reportbuilder/blocks/treasuryManagement/Payables';
import Receivables from '../reportbuilder/blocks/treasuryManagement/Receivables';
import Fraud from '../reportbuilder/blocks/treasuryManagement/Fraud';
import FeeSummary from '../reportbuilder/blocks/treasuryManagement/FeeSummary';
import Glossary from '../reportbuilder/blocks/treasuryManagement/Glossary';

const FEES_OPTIONS = [
  { key: 1, label: 'Total Fees Paid', isSelected: true },
  { key: 2, label: 'Total Fees Offset', isSelected: false },
];

const TotalFeesOffsetSelect = ({ options, selected, onSelect }) => {
  const dropdownRef = useRef(null);
  const [show, setShow] = useState(false);
  useOutsideClickDropDown(dropdownRef, show, setShow);
  return (
    <Dropdown
      onToggle={() => setShow(!show)}
      show={show}
      className="custom-dd-select"
    >
      <Dropdown.Toggle
        variant="white"
        className="cursor-pointer text-black font-weight-medium"
        size="sm"
      >
        {selected.label}
      </Dropdown.Toggle>
      <Dropdown.Menu
        ref={dropdownRef}
        className="py-1 idf-dropdown-item-list"
        style={{ minWidth: 180 }}
      >
        {options.map((opt) => (
          <Dropdown.Item
            key={opt.key}
            eventKey={opt.key}
            className={`d-flex align-items-center justify-content-between ${
              opt.isSelected
                ? 'text-primary font-weight-semi-bold'
                : 'text-black'
            }`}
            onSelect={() => onSelect({ ...opt, isSelected: true })}
          >
            {opt.label}
            {opt.isSelected && <MaterialIcon icon="check" clazz="ml-auto" />}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

function AccordionToggle({
  children,
  eventKey,
  callback,
  setCurrentAccordionKey,
}) {
  const currentEventKey = useContext(AccordionContext);
  const decoratedOnClick = useAccordionToggle(eventKey, () => {
    if (eventKey === currentEventKey) {
      setCurrentAccordionKey(null);
    } else {
      callback && callback(eventKey);
    }
  });
  const isCurrentEventKey = currentEventKey === eventKey;

  return (
    <Accordion.Toggle
      eventKey={eventKey}
      as={CardHeader}
      onClick={decoratedOnClick}
      className={`p-3 cursor-pointer ${
        isCurrentEventKey ? 'bg-gray-5' : 'bg-white'
      }`}
    >
      <h6
        className={`mb-0 d-flex align-items-center justify-content-between w-100 font-size-sm ${
          isCurrentEventKey ? 'font-weight-bold' : 'font-weight-semi-bold'
        }`}
      >
        {children}
        <MaterialIcon
          icon={isCurrentEventKey ? 'expand_less' : 'expand_more'}
          clazz="font-size-2xl"
        />
      </h6>
    </Accordion.Toggle>
  );
}

const GenerateTreasuryReportModal = ({
  report,
  isManual,
  isEdited,
  setReport,
  organization,
  insightsData,
  excelBankMode,
  selectedReport,
  loaderInsights,
  accordionBlock,
  scrapeMetaData,
  selectedTenant,
  feeAllocationData,
  openGenerateReport,
  handleGenerateReport,
  setFeeAllocationData,
  setOpenGenerateReport,
}) => {
  const [currentAccordionKey, setCurrentAccordionKey] = useState('0');
  const [generating, setGenerating] = useState(false);
  const [deleteBtnConfig, setDeleteBtnConfig] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteReportModal, setShowDeleteReportModal] = useState(false);
  const [reportsToDelete, setReportsToDelete] = useState([]);
  const { profileInfo } = useProfileContext();
  const [feesOptions, setFeesOptions] = useState(FEES_OPTIONS);
  const [feesSelected, setFeesSelected] = useState(FEES_OPTIONS[0]);
  const { isSVB } = useIsTenant();

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

  useEffect(() => {
    // always open first accordion whenever modal is opened
    if (openGenerateReport) {
      setCurrentAccordionKey('0');
    }
  }, [openGenerateReport]);

  const handleAccordionClick = (eventKey) => {
    setCurrentAccordionKey(eventKey);
  };

  const setReportCurrencyValue = (key, value) => {
    setReport({
      ...report,
      [key]: value,
    });
  };
  const handleChangeInput = (e, key, type) => {
    const newValue = e.target.value;
    const isCurrency = type === InputType.Currency;
    const isComma = type === InputType.Comma;
    // Ensure input does not start with a dot
    if (newValue?.startsWith('.')) {
      setReportCurrencyValue(key, '');
      return;
    }
    if (isCurrency) {
      const currency = formatCurrency(newValue);
      setReportCurrencyValue(key, currency);
    } else if (isComma) {
      if (!newValue || newValue === '0') {
        setReportCurrencyValue(key, '');
      } else {
        const cleanValue = newValue?.replaceAll(',', '');
        setReportCurrencyValue(key, cleanValue);
      }
    } else {
      setReportCurrencyValue(key, newValue);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const parseCommaOrNormal = (value) => {
    if (value) {
      return numbersWithComma(value);
    }
    return '';
  };

  useEffect(() => {
    handleAccordionClick(accordionBlock);
  }, [accordionBlock]);

  const percentageValOrEmpty = (value) => {
    if (value === '0') {
      return '';
    }

    return Math.round(parseFloat(value));
  };

  const handleManualEntryOrFileEntry = async () => {
    setGenerating(true);
    let reportObject = null;
    try {
      if (isManual) {
        if ('key' in selectedReport) {
          if (selectedReport?.isManual) {
            // update case
            reportObject = await ReportService.updateReport(
              selectedReport.key,
              {
                name: report.value1,
                date: report.value2,
                manualInput: { ...report, feeAllocation: feeAllocationData },
              }
            );
          } else {
            reportObject = await ReportService.updateReport(
              selectedReport.key,
              {
                name: report.value1,
                date: report.value2,
                input: { ...report, feeAllocation: feeAllocationData },
              }
            );
          }
        } else {
          // diff api to call when manual generate
          reportObject = await OrganizationService.createManualReport(
            organization.id,
            {
              name: report.value1,
              date: report.value2,
              type: ReportTypes.Treasury,
              manualInput: { ...report, feeAllocation: feeAllocationData },
            }
          );
        }
      } else {
        if (scrapeMetaData?.report?.reportId) {
          reportObject = await ReportService.updateReport(
            scrapeMetaData.report.reportId,
            {
              name: report.value1,
              date: report.value2,
              input: { ...report, feeAllocation: feeAllocationData },
            }
          );
        } else {
          // diff api to call when manual generate
          reportObject = await OrganizationService.createManualReport(
            organization.id,
            {
              name: report.value1,
              date: report.value2,
              type: ReportTypes.Treasury,
              manualInput: { ...report, feeAllocation: feeAllocationData },
            }
          );
        }
      }
      // close the modal etc.
      handleGenerateReport(reportObject);
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
      setSuccessMessage('Report deleted successfully.');
      setShowDeleteReportModal(false);
      handleGenerateReport({ ...selectedReport, action: 'DELETED' });
    } catch (e) {
      console.log(e);
    }
  };

  const handlePayableReceivableToggle = (e, entry, jsonObjectKey) => {
    const newReport = {
      ...report,
      [jsonObjectKey]: {
        ...report[jsonObjectKey],
        [entry[0]]: {
          key: entry[0],
          value: e.target.checked ? 1 : 0,
        },
      },
    };
    setReport(newReport);
  };

  const handlePayableReceivableToggleTextChange = (e, entry, jsonObjectKey) => {
    const keyText = e.target.value;
    const newReport = {
      ...report,
      [jsonObjectKey]: {
        ...report[jsonObjectKey],
        [entry[0]]: {
          key: keyText,
          value: entry[1]?.value,
        },
      },
    };
    setReport(newReport);
  };

  const handlePayableReceivableToggleRemove = (entry, jsonObjectKey) => {
    const newReport = {
      ...report,
      [jsonObjectKey]: {
        ...report[jsonObjectKey],
      },
    };
    delete newReport[jsonObjectKey][entry[0]];
    setReport(newReport);
  };

  const handlePayableReceivableToggleAdd = (entry, jsonObjectKey) => {
    const newReport = {
      ...report,
      [jsonObjectKey]: {
        ...report[jsonObjectKey],
        [entry[0]]: {
          key: entry[0],
          value: 0,
        },
      },
    };
    setReport(newReport);
  };

  const handlePaymentRisksToggle = (e, entry) => {
    const newReport = {
      ...report,
      paymentRisks: {
        ...report.paymentRisks,
        fraudPreventionProducts: {
          ...report.paymentRisks.fraudPreventionProducts,
          [entry[0]]: {
            key: entry[0],
            value: e.target.checked ? 1 : 0,
          },
        },
      },
    };

    newReport.paymentRisks.balance.isChecked = Object.entries(
      newReport.paymentRisks.fraudPreventionProducts
    ).every((item) => {
      return item[1]?.value > 0;
    });
    setReport(newReport);
  };

  const handlePaymentRisksToggleTextChange = (e, entry) => {
    const keyText = e.target.value;
    const newReport = {
      ...report,
      paymentRisks: {
        ...report.paymentRisks,
        fraudPreventionProducts: {
          ...report.paymentRisks.fraudPreventionProducts,
          [entry[0]]: {
            key: keyText,
            value: entry[1]?.value,
          },
        },
      },
    };
    setReport(newReport);
  };
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
          modalTitle="Generate Treasury Report"
          open={openGenerateReport}
          bankTeam={false}
          saveButton="Generate"
          bodyClassName="p-0"
          isLoading={generating}
          deleteButton={deleteBtnConfig}
          handleSubmit={handleManualEntryOrFileEntry}
          size="xxl"
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
                    value={report.value1}
                    onChange={(e) => {
                      setReport({
                        ...report,
                        value1: e.target.value,
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
                    name={'date'}
                    todayButton="Today"
                    value={report.value2}
                    autoComplete="off"
                    className="form-control mx-0 mb-0"
                    placeholder="Select Report Date"
                    format="MMMM, yyyy"
                    onChange={(date) => {
                      setReport({
                        ...report,
                        value2: date,
                      });
                    }}
                    showMonthYearPicker
                    showFullMonthYearPicker
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="title">Adjust Values by Page</Label>
                  <Accordion activeKey={currentAccordionKey}>
                    <Card>
                      <AccordionToggle
                        eventKey="0"
                        callback={handleAccordionClick}
                        setCurrentAccordionKey={setCurrentAccordionKey}
                      >
                        Overview
                      </AccordionToggle>
                      <Accordion.Collapse eventKey="0">
                        <CardBody>
                          <Row className="mb-2">
                            <Col md={12}>
                              <FormGroup className="mb-0 hover-actions">
                                <label className="d-flex align-items-center">
                                  <span>Payables</span>
                                  {Object.entries(
                                    report?.paymentMethodsUsed || {}
                                  ).length < 4 ? (
                                    <TooltipComponent title="Add Payable">
                                      <a
                                        className="icon-hover-bg cursor-pointer action-items"
                                        onClick={() => {
                                          handlePayableReceivableToggleAdd(
                                            ['New Payable'],
                                            'paymentMethodsUsed'
                                          );
                                        }}
                                      >
                                        <MaterialIcon icon="add_circle" />{' '}
                                      </a>
                                    </TooltipComponent>
                                  ) : (
                                    <></>
                                  )}
                                </label>
                              </FormGroup>
                              {Object.entries(
                                report?.paymentMethodsUsed || {}
                              ).map((entry) => (
                                <SwitchInputWithEditableControls
                                  id={`paymentMethodsUsed-${entry[0]}`}
                                  key={`paymentMethodsUsed-${entry[0]}`}
                                  checked={entry[1]?.value > 0}
                                  label={entry[1]?.key}
                                  onChange={(e) =>
                                    handlePayableReceivableToggle(
                                      e,
                                      entry,
                                      'paymentMethodsUsed'
                                    )
                                  }
                                  controls={{
                                    maxLength: 50,
                                    onChange: (e) => {
                                      handlePayableReceivableToggleTextChange(
                                        e,
                                        entry,
                                        'paymentMethodsUsed'
                                      );
                                    },
                                    onRemove: () => {
                                      handlePayableReceivableToggleRemove(
                                        entry,
                                        'paymentMethodsUsed'
                                      );
                                    },
                                  }}
                                />
                              ))}
                            </Col>
                          </Row>
                          <Row className="mb-2 mt-3">
                            <Col md={12}>
                              <FormGroup className="mb-0">
                                <label className="d-flex align-items-center">
                                  <span>Receivables</span>
                                  {Object.entries(
                                    report?.typesOfReceivables || {}
                                  ).length < 4 ? (
                                    <TooltipComponent title="Add Receivable">
                                      <a
                                        className="icon-hover-bg cursor-pointer action-items"
                                        onClick={() => {
                                          handlePayableReceivableToggleAdd(
                                            ['New Receivable'],
                                            'typesOfReceivables'
                                          );
                                        }}
                                      >
                                        <MaterialIcon icon="add_circle" />{' '}
                                      </a>
                                    </TooltipComponent>
                                  ) : (
                                    <></>
                                  )}
                                </label>
                              </FormGroup>
                              {Object.entries(
                                report?.typesOfReceivables || {}
                              ).map((entry) => (
                                <SwitchInputWithEditableControls
                                  id={`typesOfReceivables-${entry[0]}`}
                                  key={`typesOfReceivables-${entry[0]}`}
                                  checked={entry[1]?.value > 0}
                                  label={entry[1]?.key}
                                  onChange={(e) =>
                                    handlePayableReceivableToggle(
                                      e,
                                      entry,
                                      'typesOfReceivables'
                                    )
                                  }
                                  controls={{
                                    maxLength: 50,
                                    onChange: (e) => {
                                      handlePayableReceivableToggleTextChange(
                                        e,
                                        entry,
                                        'typesOfReceivables'
                                      );
                                    },
                                    onRemove: () => {
                                      handlePayableReceivableToggleRemove(
                                        entry,
                                        'typesOfReceivables'
                                      );
                                    },
                                  }}
                                />
                              ))}
                            </Col>
                          </Row>
                          <FormGroup>
                            <Label for="title">Estimated Total Payables</Label>
                            <InputGroup className="align-items-center">
                              <input
                                name="estimatedTotalPayables"
                                type="text"
                                value={numbersWithComma(
                                  report.estimatedTotalPayables
                                )}
                                placeholder="0"
                                onChange={(e) =>
                                  handleChangeInput(
                                    e,
                                    'estimatedTotalPayables',
                                    InputType.Comma
                                  )
                                }
                                className="form-control"
                              />
                            </InputGroup>
                          </FormGroup>
                          <FormGroup>
                            <Label for="title">
                              Estimated Total Receivables
                            </Label>
                            <InputGroup className="align-items-center">
                              <input
                                name="estimatedTotalReceivables"
                                type="text"
                                value={numbersWithComma(
                                  report.estimatedTotalReceivables
                                )}
                                placeholder="0"
                                onChange={(e) =>
                                  handleChangeInput(
                                    e,
                                    'estimatedTotalReceivables',
                                    InputType.Comma
                                  )
                                }
                                className="form-control"
                              />
                            </InputGroup>
                          </FormGroup>
                          <FormGroup>
                            <Label for="title">
                              Paper to Electronic Opportunity
                            </Label>
                            <InputGroup className="align-items-center">
                              <InputGroup.Prepend>
                                <InputGroup.Text>$</InputGroup.Text>
                              </InputGroup.Prepend>
                              <input
                                name="opportunity"
                                type="text"
                                value={parseCurrencyOrNormal(
                                  report.opportunity
                                )}
                                placeholder="0"
                                onChange={(e) =>
                                  handleChangeInput(
                                    e,
                                    'opportunity',
                                    InputType.Currency
                                  )
                                }
                                className="form-control"
                              />
                            </InputGroup>
                          </FormGroup>
                        </CardBody>
                      </Accordion.Collapse>
                    </Card>
                    <Card>
                      <AccordionToggle
                        eventKey="1"
                        callback={handleAccordionClick}
                        setCurrentAccordionKey={setCurrentAccordionKey}
                      >
                        Payables
                      </AccordionToggle>
                      <Accordion.Collapse eventKey="1">
                        <CardBody>
                          <NoDataFound
                            title={
                              <div className="text-gray-search fs-7 font-weight-medium">
                                No payables data to be adjusted.
                              </div>
                            }
                            icon="draw"
                            iconStyle="font-size-2em text-gray-search"
                            containerStyle="text-gray-900"
                          />
                        </CardBody>
                      </Accordion.Collapse>
                    </Card>
                    <Card>
                      <AccordionToggle
                        eventKey="2"
                        callback={handleAccordionClick}
                        setCurrentAccordionKey={setCurrentAccordionKey}
                      >
                        Receivables
                      </AccordionToggle>
                      <Accordion.Collapse eventKey="2">
                        <CardBody>
                          <NoDataFound
                            title={
                              <div className="text-gray-search fs-7 font-weight-medium">
                                No receivables data to be adjusted.
                              </div>
                            }
                            icon="draw"
                            iconStyle="font-size-2em text-gray-search"
                            containerStyle="text-gray-900"
                          />
                        </CardBody>
                      </Accordion.Collapse>
                    </Card>
                    <Card>
                      <AccordionToggle
                        eventKey="3"
                        callback={handleAccordionClick}
                        setCurrentAccordionKey={setCurrentAccordionKey}
                      >
                        Fraud
                      </AccordionToggle>
                      <Accordion.Collapse eventKey="3">
                        <>
                          {isSVB ||
                          selectedTenant?.key === DemoTenantsKeys.svb ? (
                            <CardBody>
                              <NoDataFound
                                title={
                                  <div className="text-gray-search fs-7 font-weight-medium">
                                    No fraud data to be adjusted.
                                  </div>
                                }
                                icon="draw"
                                iconStyle="font-size-2em text-gray-search"
                                containerStyle="text-gray-900"
                              />
                            </CardBody>
                          ) : (
                            <CardBody>
                              <FormGroup>
                                <Label for="title">Balance</Label>
                                <InputGroup className="align-items-center">
                                  <InputGroup.Prepend>
                                    <InputGroup.Text>$</InputGroup.Text>
                                  </InputGroup.Prepend>
                                  <input
                                    name="value7"
                                    type="text"
                                    value={parseCurrencyOrNormal(report.value7)}
                                    placeholder="0"
                                    onChange={(e) =>
                                      handleChangeInput(
                                        e,
                                        'value7',
                                        InputType.Currency
                                      )
                                    }
                                    className="form-control"
                                  />
                                </InputGroup>
                              </FormGroup>
                              <FormGroup className="mb-0">
                                <Label>Fraud Prevention Product</Label>
                              </FormGroup>
                              {Object.entries(
                                report?.paymentRisks?.fraudPreventionProducts ||
                                  {}
                              ).map((entry) => (
                                <SwitchInputWithEditableControls
                                  id={entry[0]}
                                  key={entry[0]}
                                  checked={entry[1]?.value > 0}
                                  label={entry[1]?.key}
                                  onChange={(e) =>
                                    handlePaymentRisksToggle(e, entry)
                                  }
                                  controls={{
                                    maxLength: 50,
                                    onChange: (e) => {
                                      handlePaymentRisksToggleTextChange(
                                        e,
                                        entry
                                      );
                                    },
                                  }}
                                />
                              ))}
                            </CardBody>
                          )}
                        </>
                      </Accordion.Collapse>
                    </Card>
                    <Card>
                      <AccordionToggle
                        eventKey="4"
                        callback={handleAccordionClick}
                        setCurrentAccordionKey={setCurrentAccordionKey}
                      >
                        Fee Summary
                      </AccordionToggle>
                      <Accordion.Collapse eventKey="4">
                        <CardBody>
                          <FormGroup>
                            <Label for="title">
                              <TotalFeesOffsetSelect
                                options={feesOptions}
                                selected={feesSelected}
                                onSelect={(item) => {
                                  setFeesOptions([
                                    ...feesOptions.map((opt) => ({
                                      ...opt,
                                      isSelected: opt.key === item.key,
                                    })),
                                  ]);
                                  setFeesSelected(item);
                                  setReport({ ...report, feesMode: item });
                                }}
                              />
                            </Label>
                            <InputGroup className="align-items-center">
                              <InputGroup.Prepend>
                                <InputGroup.Text>$</InputGroup.Text>
                              </InputGroup.Prepend>
                              <input
                                name="totalFees"
                                type="text"
                                value={parseCurrencyOrNormal(report.totalFees)}
                                placeholder="0"
                                onChange={(e) =>
                                  handleChangeInput(
                                    e,
                                    'totalFees',
                                    InputType.Currency
                                  )
                                }
                                className="form-control"
                              />
                            </InputGroup>
                          </FormGroup>
                          <FormGroup>
                            <Label for="title">Bank Fees</Label>
                            <InputGroup className="align-items-center">
                              <InputGroup.Prepend>
                                <InputGroup.Text>$</InputGroup.Text>
                              </InputGroup.Prepend>
                              <input
                                name="value5"
                                type="text"
                                placeholder="0"
                                value={parseCurrencyOrNormal(report.value5)}
                                onChange={(e) =>
                                  handleChangeInput(
                                    e,
                                    'value5',
                                    InputType.Currency
                                  )
                                }
                                className="form-control"
                              />
                            </InputGroup>
                          </FormGroup>
                          <FormGroup>
                            <Label for="title">Basis Points</Label>
                            <InputGroup className="align-items-center">
                              <input
                                name="value6"
                                type="text"
                                value={parseCurrencyOrNormal(report.value6)}
                                placeholder="0"
                                onChange={(e) => handleChangeInput(e, 'value6')}
                                className="form-control"
                              />
                              <InputGroup.Append>
                                <InputGroup.Text>%</InputGroup.Text>
                              </InputGroup.Append>
                            </InputGroup>
                          </FormGroup>
                          <FormGroup>
                            <Label for="title">Earnings Allowance</Label>
                            <InputGroup className="align-items-center">
                              <InputGroup.Prepend>
                                <InputGroup.Text>$</InputGroup.Text>
                              </InputGroup.Prepend>
                              <input
                                name="value9"
                                type="text"
                                value={parseCurrencyOrNormal(report.value9)}
                                placeholder="0"
                                onChange={(e) =>
                                  handleChangeInput(
                                    e,
                                    'value9',
                                    InputType.Currency
                                  )
                                }
                                className="form-control"
                              />
                            </InputGroup>
                          </FormGroup>
                          <FormGroup>
                            <Label for="title">Balances</Label>
                            <InputGroup className="align-items-center">
                              <InputGroup.Prepend>
                                <InputGroup.Text>$</InputGroup.Text>
                              </InputGroup.Prepend>
                              <input
                                name="value7"
                                type="text"
                                value={parseCurrencyOrNormal(report.value7)}
                                placeholder="0"
                                onChange={(e) =>
                                  handleChangeInput(
                                    e,
                                    'value7',
                                    InputType.Currency
                                  )
                                }
                                className="form-control"
                              />
                            </InputGroup>
                          </FormGroup>
                          <FormGroup>
                            <Label for="title">Balances to Offset</Label>
                            <InputGroup className="align-items-center">
                              <InputGroup.Prepend>
                                <InputGroup.Text>$</InputGroup.Text>
                              </InputGroup.Prepend>
                              <input
                                name="value8"
                                type="text"
                                value={parseCurrencyOrNormal(report.value8)}
                                placeholder="0"
                                onChange={(e) =>
                                  handleChangeInput(
                                    e,
                                    'value8',
                                    InputType.Currency
                                  )
                                }
                                className="form-control"
                              />
                            </InputGroup>
                          </FormGroup>
                          <FormGroup className="mt-3">
                            <h5>Fee Allocation</h5>
                            {Object.entries(
                              sortAndRearrangeJSONByKeyAtEnd({
                                ...feeAllocationData,
                              })
                            ).map((feeAlloc) => (
                              <FormGroup key={feeAlloc[0]}>
                                <Label for="title">{feeAlloc[0]}</Label>
                                <input
                                  name="feeAlloc"
                                  type="text"
                                  placeholder="0"
                                  value={percentageValOrEmpty(
                                    feeAlloc[1] || '0'
                                  )}
                                  onChange={(e) => {
                                    const newValue = e.target.value;
                                    if (/^\d*\.?\d*$/.test(newValue)) {
                                      setFeeAllocationData({
                                        ...feeAllocationData,
                                        [feeAlloc[0]]:
                                          parseInt(newValue) > 100
                                            ? 100
                                            : newValue,
                                      });
                                    }
                                  }}
                                  className="form-control"
                                />
                              </FormGroup>
                            ))}
                          </FormGroup>
                        </CardBody>
                      </Accordion.Collapse>
                    </Card>
                    <Card>
                      <AccordionToggle
                        eventKey="5"
                        callback={handleAccordionClick}
                        setCurrentAccordionKey={setCurrentAccordionKey}
                      >
                        Glossary of Terms
                      </AccordionToggle>
                      <Accordion.Collapse eventKey="5">
                        <CardBody>
                          <NoDataFound
                            title={
                              <div className="text-gray-search fs-7 font-weight-medium">
                                No glossary of terms data to be adjusted.
                              </div>
                            }
                            icon="draw"
                            iconStyle="font-size-2em text-gray-search"
                            containerStyle="text-gray-900"
                          />
                        </CardBody>
                      </Accordion.Collapse>
                    </Card>
                  </Accordion>
                </FormGroup>
              </div>
            </Col>
            <Col
              md={7}
              className={`bg-gray-5 pb-3 pl-0 ${
                currentAccordionKey === null
                  ? 'd-flex align-items-center justify-content-center'
                  : ''
              }`}
            >
              {currentAccordionKey === null && (
                <NoDataFound
                  title="No page selected."
                  description="Please expand a page menu from left to edit values."
                  icon="analytics"
                  containerStyle="text-gray-900"
                />
              )}
              {currentAccordionKey === '0' && (
                <Overview
                  wrap={false}
                  report={report}
                  whenPrinting={false}
                  excelBankMode={excelBankMode}
                  selectedTenant={selectedTenant}
                  ignoreHeadings={false}
                />
              )}
              {currentAccordionKey === '1' && (
                <Payables
                  wrap={false}
                  report={report}
                  whenPrinting={false}
                  insightsData={insightsData}
                  ignoreHeadings={false}
                  selectedTenant={selectedTenant}
                  loaderInsights={loaderInsights}
                />
              )}
              {currentAccordionKey === '2' && (
                <Receivables
                  wrap={false}
                  report={report}
                  setReport={setReport}
                  whenPrinting={false}
                  insightsData={insightsData}
                  excelBankMode={excelBankMode}
                  ignoreHeadings={false}
                  loaderInsights={loaderInsights}
                  selectedTenant={selectedTenant}
                />
              )}
              {currentAccordionKey === '3' && (
                <Fraud
                  wrap={false}
                  report={report}
                  insightsData={insightsData}
                  excelBankMode={excelBankMode}
                  whenPrinting={false}
                  selectedTenant={selectedTenant}
                  loaderInsights={loaderInsights}
                  ignoreHeadings={false}
                />
              )}
              {currentAccordionKey === '4' && (
                <FeeSummary
                  wrap={false}
                  report={report}
                  totalPages={6}
                  excelBankMode={excelBankMode}
                  ignoreHeadings={false}
                  selectedTenant={selectedTenant}
                  feeAllocationData={feeAllocationData}
                />
              )}
              {currentAccordionKey === '5' && (
                <Glossary
                  wrap={false}
                  report={report}
                  setReport={setReport}
                  ignoreHeadings={false}
                  selectedTenant={selectedTenant}
                />
              )}
            </Col>
          </Row>
        </SimpleModalCreation>
      )}
    </>
  );
};
export default GenerateTreasuryReportModal;
