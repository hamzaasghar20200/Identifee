import React, { useEffect } from 'react';
import RightPanelModal from '../modal/RightPanelModal';
import { renderComponent } from '../peoples/constantsPeople';
import IdfFormInputCurrency from '../idfComponents/idfFormInput/IdfFormInputCurrency';
import Loading from '../Loading';
import { useForm } from 'react-hook-form';
import { Form, ModalFooter } from 'react-bootstrap';
import ButtonIcon from '../commons/ButtonIcon';
import { CardBody, Col, FormGroup, Label } from 'reactstrap';
import { CheckboxInput } from '../layouts/CardLayout';
import ControllerValidation from '../commons/ControllerValidation';
import { RIGHT_PANEL_WIDTH } from '../../utils/Utils';
const ProductCreateModal = ({
  show,
  onHandleClose,
  product,
  setProduct,
  onHandleSubmit,
  fields = {},
  setLoading,
  isLoading,
  setIsLoading,
  loading,
  onHandleUpdate,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    getFieldState,
    formState: { errors },
  } = useForm({
    defaultValues: product,
  });
  const handleSubmitted = () => {
    setIsLoading(true);
    onHandleSubmit();
    reset(product);
    setIsLoading(false);
  };
  const onHandleChange = (e) => {
    const { value, name } = e.target;
    setProduct({ ...product, [name]: value });
    setValue(name, value);
  };
  const loader = () => {
    if (loading) return <Loading />;
  };
  const ResetForm = () => {
    onHandleClose();
    reset(product);
  };
  useEffect(() => {
    const groups = Object.keys(fields);
    if (groups.length) {
      for (const grp of groups) {
        const field = fields[grp];
        field.forEach((item) => {
          const { columnName, key } = item;
          const fieldName = columnName
            ? columnName.toLowerCase()
            : key?.toLowerCase().replace(/\s+/g, '');
          setValue(fieldName, product[fieldName]);
        });
      }
    }
  }, [fields]);
  return (
    <>
      {show && (
        <RightPanelModal
          showModal={show}
          setShowModal={() => ResetForm()}
          showOverlay={true}
          containerBgColor={'pb-0'}
          containerWidth={RIGHT_PANEL_WIDTH}
          containerPosition={'position-fixed'}
          headerBgColor="bg-gray-5"
          Title={
            <div className="d-flex py-2 align-items-center">
              <h3 className="mb-0">
                {product?.id ? 'Edit Product' : 'Add New Product'}
              </h3>
            </div>
          }
        >
          {loading ? (
            loader()
          ) : (
            <CardBody className="right-bar-vh h-100 overflow-y-auto">
              <Form
                onSubmit={handleSubmit(
                  product?.id ? onHandleUpdate : handleSubmitted
                )}
              >
                <div>
                  {Object.keys(fields).map((key) => {
                    return (
                      <>
                        <h5 className="pb-0">{key}</h5>
                        {fields[key]?.map((item) => {
                          const fieldName =
                            item?.columnName ||
                            item?.key?.toLowerCase().replace(/\s+/g, '');
                          return (
                            <>
                              {
                                <div key={item?.id}>
                                  {item?.key !== 'Price' &&
                                    item?.field_type !== 'CHECKBOX' &&
                                    renderComponent(item?.field_type, {
                                      label: item?.key,
                                      value: product,
                                      name: fieldName,
                                      className: 'text-capitalize',
                                      inputClass: item?.mandatory
                                        ? 'border-left-4 border-left-danger'
                                        : '',
                                      placeholder: item?.key,
                                      validationConfig: {
                                        required: item?.mandatory,
                                        inline: false,
                                        onChange: onHandleChange,
                                      },
                                      errors,
                                      register,
                                      errorDisplay: 'mb-0',
                                      fieldType: item?.field_type,
                                      type:
                                        item?.field_type === 'TEXT'
                                          ? 'textarea'
                                          : 'input',
                                    })}
                                  {item?.field_type === 'CHECKBOX' && (
                                    <FormGroup
                                      row
                                      className="align-items-center"
                                    >
                                      <Label
                                        md={3}
                                        className="text-right font-size-sm"
                                      ></Label>
                                      <Col md={9} className="pl-0">
                                        <ControllerValidation
                                          name={fieldName}
                                          errors={errors}
                                          form={product}
                                          errorDisplay="mb-0"
                                          control={control}
                                          validationConfig={{
                                            required: item?.mandatory
                                              ? `${item?.key} is required.`
                                              : '',
                                          }}
                                          renderer={({ field }) => (
                                            <CheckboxInput
                                              label={item?.key}
                                              id={fieldName}
                                              name={fieldName}
                                              onChange={onHandleChange}
                                              validationConfig={{
                                                required: item?.mandatory
                                                  ? `${item?.key} is required.`
                                                  : '',
                                              }}
                                              fieldState={getFieldState(
                                                fieldName
                                              )}
                                              checked={
                                                fieldName ===
                                                  product[fieldName] &&
                                                product[fieldName] === true
                                              }
                                            />
                                          )}
                                        />
                                      </Col>
                                    </FormGroup>
                                  )}
                                  {item?.key === 'Price' && (
                                    <FormGroup
                                      row
                                      className="align-items-center"
                                    >
                                      <Label
                                        md={3}
                                        className="text-right font-size-sm"
                                      >
                                        {item?.key}
                                      </Label>
                                      <Col md={9} className="pl-0">
                                        <IdfFormInputCurrency
                                          onChange={onHandleChange}
                                          name="price"
                                          value={product}
                                          type="text"
                                          max={999999999}
                                          step={0.01}
                                          min={0}
                                          required={item?.mandatory}
                                          placeholder="Product price"
                                        />
                                      </Col>
                                    </FormGroup>
                                  )}
                                </div>
                              }
                            </>
                          );
                        })}
                      </>
                    );
                  })}
                </div>
              </Form>
            </CardBody>
          )}

          <ModalFooter>
            <ButtonIcon
              label="Cancel"
              color="white"
              classnames="btn-white mx-1 btn-sm"
              onclick={() => (show ? ResetForm() : '')}
            />
            <ButtonIcon
              classnames="btn-sm"
              type="button"
              onclick={handleSubmit(
                product?.id ? onHandleUpdate : handleSubmitted
              )}
              label={product?.id ? 'Update' : 'Save'}
              color={`primary`}
              loading={isLoading}
            />
          </ModalFooter>
        </RightPanelModal>
      )}
    </>
  );
};

export default ProductCreateModal;
