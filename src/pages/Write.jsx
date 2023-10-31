import { Card, CardBody, CardHeader, Col, FormGroup, Row } from 'reactstrap';
import MaterialIcon from '../components/commons/MaterialIcon';
import ButtonIcon from '../components/commons/ButtonIcon';
import React, { useContext, useEffect, useState } from 'react';
import TypeWriter from '../components/commons/TypeWriter';
import { AlertMessageContext } from '../contexts/AlertMessageContext';
import AlertWrapper from '../components/Alert/AlertWrapper';
import Alert from '../components/Alert/Alert';
import { scrollToTop } from '../utils/Utils';
import { useTenantContext } from '../contexts/TenantContext';
import { useProfileContext } from '../contexts/profileContext';
import FunnyLoaderBlinker from '../components/commons/FunnyLoaderBlinker';
import useUrlSearchParams from '../hooks/useUrlSearchParams';
import { useHistory } from 'react-router-dom';
import AIReferences from '../components/commons/AIReferences';
import AnthropicService from '../services/anthropic.service';

const LAYOUTS = {
  horizontal: 'horizontal',
  vertical: 'vertical',
};

const TONES = [
  {
    title: 'Professional',
    isSelected: false,
  },
  {
    title: 'Casual',
    isSelected: false,
  },
  {
    title: 'Enthusiastic',
    isSelected: false,
  },
  {
    title: 'Informational',
    isSelected: false,
  },
  {
    title: 'Funny',
    isSelected: false,
  },
];

const FORMATS = [
  {
    title: 'Paragraph',
    isSelected: false,
    icon: 'subject',
  },
  {
    title: 'Email',
    isSelected: false,
    icon: 'local_post_office',
  },
  {
    title: 'Article',
    isSelected: false,
    icon: 'article',
  },
  {
    title: 'List',
    isSelected: false,
    icon: 'format_list_bulleted',
  },
];

const LENGTHS = [
  {
    title: 'Short',
    isSelected: false,
    icon: 'subject',
    count: 100,
  },
  {
    title: 'Medium',
    isSelected: false,
    icon: 'local_post_office',
    count: 300,
  },
  {
    title: 'Long',
    isSelected: false,
    icon: 'post_add',
    count: 500,
  },
];

const HeadingWithIcon = ({ text, icon }) => {
  return (
    <div className="d-flex align-items-center gap-1">
      <MaterialIcon icon={icon} />
      <h5 className="mb-0">{text}</h5>
    </div>
  );
};

