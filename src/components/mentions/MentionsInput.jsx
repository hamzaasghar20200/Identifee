import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  EditorState,
  convertToRaw,
  convertFromRaw,
  ContentState,
} from 'draft-js';
import Editor from '@draft-js-plugins/editor';
import createToolbarPlugin from '@draft-js-plugins/static-toolbar';
import createMentionPlugin, {
  defaultSuggestionsFilter,
} from '@draft-js-plugins/mention';
import '@draft-js-plugins/mention/lib/plugin.css';
import mentions from './mentions';
import { CardButton } from '../layouts/CardLayout';
import '@draft-js-plugins/static-toolbar/lib/plugin.css';
import editorStyles from './SimpleMentionEditor.module.css';
import AlertWrapper from '../Alert/AlertWrapper';
import Alert from '../Alert/Alert';
import IdfNoteUploadFiles from '../idfComponents/idfUploadFiles/IdfNoteUploadFiles';
import MaterialIcon from '../commons/MaterialIcon';
import { getFileSize } from '../../utils/Utils';
import { Input } from 'reactstrap';
const FilePreview = ({ file, deleteFile }) => {
  const [fileInfo, setFileInfo] = useState({
    name: '',
    size: '',
  });

  useEffect(() => {
    setFileInfo((prev) => ({
      ...prev,
      name: file.name,
      size: getFileSize(file.size),
    }));
  }, [file]);
  return (
    <div className="js-dropzone dropzone-custom custom-file-boxed dz-clickable dz-started p-0 mt-2">
      <div className="col h-100 px-1 mb-2 dz-processing dz-success dz-complete">
        <div className="dz-preview dz-file-preview border shadow">
          <div
            className="d-flex justify-content-end dz-close-icon position-absolute"
            style={{ top: 5, right: 5 }}
          >
            <a
              href="#"
              onClick={() => deleteFile(file?.size)}
              className="icon-hover-bg btn btn-link"
            >
              <MaterialIcon icon="close" />
            </a>
          </div>
          <div className="dz-details media">
            <span className="dz-file-initials text-capitalize">
              {fileInfo.name[0]}
            </span>
            <div className="media-body dz-file-wrapper">
              <h6 className="dz-filename">
                <span className="dz-title">{fileInfo.name}</span>
              </h6>
              <div className="dz-size">
                <strong>{fileInfo.size}</strong>
              </div>
            </div>
          </div>
          <div className="dz-progress progress mb-1">
            <div className="dz-upload progress-bar bg-success w-100"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
const MentionsInput = ({
  handleSubmit,
  defaultState,
  readOnly,
  placeholder,
  type,
  onHandleCancel,
  commentAttach,
  isLoading,
  submitLabel,
  alignButtons,
  activityId,
  noteTitle,
  setOverlay,
  fileInput = [],
  setFileInput,
  from,
  setNoteTitle,
  feedInfoNotes,
  notes,
  setRichNote,
  richNote,
  fromNavbar,
  fromClientPortal,
}) => {
  const [hasContent, setHasContent] = useState(false);
  const [editorState, setEditorState] = useState();
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mentionsData, setMentionsData] = useState([]);
  const [suggestions, setSuggestions] = useState(mentionsData);
  const [isImgLoading, setIsImgLoading] = useState(false);
  const [title, setTitle] = useState(false);
  useEffect(() => {
    setEditorState(() => {
      if (defaultState) {
        setHasContent(true);
        if (typeof defaultState === 'string') {
          return EditorState.createWithContent(
            ContentState.createFromText(defaultState)
          );
        }
        return EditorState.createWithContent(convertFromRaw(defaultState));
      }
      return EditorState.createEmpty();
    });
  }, [defaultState]);
  const { MentionSuggestions, plugins, Toolbar } = useMemo(() => {
    const mentionPlugin = createMentionPlugin();
    const { MentionSuggestions } = mentionPlugin;
    const staticToolbarPlugin = createToolbarPlugin();
    const { Toolbar } = staticToolbarPlugin;

    const plugins = [mentionPlugin, staticToolbarPlugin];
    return { plugins, MentionSuggestions, Toolbar };
  }, []);

  const onOpenChange = useCallback((_open) => {
    setOpen(_open);
  }, []);
  const handleShowTitle = () => {
    setTitle(true);
  };
  const handleHideTitle = () => {
    setTitle(false);
    setNoteTitle('');
  };
  const handleChange = (e) => {
    setNoteTitle(e.target.value);
    setHasContent(true);
  };
  const onSearchChange = useCallback(
    ({ value }) => {
      setSuggestions(defaultSuggestionsFilter(value, mentionsData));
    },
    [mentionsData]
  );

  useEffect(() => {
    if (from && from === 'activity') {
      if (feedInfoNotes) {
        setEditorState(() =>
          EditorState.createWithContent(
            ContentState.createFromText(feedInfoNotes)
          )
        );
      }
    }
  }, [feedInfoNotes]);
  useEffect(() => {
    if (noteTitle) {
      setTitle(true);
    }
  }, [noteTitle]);
  const onExtractData = async (e) => {
    e.preventDefault();
    const contentState = editorState.getCurrentContent();
    const raw = convertToRaw(contentState);
    await handleSubmit(raw);
    setTitle(false);
    clearState();
  };

  const clearState = () => {
    setEditorState(() => EditorState.createEmpty());
  };

  const getMentions = async () => {
    if (!readOnly) {
      if (!fromClientPortal) {
        setMentionsData(await mentions());
      }
      if (!from || from !== 'activity') {
        setEditorState(EditorState.moveFocusToEnd(editorState));
      }
    }
  };

  const onChange = (e) => {
    const hasText = e.getCurrentContent().hasText();

    if (from) {
      const contentState = e.getCurrentContent();
      const raw = convertToRaw(contentState);

      setRichNote(raw);
    }

    if (!readOnly) {
      setEditorState(e);
    }

    setHasContent(hasText);
  };

  useEffect(() => {
    getMentions();
  }, []);
  useEffect(() => {
    if (fileInput?.length) {
      setHasContent(true);
    }
  }, [fileInput?.length]);
  const deleteFile = (size) => {
    const files = fileInput?.filter((item) => {
      return item?.size !== size;
    });
    setFileInput(files);
  };
  const handleCancel = (e) => {
    handleHideTitle();
    onHandleCancel(e);
  };
  return (
    <div>
      <AlertWrapper>
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
      </AlertWrapper>
      {editorState !== undefined && (
        <div className="editor_setting">
          <div
            className={`${readOnly ? '' : editorStyles[type]} ${
              editorState.getSelection().getHasFocus() ? 'hasFocus' : ''
            }`}
            style={{ backgroundColor: readOnly ? '' : 'white' }}
          >
            {title && (
              <Input
                className="form-control input-title"
                type="text"
                value={noteTitle}
                placeholder="Specify a title"
                onChange={(e) => handleChange(e)}
              />
            )}
            <div
              onClick={() => {
                if (!editorState.getSelection().getHasFocus()) {
                  setEditorState(EditorState.moveFocusToEnd(editorState));
                }
              }}
            >
              <Editor
                placeholder={placeholder}
                editorKey={'editor'}
                editorState={editorState}
                onChange={onChange}
                plugins={plugins}
                readOnly={readOnly}
              />
              <MentionSuggestions
                open={open}
                onOpenChange={onOpenChange}
                suggestions={suggestions}
                onSearchChange={onSearchChange}
              />
            </div>
          </div>
          {!readOnly && (
            <div>
              <Toolbar>
                {(externalProps) => (
                  <div className="d-flex align-items-center">
                    {!from && (
                      <form onSubmit={onExtractData} onReset={clearState}>
                        {!readOnly && (
                          <div
                            className={`d-flex justify-content-center align-items-center`}
                          >
                            <CardButton
                              type="submit"
                              title={submitLabel}
                              className="mx-1 btn-sm"
                              variant="primary"
                              isLoading={isLoading}
                              disabled={!hasContent}
                            />
                            {type === 'editor' && !onHandleCancel && (
                              <CardButton
                                type="button"
                                className="mx-1 btn-sm"
                                title="Cancel"
                                variant="white"
                                onClick={() =>
                                  activityId
                                    ? handleHideTitle()
                                    : setOverlay(false)
                                }
                              />
                            )}
                            {type !== 'editor' && (
                              <CardButton
                                type={onHandleCancel ? 'button' : 'reset'}
                                title="Cancel"
                                className="mx-1 btn-sm"
                                variant="white"
                                onClick={(e) => handleCancel(e)}
                              />
                            )}
                          </div>
                        )}
                      </form>
                    )}
                    {!commentAttach && (
                      <span>
                        <IdfNoteUploadFiles
                          fileInput={fileInput}
                          setFileInput={setFileInput}
                          deleteFile={deleteFile}
                          setIsLoading={setIsImgLoading}
                          loading={isImgLoading}
                          noteImg={true}
                          setErrorMessage={setErrorMessage}
                        />
                      </span>
                    )}

                    <span
                      onClick={() => handleShowTitle()}
                      className="font-sm add-title"
                    >
                      Add Title
                    </span>
                  </div>
                )}
              </Toolbar>
              {fileInput?.length ? (
                <div
                  className="d-flex overflow-x-auto gap-2"
                  style={{ maxWidth: '100%' }}
                >
                  {fileInput?.map((item) => (
                    <FilePreview
                      key={item?.name}
                      file={item}
                      deleteFile={deleteFile}
                    />
                  ))}
                </div>
              ) : (
                ''
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

MentionsInput.defaultProps = {
  mentions: [],
  handleSubmit: () => {},
  defaultState: undefined,
  readOnly: false,
  type: 'editor',
  submitLabel: 'Save',
  alignButtons: 'left',
};

export default MentionsInput;
