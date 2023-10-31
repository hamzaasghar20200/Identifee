import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  FormGroup,
  Label,
  Row,
  Spinner,
} from 'reactstrap';
import SimpleModal from '../modal/SimpleModal';
import stringConstants from '../../utils/stringConstants.json';
import { createBlobObject, overflowing } from '../../utils/Utils';
import { FormCheck } from 'react-bootstrap';
import FormColor from '../siteSettings/FormColor';
import IdfTooltip from '../idfComponents/idfTooltip';
import IdfIcon from '../idfComponents/idfIcon';
import { BRANDING_LABEL, CHOOSE_IMAGE_FILE } from '../../utils/constants';
import DragDropUploadFile from '../commons/DragDropUploadFile';
import userService from '../../services/user.service';
import InputValidation from '../commons/InputValidation';
import Asterick from '../commons/Asterick';
import { useForm } from 'react-hook-form';
import ModulesToggles from '../TenantCheckBox';
import MaterialIcon from '../commons/MaterialIcon';

const ExpandCollapseCard = ({ label, heading, children }) => {
  const [isExpand, setIsExpand] = useState(false);
  return (
    <Card className="w-100 my-3">
      <CardHeader
        className={`bg-hover-gray p-3 cursor-pointer`}
        onClick={() => setIsExpand(!isExpand)}
      >
        <div className="d-flex w-100 align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-1">
            <Asterick />
            <h5 className="mb-0">{heading}</h5>
            <span className="text-muted fs-7">({label})</span>
          </div>
          <MaterialIcon icon={isExpand ? 'expand_less' : 'expand_more'} />
        </div>
      </CardHeader>
      {isExpand && <CardBody className="p-3">{children}</CardBody>}
    </Card>
  );
};
const CreateTenantModal = ({
  setErrorMessage,
  showLoading,
  showModal,
  setSelectedEditData,
  setShowModal,
  isLoading,
  handleUpdateTenant,
  data = [],
  selectedEditData,
  handleCreateTenant,
}) => {
  const defaultOptions = {
    owner: {
      email: '',
    },
    name: '',
    domain: '',
    description: '',
    use_logo: false,
    modules: [],
    logo: '',
    icon: '',
    type: 'owner',
    colors: {
      secondaryColor: '',
    },
  };
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: defaultOptions,
  });
  const constants = stringConstants.tenants;
  const [logo, setLogo] = useState();
  const [icon, setIcon] = useState();
  const [tenantForm, setTenantForm] = useState(defaultOptions);
  const [iconId, setIconId] = useState();
  const [logoId, setLogoId] = useState();
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [iconLoading, setIconLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);

  const onLoadIcon = async (event) => {
    setIconLoading(true);
    const target = event.target.files[0];
    setIcon(target);
    let iconId = target?.id || '';
    if (target && target?.lastModified) {
      iconId = await onUploadLogo(target);
    }
    setIconId(iconId);
    setIconLoading(false);
  };
  useEffect(() => {
    setTenantForm({
      name: selectedEditData.name,
      description: selectedEditData.description,
      modules: selectedEditData.modules?.split(',') || [],
      domain: selectedEditData.domain,
      use_logo: selectedEditData.use_logo,
      icon: selectedEditData.icon,
      logo: selectedEditData.logo,
      colors: selectedEditData.colors,
    });
    setValue('name', selectedEditData.name);
    setValue('domain', selectedEditData.domain);
  }, [selectedEditData]);
  const handleImageState = () => {
    setLogo();
    setIcon();
  };
  const onLoadLogo = async (event) => {
    setLogoLoading(true);
    const target = event.target.files[0];
    setLogo(target);
    let logoId = target?.id || '';
    if (target && target?.lastModified) {
      logoId = await onUploadLogo(target);
    }
    setLogoId(logoId);
    setLogoLoading(false);
  };
  const onChangeColor = (value) => {
    const colorValue = {
      primaryColor: value?.secondaryColor,
      ...value,
      name: 'custom',
    };
    const colorAdd = {
      ...tenantForm,
      colors: colorValue,
    };
    setTenantForm(colorAdd);
  };
  const onUploadLogo = async (file) => {
    const form = new FormData();
    form.append('file', await createBlobObject(file), file.name);
    form.append('isPublic', true);
    const {
      data: {
        data: { id },
      },
    } = await userService.uploadAvatar(form);
    return id;
  };
  const handleChange = (e) => {
    const target = e.target;
    if (target.name !== 'email') {
      const tenantData = {
        ...tenantForm,
        [target.name]: target.value,
      };
      setTenantForm(tenantData);
    } else {
      const tenantData = {
        ...tenantForm,
        owner: {
          ...tenantForm?.owner,
          email: target.value,
        },
      };
      setTenantForm(tenantData);
    }
  };
  const getLogo = async (id) => {
    const response = await userService.getFile(id);
    return response?.data;
  };
  const getTenantImage = async () => {
    try {
      if (selectedEditData.logo) {
        const partnerLogo = await getLogo(selectedEditData.logo);

        if (partnerLogo) {
          setLogo({
            ...partnerLogo,
            name: partnerLogo.filename_download,
            size: partnerLogo.filesize,
          });
        }
      }

      if (selectedEditData.icon) {
        const partnerIcon = await getLogo(selectedEditData.icon);

        if (partnerIcon) {
          setIcon({
            ...partnerIcon,
            name: partnerIcon.filename_download,
            size: partnerIcon.filesize,
          });
        }
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };
  useEffect(() => {
    getTenantImage();
  }, [selectedEditData]);

  const handleAccessChange = (e) => {
    const target = e.target;
    if (target.name === 'use_logo' && target.checked) {
      const tenantData = {
        ...tenantForm,
        use_logo: true,
      };
      setTenantForm(tenantData);
    } else {
      const tenantData = {
        ...tenantForm,
        use_logo: false,
      };
      setTenantForm(tenantData);
    }
  };

  const handleFormSubmit = async () => {
    const tenantData = {
      ...tenantForm,
      type: 'owner',
      icon: iconId,
      modules: selectedCheckboxes,
      logo: logoId,
    };
    if (selectedEditData.id) {
      const update = await handleUpdateTenant(tenantData);
      if (update) {
        setTenantForm({});
        reset(defaultOptions);
        handleImageState();
      }
    } else {
      const create = await handleCreateTenant(tenantData);
      if (create) {
        setTenantForm({});
        reset(defaultOptions);
        handleImageState();
      } else {
        return overflowing();
      }
    }

    overflowing();
    closeModal();

    if (!errors) {
      setTenantForm({});
    }
  };
  const closeModal = () => {
    overflowing();
    setShowModal(false);
    setSelectedEditData('');
    setTenantForm({
      name: '',
      domain: '',
      description: '',
      use_logo: false,
      modules: [],
      logo: '',
      icon: '',
      type: '',
      colors: '',
      email: '',
    });
    reset(defaultOptions);
    handleImageState();
  };
  return (
    <SimpleModal
      modalTitle={
        selectedEditData?.id ? (
          <span>
            {constants.edit.title}{' '}
            <span className="text-muted">
              ({selectedEditData?.title || selectedEditData?.name})
            </span>
          </span>
        ) : (
          constants.create.addTenantModalTitle
        )
      }
      onHandleCloseModal={() => closeModal()}
      open={showModal}
      modalBodyClass="pipeline-board-edit-form overflow-y-auto"
      buttonLabel={
        selectedEditData?.id
          ? constants.edit.btnEditTenant
          : constants.create.btnAddTenant
      }
      buttonsDisabled={!tenantForm?.name}
      handleSubmit={handleSubmit(handleFormSubmit)}
      allowCloseOutside={false}
      isLoading={showLoading}
      customModal="modal-dialog-custom"
    >
      <span className="font-size-sm">{constants.create.textGroupName}</span>
      <>
        <Row>
          <Col>
            <FormGroup>
              <Label htmlFor="" className="mt-0 col-form-label">
                <h5 className="mb-0">
                  <Asterick /> Name
                </h5>
              </Label>
              <InputValidation
                name="name"
                type="input"
                placeholder="Enter Name"
                value={tenantForm?.name}
                validationConfig={{
                  required: true,
                  inline: false,
                  onChange: handleChange,
                }}
                errors={errors}
                register={register}
                errorDisplay="mb-0"
              />
            </FormGroup>
          </Col>
          <Col className="pl-0">
            <FormGroup>
              <Label htmlFor="" className="col-form-label">
                <h5 className="mb-0">
                  <Asterick /> Domain
                </h5>
              </Label>
              <InputValidation
                name="domain"
                type="input"
                placeholder="Enter Domain"
                value={tenantForm?.domain}
                validationConfig={{
                  required: true,
                  inline: false,
                  onChange: handleChange,
                }}
                errors={errors}
                register={register}
                errorDisplay="mb-0"
              />
            </FormGroup>
          </Col>
        </Row>
        <FormGroup>
          <Label htmlFor="" className="col-form-label">
            <h5 className="mb-0">Description</h5>
          </Label>
          <InputValidation
            name="description"
            type="textarea"
            placeholder="Enter Description"
            value={tenantForm?.description}
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
        {!selectedEditData && (
          <FormGroup>
            <Label htmlFor="" className="col-form-label">
              <h5 className="mb-0">
                <Asterick /> Owner Email
              </h5>
            </Label>
            <InputValidation
              name="email"
              type="input"
              placeholder="Enter Owner Email Address"
              value={tenantForm.email}
              validationConfig={{
                required: true,
                inline: false,
                onChange: handleChange,
              }}
              errors={errors}
              register={register}
              errorDisplay="mb-0"
            />
          </FormGroup>
        )}
        <ExpandCollapseCard
          label="Select which modules to turn on for the tenant."
          heading="Modules"
        >
          <ModulesToggles
            modulesData={selectedEditData}
            selectedCheckboxes={selectedCheckboxes}
            setSelectedCheckboxes={setSelectedCheckboxes}
          />
        </ExpandCollapseCard>
        <ExpandCollapseCard
          label="Update tenant's branding, logos, colors etc."
          heading={BRANDING_LABEL}
        >
          <div className="border-bottom border-gray-300 pb-4">
            <div className="d-flex align-items-center justify-content-between">
              <h5>Icon</h5>
              {iconLoading ? (
                <Spinner />
              ) : (
                <DragDropUploadFile
                  file={icon}
                  setFile={setIcon}
                  onLoadFile={onLoadIcon}
                  preview
                  logoId={iconId || tenantForm?.icon}
                  chooseFileText={CHOOSE_IMAGE_FILE}
                  name="brandingIcon"
                  containerHeight={60}
                  emptyContainerHeight={80}
                  errors={errors}
                  uploadOnDrop={true}
                  showUploadIcon={false}
                  validationConfig={{
                    required: true,
                    inline: false,
                  }}
                />
              )}
            </div>
            <div className="d-flex align-items-center mt-4 justify-content-between">
              <h5>
                <Asterick /> Logo&nbsp;
                <IdfTooltip
                  placement="bottom"
                  text="A partner logo can be 280px wide and 80px tall. Please remove all extra white spaces around the logo before uploading."
                >
                  <IdfIcon icon="help_outline" />
                </IdfTooltip>
              </h5>
              {logoLoading ? (
                <Spinner />
              ) : (
                <DragDropUploadFile
                  file={logo}
                  setFile={setLogo}
                  onLoadFile={onLoadLogo}
                  name="brandingLogo"
                  preview
                  logoId={logoId || tenantForm?.logo}
                  chooseFileText={CHOOSE_IMAGE_FILE}
                  containerHeight={85}
                  emptyContainerHeight={80}
                  uploadOnDrop={true}
                  showUploadIcon={false}
                  errors={errors}
                  validationConfig={{
                    required: true,
                    inline: false,
                  }}
                  register={register}
                  errorDisplay="mb-0"
                />
              )}
            </div>
          </div>
          <div className="d-flex align-items-center mt-4 justify-content-between">
            <h5>
              <Asterick /> Use Logo Instead of Icon
            </h5>
            <FormCheck
              id="useLogoInsteadOfIcon"
              type="switch"
              custom={true}
              name="use_logo"
              value={tenantForm?.use_logo}
              checked={tenantForm?.use_logo}
              onChange={handleAccessChange}
            />
          </div>
          <div className="d-flex align-items-center mt-4 justify-content-between">
            <h5>
              <Asterick /> Accent Color&nbsp;
              <IdfTooltip
                placement="bottom"
                text="An accent color will be applied to all links, buttons."
              >
                <IdfIcon icon="help_outline" />
              </IdfTooltip>
            </h5>
            {tenantForm?.colors?.secondaryColor ? (
              <FormColor
                name="secondaryColor"
                value={tenantForm?.colors?.secondaryColor}
                onChange={onChangeColor}
              />
            ) : (
              <>
                <FormColor
                  name="secondaryColor"
                  value={tenantForm?.colors?.secondaryColor}
                  onChange={onChangeColor}
                />
              </>
            )}
          </div>
        </ExpandCollapseCard>
      </>
    </SimpleModal>
  );
};

export default CreateTenantModal;