const Write = ({ activeTab, layout = LAYOUTS.horizontal }) => {
  const { successMessage, setSuccessMessage, errorMessage, setErrorMessage } =
    useContext(AlertMessageContext);
  const [query, setQuery] = useState({
    text: '',
    tone: TONES[0],
    format: FORMATS[0],
    length: LENGTHS[0],
  });

  const [loader, setLoader] = useState(false);
  const [content, setContent] = useState('');
  const [references, setReferences] = useState([]);
  const { tenant } = useTenantContext();
  const { profileInfo } = useProfileContext();
  const history = useHistory();
  const params = useUrlSearchParams();
  const prospect = JSON.parse(params?.get('prospect') || '{}');

  const callAI = async (newQuery) => {
    setLoader(true);
    setContent('');
    if (layout === LAYOUTS.horizontal) {
      scrollToTop();
    }
    try {
      const queryAI =
        newQuery ||
        `"${query.text}" and tone should be "${query.tone.title}" and format should be "${query.format.title}" and max words should be "${query.length.count}".`;

      // call Anthropic AI
      const response = await AnthropicService.createCompletion({
        prompt: queryAI,
        max_tokens_to_sample: 1500,
      });
      setContent(response.completion);
      setReferences([]);
    } catch (e) {
      console.log(e);
    } finally {
      setLoader(false);
    }
  };
  const handleGenerateDraft = () => {
    callAI(null);
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(content);
    setSuccessMessage('Text copied!');
  };

  const resetWriteForm = () => {
    // if moving away from this Write tab. Clear the form.
    setQuery({
      text: '',
      tone: TONES[0],
      format: FORMATS[0],
      length: LENGTHS[0],
    });
    setContent('');
    setLoader(false);
    setReferences([]);
  };

  useEffect(() => {
    resetWriteForm();
  }, [activeTab]);

  useEffect(() => {
    if (prospect?.first_name && tenant && profileInfo) {
      const titleString = prospect.title ? `${prospect.title}` : '';
      const employerString = prospect.employer ? `at ${prospect.employer}` : '';

      const newQuery = {
        text: `Write a cold professional introductory email to ${prospect.first_name} ${prospect.last_name}, ${titleString} ${employerString}. Purpose of the email is to setup a discovery call to learn more about the company and how we at ${tenant.name} can help. The email should be sent from ${profileInfo.first_name} ${profileInfo.last_name}, from ${tenant.name}. Ask about setting up an introduction call and how we can help them.
        \nFollow these email rules:
        1. Use first name only when addressing recipient in email.
        2. Use first and last name when addressing sender in email.
        3. Keep email copy at very high level.
        4. Request to setup a call to discuss how our company ${tenant.name} can help.
        5. Do not mention what the company ${prospect.employer} does in the email.
        6. Include email subject for purpose of email at the top.`,
        tone: TONES[0],
        format: FORMATS[1],
        length: LENGTHS[0],
      };
      setQuery(newQuery);
      callAI(`${newQuery.text}\nDo not mention Kagi Search or FastGPT.`);
    }
  }, [tenant, profileInfo]);

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
      <Card
        className={layout === LAYOUTS.vertical ? 'border-0 shadow-none' : ''}
      >
        <CardBody>
          <Row
            className={layout === LAYOUTS.vertical ? 'flex-column' : 'flex-row'}
          >
            <Col md={layout === LAYOUTS.vertical ? 12 : 4}>
              <HeadingWithIcon icon="draw" text="Write about" />{' '}
              <FormGroup className="my-2">
                <textarea
                  className="form-control"
                  rows="13"
                  value={query.text}
                  placeholder="Tell AI what you want to write about"
                  onChange={(e) => setQuery({ ...query, text: e.target.value })}
                ></textarea>
              </FormGroup>
              <Card className="p-0 my-2">
                <CardHeader className="border-0 px-3 pb-1">
                  <HeadingWithIcon icon="record_voice_over" text="Tone" />{' '}
                </CardHeader>
                <CardBody className="p-3">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    {TONES.map((tone) => (
                      <ButtonIcon
                        key={tone.title}
                        label={tone.title}
                        classnames="btn-sm px-3"
                        onclick={() => setQuery({ ...query, tone })}
                        color={
                          tone.title === query.tone.title
                            ? 'primary'
                            : 'outline-primary'
                        }
                      />
                    ))}
                  </div>
                </CardBody>
              </Card>
              <Card className="p-0 my-2">
                <CardHeader className="border-0 px-3 pb-1">
                  <HeadingWithIcon icon="list" text="Format" />{' '}
                </CardHeader>
                <CardBody className="p-2">
                  <div className="d-flex align-items-center gap-2">
                    {FORMATS.map((frmt) => (
                      <div
                        key={frmt.title}
                        className="text-center links-hover px-2 rounded"
                        onClick={() => setQuery({ ...query, format: frmt })}
                      >
                        <div
                          className={`rpt-bg-light-gray hover-child-border rounded p-2 ${
                            frmt.title === query.format.title
                              ? 'border-primary'
                              : ''
                          }`}
                        >
                          <MaterialIcon
                            icon={frmt.icon}
                            clazz={`font-size-3xl text-gray-search ${
                              frmt.title === query.format.title
                                ? 'text-primary'
                                : ''
                            }`}
                          />
                        </div>
                        <p className="fs-8 my-1">{frmt.title}</p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
              <Card className="p-0 my-2">
                <CardHeader className="border-0 px-3 pb-1">
                  <HeadingWithIcon icon="subject" text="Length" />{' '}
                </CardHeader>
                <CardBody className="p-3">
                  <div className="d-flex align-items-center gap-2">
                    {LENGTHS.map((lt) => (
                      <ButtonIcon
                        key={lt.title}
                        label={lt.title}
                        style={{ width: 160 }}
                        classnames="btn-sm px-3"
                        onClick={() => setQuery({ ...query, length: lt })}
                        color={
                          lt.title === query.length.title
                            ? 'primary'
                            : 'outline-primary'
                        }
                      />
                    ))}
                  </div>
                </CardBody>
              </Card>
              <ButtonIcon
                color="primary"
                label="Generate draft"
                classnames="w-100"
                disabled={!query.text}
                onclick={handleGenerateDraft}
              />
            </Col>
            <Col
              md={layout === LAYOUTS.vertical ? 12 : 8}
              className={`overflow-y-hidden ${
                layout === LAYOUTS.vertical ? 'pt-3' : 'pl-0'
              }`}
            >
              {layout === LAYOUTS.horizontal ? (
                <HeadingWithIcon icon="auto_awesome" text="Preview" />
              ) : (
                <div className="d-flex align-items-center justify-content-between">
                  <HeadingWithIcon icon="auto_awesome" text="Preview" />
                  {content && (
                    <div className="d-flex align-items-center gap-1">
                      <ButtonIcon
                        onclick={handleGenerateDraft}
                        icon={'refresh'}
                        label="Regenerate"
                        color="primary"
                        disabled={!query.text}
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
                        onclick={() => {
                          resetWriteForm();
                          history.replace({ search: '' });
                        }}
                        classnames="btn-xs"
                      />
                    </div>
                  )}
                </div>
              )}

              <Card className="rpt-bg-light-gray mt-2 h-100">
                <CardBody className="p-3 position-relative text-left">
                  {loader ? (
                    <FunnyLoaderBlinker />
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
                        <p className="text-muted font-size-sm2 text-left">
                          Your AI generated content will be shown here
                        </p>
                      )}
                    </>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </CardBody>
      </Card>
      {content && layout === LAYOUTS.horizontal && (
        <div
          className="position-absolute top-0 d-flex align-items-center gap-2 m-2"
          style={{ right: 14 }}
        >
          <ButtonIcon
            onclick={handleGenerateDraft}
            icon={'refresh'}
            label="Regenerate Response"
            color="primary"
            disabled={!query.text}
            classnames="btn-sm"
          />
          <ButtonIcon
            color="outline-primary"
            label="Copy"
            icon="content_copy"
            onclick={handleCopyResponse}
            classnames="btn-sm"
          />
          <ButtonIcon
            color="outline-danger"
            label="Clear"
            icon="cancel"
            onclick={() => {
              resetWriteForm();
              history.replace({ search: '' });
            }}
            classnames="btn-sm"
          />
        </div>
      )}
    </div>
  );
};
export default Write;
