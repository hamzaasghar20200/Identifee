import { VALID_FILES_EXTENSIONS } from '../../../utils/constants';
import MaterialIcon from '../../commons/MaterialIcon';

const IdfNoteUploadFiles = ({ setErrorMessage, setFileInput }) => {
  const onFileChange = (event) => {
    if (VALID_FILES_EXTENSIONS.includes(event?.target?.files[0]?.type)) {
      const files = [...event.target.files];
      return setFileInput((prevData) => prevData.concat(files));
    } else {
      setErrorMessage('Invalid extension please upload image');
    }
  };

  return (
    <div className="position-relative">
      <>
        <h5 className="mb-0 font-sm add-title">
          <MaterialIcon
            icon="attachment
"
          />{' '}
          Attach File
        </h5>
        <input
          className="file-input-drag"
          type="file"
          name="file"
          multiple
          onChange={onFileChange}
          id="file"
        />
      </>
    </div>
  );
};

export default IdfNoteUploadFiles;
