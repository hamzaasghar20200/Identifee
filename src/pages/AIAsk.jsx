import AlertWrapper from '../components/Alert/AlertWrapper';
import Alert from '../components/Alert/Alert';
import { Card, CardBody, CardHeader, Col, FormGroup, Row } from 'reactstrap';
import ButtonIcon from '../components/commons/ButtonIcon';
import MaterialIcon from '../components/commons/MaterialIcon';
import FunnyLoaderBlinker from '../components/commons/FunnyLoaderBlinker';
import TypeWriter from '../components/commons/TypeWriter';
import React, { useContext, useEffect, useState } from 'react';
import { AlertMessageContext } from '../contexts/AlertMessageContext';
import { useHistory } from 'react-router-dom';
import { scrollToTop } from '../utils/Utils';
import AIReferences from '../components/commons/AIReferences';
import AnthropicService from '../services/anthropic.service';

const LAYOUTS = {
  horizontal: 'horizontal',
  vertical: 'vertical',
};
const PromptOptions = [
  {
    key: 'Explain',
    name: 'Explain',
    prompt: 'Explain the following content:',
  },
  {
    key: 'Grammar',
    name: 'Grammar',
    prompt: 'Correct this to standard English:',
  },
  {
    key: 'Rewrite',
    name: 'Rewrite',
    prompt: 'Rewrite the following content:',
  },
  {
    key: 'Summarize',
    name: 'Summarize',
    prompt: 'Summarize this for a second-grade student:',
  },
  { key: 'Q&A', name: 'Q&A', prompt: 'Answer this question:' },
];
const HeadingWithIcon = ({ text, icon }) => {
  return (
    <div className="d-flex align-items-center gap-1">
      <MaterialIcon icon={icon} symbols />
      <h5 className="mb-0">{text}</h5>
    </div>
  );
};

const AIAsk = ({ layout = LAYOUTS.horizontal, activeTab }) => {
  const { successMessage, setSuccessMessage, errorMessage, setErrorMessage } =
    useContext(AlertMessageContext);

  const [query, setQuery] = useState({
    text: '',
    prompt: PromptOptions[0].prompt,
  });
  const [references, setReferences] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(PromptOptions[0]);
  const [loader, setLoader] = useState(false);
  const [content, setContent] = useState('');
  const history = useHistory();

  const callAI = async (newQuery) => {
    setLoader(true);
    setContent('');
    if (layout === LAYOUTS.horizontal) {
      scrollToTop();
    }
    try {
      const queryAI = newQuery || `${query?.prompt} "${query.text}".`;
      // call Anthropic AI
      const response = await AnthropicService.createCompletion(
        {
          prompt: queryAI,
          max_tokens_to_sample: 2000,
        },
        'claude-2'
      );
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
      ...query,
      text: '',
    });
    setContent('');
    setLoader(false);
    setReferences([]);
  };

  useEffect(() => {
    resetWriteForm();
  }, [activeTab]);

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
              <Card className="p-0">
                <CardHeader className="border-0 px-3 pb-1">
                  <HeadingWithIcon icon="chat_add_on" text="Ask" />{' '}
                </CardHeader>
                <CardBody className="px-3 pb-3 pt-2">
                  <div className="d-flex align-items-center flex-wrap gap-2">
                    {PromptOptions.map((lt) => (
                      <ButtonIcon
                        key={lt.key}
                        label={lt.name}
                        classnames="btn-sm px-3"
                        onClick={() => {
                          setSelectedPrompt(lt);
                          setQuery({ ...query, prompt: lt.prompt });
                        }}
                        color={
                          lt.key === selectedPrompt?.key
                            ? 'primary'
                            : 'outline-primary'
                        }
                      />
                    ))}
                  </div>
                </CardBody>
              </Card>

              <div className="my-3">
                <input
                  className="form-control rpt-bg-light-gray"
                  value={query?.prompt}
                  onChange={(e) =>
                    setQuery({ ...query, prompt: e.target.value })
                  }
                />
              </div>
              <FormGroup className="my-2">
                <textarea
                  className="form-control"
                  rows="13"
                  value={query.text}
                  placeholder="Paste or enter input content here"
                  onChange={(e) => setQuery({ ...query, text: e.target.value })}
                ></textarea>
              </FormGroup>
              <ButtonIcon
                color="primary"
                label="Generate"
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
                        <TypeWriter text={content} speed={30} />
                      ) : (
                        <p className="text-muted font-size-sm2 text-left">
                          Your AI generated content will be shown here
                        </p>
                      )}
                      {references.length > 0 && (
                        <AIReferences list={references} />
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
            onclick={resetWriteForm}
            classnames="btn-sm"
          />
        </div>
      )}
    </div>
  );
};

export default AIAsk;
