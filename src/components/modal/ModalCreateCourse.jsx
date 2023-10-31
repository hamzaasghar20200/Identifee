import React, { useState, useContext, useEffect } from 'react';
import {
  Form,
  FormGroup,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';

import stringConstants from '../../utils/stringConstants.json';
import ButtonIcon from '../commons/ButtonIcon';
import { useForm } from 'react-hook-form';
import InputValidation from '../commons/InputValidation';
import Asterick from '../commons/Asterick';
import { CategoriesContext } from '../../contexts/categoriesContext';
import courseService from '../../services/course.service';
import {
  CATEGORY_REQUIRED,
  DRAFT,
  SEARCH_FOR_CATEGORY,
} from '../../utils/constants';
import ControllerValidation from '../commons/ControllerValidation';
import AutoComplete from '../AutoComplete';
import categoryService from '../../services/category.service';

const constants = stringConstants.settings.resources.categories;

const ModalCreateCourse = ({ showModal, setShowModal, onCreate }) => {
  const defaultCourseForm = {
    name: '',
    description: '',
    categoryIds: '',
  };

  const [isLoading, setIsLoading] = useState(false);
  const [courseForm, setCourseForm] = useState({});
  const { setRefresh } = useContext(CategoriesContext);
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    getFieldState,
    formState: { errors },
  } = useForm({
    defaultValues: defaultCourseForm,
  });

  const onHandleCloseModal = () => {
    setCourseForm({});
    reset(defaultCourseForm);
    setShowModal(false);
  };

  const onSubmit = async () => {
    setIsLoading(true);

    const { id } = await courseService.saveCourse({
      ...courseForm,
      status: DRAFT,
      is_learning_path: false,
    });

    onCreate({
      id,
      category: courseForm.category,
      categoryIds: courseForm.categoryIds,
    });
    onHandleCloseModal();
    reset(defaultCourseForm);
    setIsLoading(false);

    // this is updating a categories context so that when any category is updated
    // we also trigger an update to refresh call from api for sidemenu navigation
    setRefresh((prevState) => prevState + 1);
  };

  const handleChange = (e) => {
    const target = e.target;
    setCourseForm((prev) => ({ ...prev, [target.name]: target.value }));
  };

  const getCategories = async () => {
    const options = { order: ['updated_at', 'DESC'] };
    try {
      const response = await categoryService.GetCategories(options, {
        limit: 1000,
      });
      const { data } = response;
      setAllCategories([...data].map((m) => ({ ...m, icon: null })));
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <Modal isOpen={showModal} fade={false}>
      <ModalHeader tag="h2" toggle={onHandleCloseModal} className="pb-2">
        Add Course
      </ModalHeader>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody className="borderline-top">
          <FormGroup>
            <Label for="title">
              Course Name <Asterick />
            </Label>
            <InputValidation
              name="name"
              type="input"
              placeholder="Course Name"
              value={courseForm.name}
              validationConfig={{
                required: true,
                inline: false,
                onChange: handleChange,
              }}
              errors={errors}
              register={register}
            />
          </FormGroup>
          <FormGroup>
            <Label for="description">Description</Label>
            <InputValidation
              name="description"
              type="textarea"
              placeholder="Description"
              value={courseForm.description}
              validationConfig={{
                required: false,
                onChange: handleChange,
                maxLength: {
                  value: 255,
                  message: 'Description cannot exceed 255 characters.',
                },
              }}
              errors={errors}
              register={register}
              classNames="min-h-120"
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="category">
              {stringConstants.settings.resources.courses.selectCategory}{' '}
              <Asterick />{' '}
            </Label>
            <ControllerValidation
              name="categoryIds"
              control={control}
              errors={errors}
              form={courseForm}
              renderer={({ field }) => (
                <AutoComplete
                  {...field}
                  id="categoryIds"
                  placeholder={SEARCH_FOR_CATEGORY}
                  name="categoryIds"
                  data={allCategories}
                  loading={false}
                  onChange={(items, itemToRemove) => {
                    const updatedCategories = [...items].filter(
                      (c) => c.id !== itemToRemove.id
                    );
                    setSelectedCategories(updatedCategories);
                    const ids = updatedCategories?.map((c) => c.id);
                    setValue('categoryIds', !ids.length ? '' : ids.join(','));
                    setCourseForm((prev) => ({
                      ...prev,
                      categoryIds: ids,
                    }));
                  }}
                  customKey="title"
                  isMultiple={true}
                  fieldState={getFieldState('categoryIds')}
                  selected={selectedCategories}
                  onHandleSelect={(item) => {
                    const updatedCategories = [...selectedCategories, item];
                    setSelectedCategories(updatedCategories);
                    const ids = updatedCategories?.map((c) => c.id);
                    setValue('categoryIds', !ids.length ? '' : ids.join(','));
                    setCourseForm((prev) => ({
                      ...prev,
                      categoryIds: ids,
                    }));
                  }}
                />
              )}
              validationConfig={{
                required: { value: true, message: CATEGORY_REQUIRED },
              }}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <button
            type="button"
            className="btn btn-white btn-sm mr-1"
            data-dismiss="modal"
            onClick={onHandleCloseModal}
            disabled={isLoading}
          >
            Cancel
          </button>

          <ButtonIcon
            type="submit"
            loading={isLoading}
            color="primary"
            label={constants.create}
            classnames="btn-sm"
          ></ButtonIcon>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default ModalCreateCourse;
