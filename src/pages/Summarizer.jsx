import AlertWrapper from '../components/Alert/AlertWrapper';
import Alert from '../components/Alert/Alert';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  FormGroup,
  Row,
  Spinner,
} from 'reactstrap';
import React, { useContext, useEffect, useState } from 'react';
import { AlertMessageContext } from '../contexts/AlertMessageContext';
import MaterialIcon from '../components/commons/MaterialIcon';
import ButtonIcon from '../components/commons/ButtonIcon';
import DotDot from '../components/commons/DotDot';
import TypeWriter from '../components/commons/TypeWriter';
import Bullets from '../views/Resources/selfAssessment/Bullets';
import KagiService from '../services/kagi.service';
import JobService from '../services/job.service';
import prospectService from '../services/prospect.service';
import { scrollToTop, SUMMARIZE_RECENT_SEARCHES } from '../utils/Utils';
import axios from 'axios';
import IdfTooltip from '../components/idfComponents/idfTooltip';
import FunnyLoaderBlinker from '../components/commons/FunnyLoaderBlinker';
import AIReferences from '../components/commons/AIReferences';

const defaultErrorMsg =
  'Summary could not be generated. Try using an alternate content source.';

const detectContentType = (url) => {
  const lowercaseUrl = url.toLowerCase();

  // Check for popular video platforms
  if (
    lowercaseUrl.includes('youtube.com') ||
    lowercaseUrl.includes('youtu.be') ||
    lowercaseUrl.includes('vimeo.com')
  ) {
    return { label: 'Video', icon: 'play_circle' };
  }

  // Check for Twitter threads
  if (
    lowercaseUrl.includes('twitter.com') &&
    lowercaseUrl.includes('/status/')
  ) {
    return { label: 'Twitter', icon: 'receipt' };
  }

  // Check for video file extensions
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'];
  const fileExtension = url.split('.').pop().toLowerCase();
  if (videoExtensions.includes(fileExtension)) {
    return { label: 'Video', icon: 'play_circle' };
  }

  // Check for audio file extensions
  const audioExtensions = ['mp3', 'wav'];
  if (audioExtensions.includes(fileExtension)) {
    return { label: 'Audio (mp3/wav)', icon: 'play_circle' };
  }

  // Check for PDF file extensions
  if (fileExtension === 'pdf') {
    return { label: 'PDF', icon: 'picture_as_pdf' };
  }

  // Check for PowerPoint file extensions
  if (fileExtension === 'ppt' || fileExtension === 'pptx') {
    return { label: fileExtension.toUpperCase(), icon: 'find_in_page' };
  }

  // If none of the specific content types match, assume it's a web page
  return { label: 'Web Page', icon: 'description' };
};

const HeadingWithIcon = ({ text, icon }) => {
  return (
    <div className="d-flex align-items-center gap-1">
      <MaterialIcon icon={icon} />
      <h5 className="mb-0">{text}</h5>
    </div>
  );
};

const ExpandableTypes = {
  Url: 1,
  Text: 2,
  Upload: 3,
  Void: -1,
};

const FormatTypes = {
  Analytical: 'analytical',
  Summary: 'summary',
  KeyMoments: 'takeaway',
};

const FORMATS = [
  {
    title: 'Analytical',
    isSelected: false,
    icon: 'add_notes',
    value: FormatTypes.Analytical,
    symbols: true,
    clazz: 'mr-2',
    allowed: [ExpandableTypes.Url, ExpandableTypes.Text, ExpandableTypes.Void],
  },
  {
    title: 'Summary',
    isSelected: false,
    icon: 'article',
    value: FormatTypes.Summary,
    symbols: true,
    clazz: 'mr-0',
    allowed: [
      ExpandableTypes.Url,
      ExpandableTypes.Text,
      ExpandableTypes.Void,
      ExpandableTypes.Upload,
    ],
  },
  {
    title: 'Key Moments',
    isSelected: false,
    icon: 'format_list_bulleted',
    value: FormatTypes.KeyMoments,
    symbols: true,
    clazz: 'mr-0',
    allowed: [
      ExpandableTypes.Url,
      ExpandableTypes.Text,
      ExpandableTypes.Void,
      ExpandableTypes.Upload,
    ],
  },
];

