import { Form } from 'react-bootstrap';
import React, { useState } from 'react';
import MaterialIcon from '../../commons/MaterialIcon';
import ButtonIcon from '../../commons/ButtonIcon';
import IconDropdownSearch from '../../commons/IconDropdownSearch';
import { icons } from '../../manageLessons/ManageLessonsConstants';
import SimpleModalCreation from '../../modal/SimpleModalCreation';
import InsightsService from '../../../services/insights.service';
import { overflowing, scrollToBottomContainer } from '../../../utils/Utils';
import {
  ComponentSourceTypes,
  ComponentTextTypes,
} from '../constants/reportBuilderConstants';

const NewCustomInsightBlockModal = ({
  show,
  setShow,
  handleBack,
  blocks,
  setBlocks,
  currentBlock,
  currentInsight,
  setErrorMessage,
  setSuccessMessage,
}) => {
  const [customBlock, setCustomBlock] = useState({
    icon: 'info',
    direction: 'flex-row-reverse',
    text: '',
    type: ComponentTextTypes.IconText,
    source: ComponentSourceTypes.Custom,
  });
  const [loader, setLoader] = useState(false);

  const handleSwapPosition = () => {
    setCustomBlock({
      ...customBlock,
      direction: customBlock.direction === '' ? 'flex-row-reverse' : '',
    });
  };

  const handleIconSelect = (item) => {
    setCustomBlock({
      ...customBlock,
      icon: item.name,
    });
  };

  const handleSaveBlock = async () => {
    const newCustomBlock = {
      id: 'addNew',
      direction: customBlock.direction,
      iconConfig: { icon: customBlock.icon, color: 'text-black' },
      description: [customBlock.text],
      data: {
        text: customBlock.iconLabel,
      },
      text: customBlock.text,
      type: 'IconText',
      partnerLogo: {},
    };

    const createComponent = {
      componentText: {
        ...customBlock,
        position:
          customBlock.direction === 'flex-row-reverse' ? 'left' : 'right',
      },
      component: { name: '', enabled: true },
    };

    delete createComponent.componentText.direction;
    try {
      setLoader(true);
      const response = await InsightsService.createInsightComponent(
        currentInsight.id,
        createComponent
      );
      setBlocks([
        ...blocks,
        {
          ...newCustomBlock,
          id: response.id,
          componentTextId: response.componentTextId,
        },
      ]);
      setCustomBlock({
        icon: 'info',
        direction: 'flex-row-reverse',
        text: '',
      });
      overflowing();
      setShow(false);
      setSuccessMessage('Custom block is added.');
      try {
        scrollToBottomContainer(
          document.getElementById('customReportContainer')
        );
      } catch (e) {}
    } catch (e) {
      console.log(e);
      setErrorMessage(
        'Error creating custom block. Please check console for details.'
      );
    } finally {
      setLoader(false);
    }
  };

  return (
    <SimpleModalCreation
      modalTitle="Add Custom Block"
      open={show}
      saveButton="Add to Report"
      handleSubmit={handleSaveBlock}
      isLoading={loader}
      onHandleCloseModal={() => {
        overflowing();
        setShow(false);
      }}
      onClick={() => document.dispatchEvent(new MouseEvent('click'))}
      size={'lg'}
    >
      <div className="border-bottom pb-3">
        <a onClick={handleBack} className="cursor-pointer">
          {' '}
          <MaterialIcon icon="arrow_back" />{' '}
          <span className="font-size-sm2">Back to all </span>
        </a>
      </div>
      <h4 className="text-black pt-3 pb-1 font-weight-semi-bold">
        Custom Block
      </h4>
      <div className="border rounded p-3 mb-4 pb-5">
        <div className={`row position-relative ${customBlock.direction}`}>
          <div className={'col-md-10'}>
            <Form.Control
              as="textarea"
              rows={3}
              value={customBlock.text || ''}
              onChange={(e) =>
                setCustomBlock({
                  ...customBlock,
                  text: e.target.value,
                })
              }
              placeholder={'Add description text to the block'}
            />
          </div>
          <div
            className={`col-md-2 ${customBlock.direction ? 'pr-0' : 'pl-0'}`}
          >
            <div className="border d-flex position-relative justify-content-center align-items-center bg-gray-200 h-75 text-center rounded">
              <MaterialIcon icon={customBlock.icon} clazz="font-size-4em" />
              <IconDropdownSearch options={icons} onSelect={handleIconSelect}>
                <a className="cursor-pointer position-absolute bottom-0 right-0">
                  <MaterialIcon icon="unfold_more" clazz="text-black" />{' '}
                </a>
              </IconDropdownSearch>
            </div>

            <Form.Control
              as="input"
              value={customBlock.iconLabel || ''}
              onChange={(e) =>
                setCustomBlock({
                  ...customBlock,
                  iconLabel: e.target.value,
                })
              }
              className="mt-2"
              placeholder={'Text'}
            />
          </div>
          <div
            className="position-absolute abs-center"
            style={{
              bottom: '-50px',
            }}
          >
            <ButtonIcon
              label="Invert block position"
              icon="swap_horiz"
              color="white"
              classnames="btn-sm shadow"
              onclick={handleSwapPosition}
            />
          </div>
        </div>
      </div>
    </SimpleModalCreation>
  );
};

export default NewCustomInsightBlockModal;
