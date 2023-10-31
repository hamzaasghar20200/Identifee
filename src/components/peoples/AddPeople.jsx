import { useEffect, useState, useReducer } from 'react';
import { useHistory } from 'react-router-dom';

import contactService from '../../services/contact.service';
import { CONTACT_CREATED } from '../../utils/constants';
import PeopleForm from './PeopleForm';
import fieldService from '../../services/field.service';
import { useForm } from 'react-hook-form';
import Loading from '../Loading';
import { initialPeopleForm } from '../../views/Deals/contacts/Contacts.constants';
import {
  onHandleCloseModal,
  reducer,
  removeCustomFieldsFromActivityForm,
} from '../../views/Deals/contacts/utils';
import RightPanelModal from '../modal/RightPanelModal';
import { groupBy } from 'lodash';
import { RIGHT_PANEL_WIDTH } from '../../utils/Utils';
import { useModuleContext } from '../../contexts/moduleContext';
const AddPeople = ({
  children,
  openPeople,
  setOpenPeople,
  successMessage,
  setSuccessMessage,
  errorMessage,
  setErrorMessage,
  allOwners,
  getContacts,
  fromNavbar,
  setOpenList,
  searchValue,
}) => {
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [preOwners, setPreOwners] = useState([]);
  const [peopleFormData, dispatchFormData] = useReducer(
    reducer,
    initialPeopleForm
  );
  const [isFieldsData, setIsFieldsData] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const { moduleMap } = useModuleContext();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getFieldState,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: peopleFormData,
  });
  const groupBySection = (fieldsList) => {
    setIsFieldsData(groupBy(fieldsList, 'section'));
  };
  const getFields = async (item) => {
    setIsLoading(true);
    const { data } = await fieldService.getFields(item, {
      preferred: true,
    });
    if (data.length > 0) {
      groupBySection(data);
      setIsLoading(false);
    } else {
      const { data } = await fieldService.createDefaultFields(item);
      groupBySection(data);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (openPeople === true) {
      getFields('contact');
    }
  }, [openPeople]);

  const toggle = () => {
    setOpenPeople(!openPeople);
    setOpenList(false);
    document.body.classList.add('overflow-auto');
    document.body.classList.remove('overflow-hidden');
    setCustomFields([]);
  };

  const onClose = () => {
    onHandleCloseModal(dispatchFormData, toggle, 'reset-Form');
    reset(initialPeopleForm);
    document.body.classList.add('overflow-auto');
    setCustomFields([]);
    document.body.classList.remove('overflow-hidden');
  };

  const onHandleSubmit = async () => {
    setLoading(true);
    const updateFields = removeCustomFieldsFromActivityForm(
      peopleFormData,
      customFields
    );
    try {
      const newContact = await contactService
        .createContact(updateFields)
        .catch((err) => console.log(err));

      if (newContact) {
        await Promise.all(
          customFields?.map(async (item) => {
            await new Promise((resolve) => {
              contactService
                .updateCustomField(newContact?.data?.id, item)
                .then(resolve);
            });
          }),
          preOwners?.map(async (item) => {
            await new Promise((resolve) => {
              contactService
                .addOwner(newContact?.data?.id, item.user_id)
                .then(resolve);
            });
          })
        );
        getContacts && getContacts();
        onHandleCloseModal(dispatchFormData, toggle, 'reset-Form');
        reset(initialPeopleForm);
        setPreOwners([]);

        setSuccessMessage(CONTACT_CREATED);

        toggle();

        if (fromNavbar) {
          history.push(`/contacts/${newContact?.data?.id}/profile`);
        }
      }
    } catch (err) {
      setErrorMessage(err);
    } finally {
      setLoading(false);
    }
  };
  const loader = () => {
    if (isLoading) return <Loading />;
  };
  return (
    <>
      {children}
      {openPeople && (
        <RightPanelModal
          showModal={openPeople}
          setShowModal={() => onClose()}
          showOverlay={true}
          containerBgColor={'pb-0'}
          containerWidth={RIGHT_PANEL_WIDTH}
          containerPosition={'position-fixed'}
          headerBgColor="bg-gray-5"
          Title={
            <div className="d-flex py-2 align-items-center">
              <h3 className="mb-0">{`Add ${moduleMap.contact.singular}`}</h3>
            </div>
          }
        >
          {isLoading ? (
            loader()
          ) : (
            <>
              {' '}
              {moduleMap.contact && (
                <PeopleForm
                  moduleMap={moduleMap}
                  dispatch={dispatchFormData}
                  allUsers={allOwners}
                  fields={isFieldsData}
                  handleSubmit={handleSubmit}
                  peopleFormData={peopleFormData}
                  refresh={() => getContacts()}
                  searchValue={searchValue}
                  register={register}
                  loading={loading}
                  setValue={setValue}
                  getFieldState={getFieldState}
                  control={control}
                  errors={errors}
                  customFields={customFields}
                  setCustomFields={setCustomFields}
                  onClose={onClose}
                  onHandleSubmit={onHandleSubmit}
                  isprincipalowner="true"
                  prevalue="true"
                  preowners={preOwners}
                  setPreOwners={setPreOwners}
                />
              )}
            </>
          )}
        </RightPanelModal>
      )}
    </>
  );
};

export default AddPeople;
