import MaterialIcon from '../../commons/MaterialIcon';
import { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  Form,
} from 'reactstrap';
import ButtonIcon from '../../commons/ButtonIcon';
import InputValidation from '../../commons/InputValidation';
import { useForm } from 'react-hook-form';
import SearchesService from '../../../services/searches.service';
import { ProspectTypes } from './constants';
import { usePagesContext } from '../../../contexts/pagesContext';

const Messages = {
  Search: 'Search is saved.',
  SearchError: 'Error in saving search, please check console for details.',
};

const ProspectSaveSearch = ({
  filter,
  type,
  setErrorMessage,
  setSuccessMessage,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '' },
  });

  const customKey = 'name';
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [loader, setLoader] = useState(false);
  const { pageContext, setPageContext } = usePagesContext();

  const toggle = () => {
    reset({ name: '' });
    setDropdownOpen((prevState) => !prevState);
  };

  const inputRef = useRef();
  useEffect(() => {
    if (dropdownOpen) {
      try {
        inputRef.current.focus();
      } catch (e) {}

      setValue(customKey, '');
    }
  }, [dropdownOpen]);

  const handleOnChange = (e) => {
    const { value } = e.target;
    setInputValue(value);
    setValue(customKey, value);
  };

  const onSubmit = async (data) => {
    // save data in api
    setLoader(true);
    try {
      const data = await SearchesService.createSearch({
        type: type === ProspectTypes.company ? 'organization' : type,
        name: inputValue,
        value: JSON.stringify(filter),
      });
      toggle();
      setSuccessMessage(Messages.Search);
      setPageContext({ ...pageContext, ProspectSearch: data });
    } catch (e) {
      console.log(e);
      setErrorMessage(Messages.SearchError);
    } finally {
      setLoader(false);
    }
  };

  const handleEnter = async (e) => {
    if (e.code === 'Enter') {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  return (
    <>
      <Dropdown isOpen={dropdownOpen} toggle={toggle} direction="down">
        <div className="hs-unfold">
          <DropdownToggle
            className="bg-transparent border-0 p-0"
            data-toggle="dropdown"
            aria-expanded={dropdownOpen}
          >
            <a className="hoverLink cursor-pointer">
              {' '}
              <MaterialIcon icon="save" />
              Save this search{' '}
            </a>
          </DropdownToggle>
          <DropdownMenu className="py-0" right>
            <Form className="w-100" onSubmit={handleSubmit(onSubmit)}>
              <Card className="w-260">
                <CardHeader className="px-3 py-2 my-1" tag="h5">
                  Save Your Search
                </CardHeader>
                <CardBody className="p-3">
                  <InputValidation
                    name="name"
                    type="input"
                    autoFocus
                    ref={inputRef}
                    inputRef={inputRef}
                    placeholder="Enter search name..."
                    value={inputValue}
                    onKeyDown={(e) => handleEnter(e)}
                    classNames="fs-7 mb-0 flex-grow-1 font-weight-medium"
                    validationConfig={{
                      required: 'Search name is required.',
                      inline: false,
                      onChange: handleOnChange,
                    }}
                    errors={errors}
                    register={register}
                  />
                </CardBody>
                <CardFooter className="px-3 py-2 text-right">
                  <ButtonIcon
                    label="Save"
                    color="primary"
                    type="submit"
                    classnames="btn-xs mr-1"
                    loading={loader}
                  />
                  <ButtonIcon
                    label="Cancel"
                    color="white"
                    onclick={toggle}
                    classnames="btn-xs"
                  />
                </CardFooter>
              </Card>
            </Form>
          </DropdownMenu>
        </div>
      </Dropdown>
    </>
  );
};

export default ProspectSaveSearch;