const ExpandableItem = ({
  expandable,
  setExpandable,
  currenType,
  iconLabel,
  children,
}) => {
  return (
    <Card className="my-2">
      {expandable === currenType ? (
        <CardBody className="p-2 rpt-bg-light-gray bg-hover-gray">
          <div
            onClick={() => setExpandable(ExpandableTypes.Void)}
            className="d-flex gap-1 cursor-pointer pt-1 justify-content-between align-items-center"
          >
            <div className="d-flex gap-1 align-items-center">
              <MaterialIcon icon={iconLabel.icon} />
              <div>
                <h5 className="mb-0">{iconLabel.label}</h5>
                <p className="font-weight-normal font-size-sm2 text-muted mb-0">
                  {iconLabel.description}
                </p>
              </div>
            </div>
            <div>
              <MaterialIcon icon="keyboard_arrow_up" />
            </div>
          </div>
          {children}
        </CardBody>
      ) : (
        <CardBody
          className="p-2 bg-hover-gray cursor-pointer"
          onClick={() => setExpandable(currenType)}
        >
          <div className="d-flex gap-1 pt-1 justify-content-between align-items-center">
            <div className="d-flex gap-1 align-items-center">
              <MaterialIcon icon={iconLabel.icon} />
              <div>
                <h5 className="mb-0">{iconLabel.label}</h5>
                <p className="font-weight-normal font-size-sm2 text-muted mb-0">
                  {iconLabel.description}
                </p>
              </div>
            </div>
            <div>
              <MaterialIcon icon="keyboard_arrow_down" />
            </div>
          </div>
        </CardBody>
      )}
    </Card>
  );
};
const Summarizer = ({ activeTab }) => {
  const getRecentSearches = () => {
    let searches =
      prospectService.getListLocallyByKey(SUMMARIZE_RECENT_SEARCHES) || [];
    searches = searches.map((s) => ({
      ...s,
      isSelected: false,
    }));
    return searches;
  };

  const [cancelTokens, setCancelTokens] = useState([]);
  const [expandable, setExpandable] = useState(ExpandableTypes.Url);
  const [searchHistory, setSearchHistory] = useState(getRecentSearches());
  const { successMessage, setSuccessMessage, errorMessage, setErrorMessage } =
    useContext(AlertMessageContext);
  const [query, setQuery] = useState({
    url: '',
    text: '',
    format: FORMATS[0],
  });

  const [references, setReferences] = useState([]);
  const [loader, setLoader] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pdfProcessing, setPdfProcessing] = useState(false);
  const [analyticalContent, setAnalyticalContent] = useState([]);
  const [content, setContent] = useState('');
  let apiCallInterval = '';
  let checkJobCounter = 0;
  const checkJobInterval = 3000; // 3 seconds

  const callKagi = async () => {
    setAnalyticalContent([]);
    setContent('');
    let response = null;
    if (query.file && expandable === ExpandableTypes.Upload) {
      // for cases if file is already process, we need to reprocess it
      if (query?.fileId) {
        const pdfResponse = await KagiService.reprocessFile(
          query.fileId,
          query.format.value
        );
        const signalFileUpload = axios.CancelToken.source();
        const tokenJobCheck = axios.CancelToken.source();
        const signalFileSummary = axios.CancelToken.source();
        setCancelTokens([signalFileUpload, tokenJobCheck, signalFileSummary]);
        setUploading(true);
        setLoader(true);
        try {
          setUploading(false);
          pdfResponse?.job?.jobId &&
            (await checkPDFJobStatus(
              { ...pdfResponse, file: { id: query.fileId } },
              tokenJobCheck.token,
              signalFileSummary.token
            ));
        } catch (err) {
          console.log(err);
          setUploading(false);
          setLoader(false);
          setPdfProcessing(false);
          setQuery({ ...query, fileId: '' });
          if (axios.isCancel(err)) {
            console.log('Request cancelled:', err.message);
          }
        }
      } else {
        const signalFileUpload = axios.CancelToken.source();
        const tokenJobCheck = axios.CancelToken.source();
        const signalFileSummary = axios.CancelToken.source();
        setCancelTokens([signalFileUpload, tokenJobCheck, signalFileSummary]);
        setUploading(true);
        setLoader(true);
        try {
          const response = await KagiService.uploadPDFFileAndGetJob(
            query.file,
            query.format.value,
            signalFileUpload.token
          );
          setUploading(false);
          setQuery({ ...query, fileId: response?.file?.id });
          response?.job?.jobId &&
            (await checkPDFJobStatus(
              response,
              tokenJobCheck.token,
              signalFileSummary.token
            ));
        } catch (err) {
          console.log(err);
          setUploading(false);
          setLoader(false);
          setPdfProcessing(false);
          setQuery({ ...query, fileId: '' });
          if (axios.isCancel(err)) {
            console.log('Request cancelled:', err.message);
          }
        }
      }
    } else {
      const signalRequest = axios.CancelToken.source();
      setCancelTokens([signalRequest]);
      try {
        if (query.url && expandable === ExpandableTypes.Url) {
          response = await KagiService.getSummaryOfUrlOrText(
            {
              url: query.url,
              summary_type: query.format.value,
            },
            signalRequest.token
          );
        } else if (query.text && expandable === ExpandableTypes.Text) {
          response = await KagiService.getSummaryOfUrlOrText(
            {
              text: query.text,
              summary_type: query.format.value,
            },
            signalRequest.token
          );
        }
        const { data } = response;
        if (data?.error?.length) {
          setErrorMessage(data?.error[0]?.msg || defaultErrorMsg);
        } else {
          setContent(data.output);
          setReferences(data.references || []);
          const searches = [
            ...searchHistory,
            {
              type: expandable,
              contentType:
                expandable === ExpandableTypes.Url
                  ? detectContentType(query.url)
                  : { label: 'Text', icon: 'text_fields' },
              output: data.output,
              date: Date.now(),
            },
          ];
          saveSearchHistory(searches);
        }
      } catch (err) {
        setErrorMessage(defaultErrorMsg);
      } finally {
        setUploading(false);
        setLoader(false);
        setPdfProcessing(false);
      }
    }
  };

  // facepalm
  const callKagiForAnalyticalFormat = async () => {
    let requests = [];
    setContent('');
    const signalRequest = axios.CancelToken.source();
    setCancelTokens([signalRequest]);
    const catchAndThrowError = (err) => {
      throw err;
    };
    if (query.url && expandable === ExpandableTypes.Url) {
      requests = [
        KagiService.getSummaryOfUrlOrText(
          {
            url: query.url,
            summary_type: FormatTypes.Summary,
          },
          signalRequest.token
        )
          .then((res) => res)
          .catch(catchAndThrowError),
        KagiService.getSummaryOfUrlOrText(
          {
            url: query.url,
            summary_type: FormatTypes.KeyMoments,
          },
          signalRequest.token
        )
          .then((res) => res)
          .catch(catchAndThrowError),
      ];
    } else if (query.text && expandable === ExpandableTypes.Text) {
      requests = [
        KagiService.getSummaryOfUrlOrText(
          {
            text: query.text,
            summary_type: FormatTypes.Summary,
          },
          signalRequest.token
        )
          .then((res) => res)
          .catch(catchAndThrowError),
        KagiService.getSummaryOfUrlOrText(
          {
            text: query.text,
            summary_type: FormatTypes.KeyMoments,
          },
          signalRequest.token
        )
          .then((res) => res)
          .catch(catchAndThrowError),
      ];
    }

    try {
      const responses = await Promise.all(requests);
      const newContent = responses.map((res) => {
        return res.data.output;
      });
      const allReferences = responses
        .filter((ref) => !!ref.data.resources)
        .map((ref) => {
          return ref.data.references || [];
        });
      setAnalyticalContent(newContent);
      setReferences([...allReferences]);

      const searches = [
        ...searchHistory,
        {
          type: expandable,
          contentType:
            expandable === ExpandableTypes.Url
              ? detectContentType(query.url)
              : { label: 'Text', icon: 'text_fields' },
          output: newContent[0],
          outputs: newContent,
          date: Date.now(),
        },
      ];
      saveSearchHistory(searches);
    } catch (e) {
      setErrorMessage(defaultErrorMsg);
    } finally {
      setUploading(false);
      setLoader(false);
      setPdfProcessing(false);
    }
  };

  const handleSummarize = async () => {
    setLoader(true);
    scrollToTop();
    if (query?.format?.value === FormatTypes.Analytical) {
      await callKagiForAnalyticalFormat();
    } else {
      await callKagi();
    }
  };
  const handleCopyResponse = () => {
    if (
      query.format.value === FormatTypes.Analytical &&
      analyticalContent.length > 0
    ) {
      const contentString = `Summary: 
      ${analyticalContent[0]}\n\nKey Moments:
      ${analyticalContent[1]}
      `;
      navigator.clipboard.writeText(contentString);
    } else {
      navigator.clipboard.writeText(content);
    }
    setSuccessMessage('Text copied!');
  };

  const resetSummarizeForm = () => {
    // if moving away from this Write tab. Clear the form.
    setQuery({
      url: '',
      text: '',
      format: FORMATS[0],
      file: null,
    });
    setContent('');
    setLoader(false);
    setUploading(false);
    setExpandable(ExpandableTypes.Url);
    setAnalyticalContent([]);
    setSearchHistory(getRecentSearches());
  };

  const handleRecentSearch = (item, itemIndex) => {
    scrollToTop();
    setSearchHistory([
      ...searchHistory.map((srch, index) => ({
        ...srch,
        isSelected: index === itemIndex,
      })),
    ]);
    if (item?.outputs?.length) {
      setContent('');
      setAnalyticalContent(item.outputs);
    } else {
      setAnalyticalContent([]);
      setContent(item.output);
    }
  };

  const handleRecentSearchRemove = (e, item, itemIndex) => {
    e.preventDefault();
    e.stopPropagation();
    const newSearches = [...searchHistory];
    newSearches.splice(itemIndex, 1);
    if (newSearches.length) {
      saveSearchHistory(newSearches);
    } else {
      localStorage.removeItem(SUMMARIZE_RECENT_SEARCHES);
      setSearchHistory([]);
    }
  };

  const saveSearchHistory = (searches) => {
    // sort by date
    searches.sort((a, b) => b.date - a.date);

    const top5Searches = searches.slice(0, 5);

    setSearchHistory(top5Searches);
    // only save 5
    prospectService.saveListLocallyByKey(
      SUMMARIZE_RECENT_SEARCHES,
      top5Searches
    );
  };

  const checkPDFJobStatus = async (
    fileCreateResponse,
    signalCheckJob,
    signalFileSummary
  ) => {
    const jobId = fileCreateResponse?.job?.jobId;
    if (jobId) {
      const runJobCheck = async () => {
        const response = await JobService.checkJobStatus(jobId, signalCheckJob);
        clearInterval(apiCallInterval);
        // 1 min check, if it didn't process successfully, stop it and open a modal
        if (checkJobCounter >= 60) {
          setErrorMessage(defaultErrorMsg);
        } else {
          if (response.status === 'success') {
            const pdfResponse = await KagiService.getFileSummary(
              fileCreateResponse?.file?.id,
              signalFileSummary
            );
            const pdfData = pdfResponse.body;
            const { data } = pdfData;
            setLoader(false);
            setUploading(false);
            setPdfProcessing(false);
            setContent(data.output);
            setReferences(data.references || []);
          } else if (response.status === 'failed') {
            console.log(response);
            setErrorMessage(response.failureReason || defaultErrorMsg);
            setPdfProcessing(false);
            setUploading(false);
            setLoader(false);
            setContent('');
            setReferences([]);
            setQuery({ ...query, file: null });
          } else {
            // try for 10 times, if doesn't work stop it and open a modal for manual entry
            if (response.retryCount < 10) {
              checkPDFJobStatus(
                fileCreateResponse,
                signalCheckJob,
                signalFileSummary
              );
              checkJobCounter += checkJobInterval / 1000;
            } else {
              setErrorMessage(defaultErrorMsg);
            }
          }
        }
      };
      // call api after 6 seconds to check the status
      apiCallInterval = setInterval(async () => {
        runJobCheck();
      }, checkJobInterval);
    }
  };

  const handleStopClick = () => {
    // abort api request here
    cancelTokens.forEach((src) => {
      src.cancel('Request cancelled.');
    });
    setPdfProcessing(false);
    setUploading(false);
    setLoader(false);
    setContent('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    setQuery({ ...query, file });
  };

  const urlTextFile = {
    [ExpandableTypes.Url]: ['text', 'file'],
    [ExpandableTypes.Text]: ['url', 'file'],
    [ExpandableTypes.Upload]: ['text', 'url'],
    [ExpandableTypes.Void]: [],
  };
  useEffect(() => {
    const fieldsToClear = urlTextFile[expandable];
    if (fieldsToClear.length) {
      const fieldsObject = {};
      for (const name of fieldsToClear) {
        fieldsObject[name] = '';
      }
      let format = FORMATS[0];
      if (expandable === ExpandableTypes.Upload) {
        format = FORMATS[1];
      }
      setQuery({ ...query, ...fieldsObject, format });
    }
  }, [expandable]);

  useEffect(() => {
    resetSummarizeForm();
  }, [activeTab]);

  const PasteTextAndClear = ({ description, text, onClear }) => {
    return (
      <div className="d-flex align-items-center gap-1">
        <span>{description}</span>
        {text && (
          <a
            href=""
            className="fs-9 font-weight-semi-bold"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onClear();
            }}
          >
            [clear]
          </a>
        )}
      </div>
    );
  };
  return (
    <div className="position-relative">
      <AlertWrapper>
        <Alert
          color="success"
          message={successMessage}
          setMessage={setSuccessMessage}
        />
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
          time={8000}
        />
      </AlertWrapper>
      <Card>
        <CardBody>
          <Row>
            <Col md={4}>
              <div>
                <h5 className="mb-0">Universal Summarizer</h5>
                <p className="text-muted font-size-sm2 mb-0 font-weight-normal">
                  Summarize any content on the web - from articles to videos.
                </p>
              </div>
              <ExpandableItem
                expandable={expandable}
                setExpandable={setExpandable}
                currenType={ExpandableTypes.Url}
                iconLabel={{
                  icon: 'link',
                  label: 'Link',
                  description: 'Link to content you want to summarize.',
                }}
              >
                <FormGroup className="my-2 position-relative">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter URL"
                    value={query.url}
                    onChange={(e) =>
                      setQuery({ ...query, url: e.target.value })
                    }
                  />
                  {query.url && (
                    <a
                      href=""
                      style={{ right: 2 }}
                      className="position-absolute abs-center-y d-flex bg-white shadow-sm icon-hover-bg align-items-center justify-content-center"
                      onClick={(e) => {
                        e.preventDefault();
                        setQuery({ ...query, url: '' });
                      }}
                    >
                      <IdfTooltip text="Clear">
                        <MaterialIcon icon="close" />{' '}
                      </IdfTooltip>{' '}
                    </a>
                  )}
                </FormGroup>
              </ExpandableItem>
              <ExpandableItem
                expandable={expandable}
                setExpandable={setExpandable}
                currenType={ExpandableTypes.Text}
                iconLabel={{
                  icon: 'text_fields',
                  label: 'Paste text',
                  description: (
                    <PasteTextAndClear
                      description="Paste in any text you want to summarize."
                      text={query.text}
                      onClear={() => {
                        setQuery({ ...query, text: '' });
                      }}
                    />
                  ),
                }}
              >
                <FormGroup className="my-2">
                  <textarea
                    className="form-control"
                    rows="4"
                    value={query.text}
                    placeholder="Enter text"
                    onChange={(e) =>
                      setQuery({ ...query, text: e.target.value })
                    }
                  ></textarea>
                </FormGroup>
              </ExpandableItem>

              <ExpandableItem
                expandable={expandable}
                setExpandable={setExpandable}
                currenType={ExpandableTypes.Upload}
                iconLabel={{
                  icon: 'picture_as_pdf',
                  label: 'PDF',
                  description: 'Upload PDF file to summarize.',
                }}
              >
                <>
                  <FormGroup className="my-2 position-relative">
                    <input
                      type="file"
                      className="form-control idf-custom-file font-size-sm2"
                      accept="application/pdf"
                      style={{ height: 50 }}
                      onChange={handleFileUpload}
                    />
                    {query.file && (
                      <a
                        href=""
                        className="position-absolute icon-hover-bg abs-center-y"
                        style={{ right: 10 }}
                        onClick={(e) => {
                          e.preventDefault();
                          setQuery({ ...query, file: null });
                        }}
                      >
                        <IdfTooltip text="Remove">
                          <MaterialIcon icon="close" />
                        </IdfTooltip>
                      </a>
                    )}
                  </FormGroup>
                  {uploading && (
                    <div className="d-flex fs-10 align-items-center gap-1">
                      <Spinner className="spinner-grow-xs" />
                      <span>Uploading file</span>
                      <DotDot />
                    </div>
                  )}
                </>
              </ExpandableItem>

              <Card className="p-0 my-2">
                <CardHeader className="border-0 px-3 pb-1">
                  <HeadingWithIcon icon="list" text="Format" />{' '}
                </CardHeader>
                <CardBody className="p-2">
                  <div className="d-flex gap-1 text-center align-items-start">
                    {FORMATS.map((frmt) => (
                      <>
                        {frmt.allowed.includes(expandable) ? (
                          <div
                            key={frmt.title}
                            className="text-center links-hover px-2 rounded"
                            onClick={() => setQuery({ ...query, format: frmt })}
                          >
                            <div
                              className={`d-flex align-items-center justify-content-center ${frmt.clazz}`}
                            >
                              <div>
                                <div
                                  style={{ width: 62 }}
                                  className={`rpt-bg-light-gray m-auto hover-child-border rounded p-2 ${
                                    frmt.title === query.format.title
                                      ? 'border-primary'
                                      : ''
                                  }`}
                                >
                                  <MaterialIcon
                                    icon={frmt.icon}
                                    symbols={frmt.symbols}
                                    clazz={`font-size-3xl d-flex align-items-center justify-content-center text-gray-search ${
                                      frmt.title === query.format.title
                                        ? 'text-primary'
                                        : ''
                                    }`}
                                  />
                                </div>
                                <p className="fs-8 my-1 text-center text-nowrap">
                                  {frmt.title}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <></>
                        )}
                      </>
                    ))}
                  </div>
                </CardBody>
              </Card>
              <ButtonIcon
                color="primary"
                label="Summarize"
                classnames="w-100 mt-1"
                onclick={handleSummarize}
                disabled={!query.text && !query.url && !query.file}
              />
              {searchHistory.length > 0 && (
                <div className="mt-4">
                  <div className="d-flex pb-3 align-items-center justify-content-between">
                    <h5 className="mb-0">Recent search summary history</h5>
                    <a
                      href=""
                      className="fs-9 font-weight-semi-bold"
                      onClick={(e) => {
                        e.preventDefault();
                        localStorage.removeItem(SUMMARIZE_RECENT_SEARCHES);
                        setSearchHistory([]);
                      }}
                    >
                      [clear]
                    </a>
                  </div>
                  <div className="d-flex align-items-start flex-column gap-1">
                    {searchHistory.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => handleRecentSearch(item, index)}
                        className={`${
                          item.isSelected
                            ? 'bg-primary text-white text-white-children'
                            : ''
                        } tag-item d-flex hovering align-items-center justify-content-between cursor-pointer fs-8 p-1 font-weight-medium px-3 gap-1 rounded-pill`}
                      >
                        <div className="d-flex align-items-center gap-1">
                          <MaterialIcon
                            icon={item.contentType.icon}
                            clazz="font-size-sm2"
                          />
                          <span>{item.output?.slice(0, 32)}</span>
                          <span>[{item.contentType.label}]</span>
                        </div>
                        <a
                          href=""
                          onClick={(e) =>
                            handleRecentSearchRemove(e, item, index)
                          }
                        >
                          <IdfTooltip text="Remove">
                            <MaterialIcon
                              icon="close"
                              clazz="font-size-sm2 font-weight-bold"
                            />
                          </IdfTooltip>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Col>
            <Col md={8} className="overflow-y-hidden pl-0">
              <HeadingWithIcon icon="auto_awesome" text="Summary" />
              <Card className="rpt-bg-light-gray mt-2 h-100">
                <CardBody className="p-3 position-relative text-left">
                  {loader ? (
                    <FunnyLoaderBlinker />
                  ) : (
                    <div className="px-1">
                      {analyticalContent?.length > 0 ? (
                        <div>
                          <h5>Summary:</h5>
                          <TypeWriter text={analyticalContent[0]} speed={30} />
                          <br />
                          <h5>Key Moments:</h5>
                          <TypeWriter text={analyticalContent[1]} speed={30} />
                          {references.length > 0 && (
                            <AIReferences list={references} />
                          )}
                        </div>
                      ) : (
                        <>
                          {content ? (
                            <>
                              <TypeWriter text={content} speed={30} />
                              {references.length > 0 && (
                                <AIReferences list={references} />
                              )}
                            </>
                          ) : (
                            <div className="text-muted font-size-sm2 text-left">
                              <p>
                                You can summarize many types of web content,
                                including:
                              </p>
                              <div className="mb-2">
                                <Bullets
                                  list={[
                                    'Text web pages, articles, and forum threads.',
                                    'PDF documents',
                                    'PowerPoint documents (.pptx)',
                                    'Audio files (mp3/wav)',
                                    'YouTube URLs',
                                  ]}
                                />
                              </div>
                              <p>
                                To start summarizing, enter the URL for your
                                content type or paster a text.
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </CardBody>
      </Card>
      {(content || pdfProcessing || loader || analyticalContent.length > 0) && (
        <div
          className="position-absolute d-flex align-items-center gap-2 m-2"
          style={{ right: 14, top: 3 }}
        >
          {(loader || pdfProcessing) && (
            <ButtonIcon
              color="danger"
              label="Stop"
              icon="stop"
              onclick={handleStopClick}
              classnames="btn-xs"
            />
          )}
          {(content || analyticalContent.length > 0) && (
            <>
              {' '}
              <ButtonIcon
                onclick={handleSummarize}
                icon={'refresh'}
                label="Regenerate"
                color="primary"
                classnames="btn-xs"
              />
              <ButtonIcon
                color="outline-primary"
                label="Copy"
                icon="content_copy"
                onclick={handleCopyResponse}
                classnames="btn-xs"
              />
              <ButtonIcon
                color="outline-danger"
                label="Clear"
                icon="cancel"
                onclick={resetSummarizeForm}
                classnames="btn-xs"
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};
export default Summarizer;
