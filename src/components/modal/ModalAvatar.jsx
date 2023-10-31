import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  ModalBody,
  Row,
  Col,
  ModalHeader,
  ModalFooter,
} from 'reactstrap';
import Cropper from 'react-cropper';

import 'cropperjs/dist/cropper.css';
import constants from '../../utils/stringConstants.json';
import Avatar from '../Avatar';
import ButtonIcon from '../commons/ButtonIcon';
import CategoryPartnerLogo from '../lesson/CategoryPartnerLogo';
import avatarService from '../../services/avatar.service';

const TYPE_CONTROL = {
  update: 'UPDATE',
  save: 'SAVE',
  change: 'CHANGE',
};

const commons = constants.global.commons;

const ModalAvatar = ({
  open,
  onHandleClose,
  colorButtonCancel = 'primary',
  loading,
  userInfo,
  onSaveAvatar,
  onRemove,
  type = 'organization',
  previewFile,
}) => {
  const [data, setData] = useState(null);
  const [edit, setEdit] = useState(false);
  const [control, setControl] = useState(TYPE_CONTROL.update);
  const [preview, setPreview] = useState(false);

  const ref = useRef(null);
  const [cropper, setCropper] = useState(undefined);
  const [image, setImage] = useState(undefined);
  const typeText = type === 'organization' ? 'company' : type;
  const onHandleChangeFile = () => {
    if (cropper?.getCroppedCanvas()) {
      setEdit(false);
      setControl(TYPE_CONTROL.save);
      const croppedImageUrl = cropper
        .getCroppedCanvas({ maxWidth: 512, maxHeight: 512 })
        .toDataURL();

      const newData = {
        avatarSrc: croppedImageUrl,
        file: {
          src: image.src,
          name: image.name,
        },
      };
      setData((prev) => ({ ...prev, ...newData }));

      if (previewFile) {
        setPreview(croppedImageUrl);
      }

      return newData;
    }
  };

  const onSave = (d) => {
    const newData = d || data;
    onSaveAvatar({ file: newData.file, src: newData.avatarSrc });
  };

  const onHandleCloseModal = () => {
    setEdit(false);
    setData((prev) => ({ ...prev, avatarSrc: null }));
    setImage('');
    setControl(userInfo.avatar ? TYPE_CONTROL.change : TYPE_CONTROL.update);
    onHandleClose();
  };

  useEffect(() => {
    (async () => {
      setData(userInfo);
      setControl(
        userInfo.avatar || userInfo.avatarSrc
          ? TYPE_CONTROL.change
          : TYPE_CONTROL.update
      );
      if (type === 'Partner' || type === 'Partner Icon') {
        if (previewFile && userInfo.avatarSrc) {
          const logo = await avatarService.getAvatarMemo(userInfo.avatarSrc);
          if (logo) {
            setImage(logo);
          }
        }
      }
    })();
  }, [userInfo]);

  const onChange = (e) => {
    e.preventDefault();
    let files;
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = e.target.files;
    }

    if (files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage((prev) => ({
          ...prev,
          url: reader.result,
          name: files[0].name,
          type: files[0].type,
        }));
      };

      reader.readAsDataURL(files[0]);
    }
  };

  const getLogoOrPhotoText = () => {
    return type === 'organization' ? 'logo' : 'photo';
  };

  return (
    <Modal
      isOpen={open}
      toggle={onHandleCloseModal}
      fade={false}
      className="modal-avatar-upload"
    >
      <ModalHeader
        tag="h3"
        toggle={onHandleCloseModal}
        className="p-3 text-capitalize"
      >
        {typeText} {getLogoOrPhotoText()}
      </ModalHeader>
      <ModalBody className="mt-0 pt-0 border-top mb-0 p-3">
        <input
          type="file"
          accept="image/png, image/gif, image/jpeg, image/jpg"
          onChange={onChange}
          style={{ display: 'none' }}
          ref={ref}
        />
        <Row>
          {!edit && (
            <Col xs={12} className={` text-center mt-6 my-4`}>
              {type === 'Partner' || type === 'Partner Icon' ? (
                <>
                  {previewFile && preview ? (
                    <img
                      src={preview}
                      style={{ objectFit: 'contain', width: 210 }}
                    />
                  ) : (
                    <CategoryPartnerLogo
                      categoryInfo={{ logo: userInfo?.avatarSrc }}
                      imageStyle="avatar-size-modal"
                      preview={true}
                    />
                  )}
                </>
              ) : (
                <Avatar
                  classModifiers="avatar-size-modal"
                  user={data}
                  type={type === 'organization' ? 'company' : 'contact'}
                  sizeIcon="size-icon-avatar"
                />
              )}
            </Col>
          )}
          {edit && (
            <Col xs={12} className={`d-flex justify-content-center mt-4 mb-2`}>
              <Row className="w-100" noGutters>
                <Col xs={12}>
                  <Cropper
                    style={{
                      height: 300,
                      width: '100%',
                      border: '1px solid #eee',
                      borderRadius: 'var(--borderRadius)',
                    }}
                    zoomTo={1}
                    initialAspectRatio={1}
                    preview=".img-preview"
                    src={image?.url}
                    viewMode={1}
                    minCropBoxHeight={10}
                    minCropBoxWidth={10}
                    background={false}
                    responsive
                    autoCropArea={1}
                    checkOrientation={false}
                    onInitialized={(instance) => {
                      setCropper(instance);
                    }}
                    guides={true}
                  />
                </Col>
              </Row>
            </Col>
          )}
        </Row>
      </ModalBody>
      <ModalFooter className="px-3 justify-content-center">
        {edit && (
          <>
            <ButtonIcon
              onclick={() => ref.current.click()}
              label={`Select ${typeText} ${getLogoOrPhotoText()}`}
              color={'outline-primary'}
              classnames="btn-sm"
            />
            <ButtonIcon
              onclick={() => {
                const d = onHandleChangeFile();
                onSave(d);
              }}
              label={'Apply'}
              color={'primary'}
              classnames="btn-sm ml-2"
              disabled={!image}
            />
          </>
        )}

        {control === TYPE_CONTROL.update && !edit && !image && (
          <ButtonIcon
            onclick={() => {
              ref.current.click();
              setEdit(true);
            }}
            label={
              edit ? commons.save : `Upload ${typeText} ${getLogoOrPhotoText()}`
            }
            color={colorButtonCancel}
            classnames="btn-sm"
            disabled={loading}
          />
        )}

        {control === TYPE_CONTROL.save && (
          <ButtonIcon
            onclick={onSave}
            label={`Save ${typeText} ${getLogoOrPhotoText()}`}
            color={colorButtonCancel}
            classnames="btn-sm"
            loading={loading}
            disabled={loading}
          />
        )}

        {control === TYPE_CONTROL.change && edit === false && (
          <div className="w-100 d-flex justify-content-center">
            <ButtonIcon
              onclick={onRemove}
              label={commons.remove}
              icon="delete"
              color="outline-danger"
              classnames="btn-sm w-49"
              loading={loading}
              disabled={loading}
            />
            <ButtonIcon
              onclick={() => {
                ref.current.click();
                setEdit(true);
              }}
              label={commons.change}
              color={colorButtonCancel}
              classnames="btn-sm ml-1 w-49"
            />
          </div>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default ModalAvatar;
