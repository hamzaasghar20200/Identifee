import { ListGroup } from 'react-bootstrap';
import Search from '../../manageUsers/Search';
import ButtonFilterDropdown from '../../commons/ButtonFilterDropdown';
import ButtonIcon from '../../commons/ButtonIcon';
import BlockItem from '../blocks/BlockItem';
import React, { useEffect, useState } from 'react';
import {
  ComponentTextTypes,
  PartnerLogoBySource,
  ReportBlocksType,
} from '../constants/reportBuilderConstants';
import NoDataFound from '../../commons/NoDataFound';
import SimpleModalCreation from '../../modal/SimpleModalCreation';
import { overflowing, scrollToBottomContainer } from '../../../utils/Utils';
import InsightsService from '../../../services/insights.service';
import ReportBlockLoader from '../../loaders/ReportBlock';
import { Spinner } from 'reactstrap';

const InsightBlocksModal = ({
  show,
  setShow,
  handleAddCustomInsight,
  parentBlocks,
  setParentBlocks,
  currentBlock,
  organizationId,
  currentInsight,
  buildInsights,
  setErrorMessage,
  setSuccessMessage,
}) => {
  const [disabledBlocks, setDisabledBlocks] = useState([]);
  const [optionSelected, setOptionSelected] = useState(ReportBlocksType[0]);
  const [search, setSearch] = useState('');
  const [loaderInsights, setLoaderInsights] = useState(false);

  const getInsights = async () => {
    setLoaderInsights(true);
    try {
      const { data } = await InsightsService.getInsightsComponents(
        currentInsight.id,
        false
      );
      setDisabledBlocks(buildInsights(data));
    } catch (e) {
      console.log(e);
    } finally {
      setLoaderInsights(false);
    }
  };

  const handleOptionSelected = (e, option) => {
    setOptionSelected(option);
  };

  const showLoaderByBlock = (block, isAdding) => {
    setDisabledBlocks(
      [...disabledBlocks].map((bl) =>
        bl.id === block.id ? { ...bl, isAdding } : { ...bl }
      )
    );
  };
  const handleAdd = async (block, range, chartData, newDescription) => {
    showLoaderByBlock(block, true);
    try {
      // if its donutSelection then we need to handle it differently and we need to save the selected range value
      // and convert create a new component with just donut so the in report we only render selected one range and the data
      if (block.type === ComponentTextTypes.DonutSelection) {
        const newBlock = {
          component: {
            name: '',
            enabled: true,
          },
          componentText: {
            source: block.source,
            position: block.direction === 'flex-row-reverse' ? 'left' : 'right',
            type: ComponentTextTypes.Donut,
            text: block.text,
            request: {
              ...block.request,
              responseOptionKey: JSON.stringify({
                chartData,
                range,
                newDescription,
              }),
            },
          },
        };
        const blockResponse = await InsightsService.createInsightComponent(
          currentInsight.id,
          newBlock
        );
        const newlyAddedBlock = {
          id: blockResponse.id,
          componentTextId: blockResponse.componentTextId,
          type: ComponentTextTypes.Donut,
          text: block.text,
          source: block.source,
          direction: block.direction,
          iconConfig: {
            icon: block.iconConfig.icon || 'info',
            color: 'text-black',
          },
          partnerLogo: {
            src: PartnerLogoBySource[block.source],
            position: `${block.source}-img`,
          },
          data: {
            text: block.iconLabel || '',
          },
          request: newBlock.componentText.request,
        };
        setParentBlocks([...parentBlocks, newlyAddedBlock]);
        setShow(false);
        overflowing();
        setSuccessMessage('Insight block is added.');
      } else {
        await InsightsService.updateInsightComponent(
          currentInsight.id,
          block.id,
          {
            component: {
              name: '',
              enabled: true,
            },
          }
        );
        setDisabledBlocks(
          [...disabledBlocks].filter((bl) => bl.id !== block.id)
        );
        setParentBlocks([...parentBlocks, block]);
        setShow(false);
        overflowing();
        setSuccessMessage('Insight block is added.');
      }
      try {
        scrollToBottomContainer(
          document.getElementById('customReportContainer')
        );
      } catch (e) {}
    } catch (e) {
      console.log(e);
      setErrorMessage(
        'Error in adding insight block. Please check console for errors.'
      );
    } finally {
      showLoaderByBlock(block, false);
    }
  };

  const filterBlocks = (block) => {
    return search
      ? JSON.stringify(block).toLowerCase().includes(search.toLowerCase())
      : optionSelected
      ? optionSelected.key === 'All'
        ? block
        : block.source === optionSelected.key
      : false;
  };

  useEffect(() => {
    if (show) {
      getInsights();
    }
  }, [show]);

  const handleChangeRange = (block, range) => {
    setDisabledBlocks(
      [...disabledBlocks].map((bl) =>
        bl.id === block.id ? { ...bl, range } : { ...bl }
      )
    );
  };

  return (
    <SimpleModalCreation
      modalTitle="Add New Block"
      open={show}
      onHandleCloseModal={() => {
        overflowing();
        setShow(false);
      }}
      onClick={() => document.dispatchEvent(new MouseEvent('click'))}
      size={'lg'}
    >
      <div className="d-flex align-items-center justify-content-between p-0">
        <div className="search-fixed">
          <Search
            onHandleChange={(e) => setSearch(e.target.value)}
            searchPlaceholder={'Search'}
            classnames="px-0"
          />
        </div>
        <div className="d-flex align-items-center">
          <ButtonFilterDropdown
            filterOptionSelected={optionSelected}
            handleFilterSelect={handleOptionSelected}
            btnToggleStyle={'btn-sm'}
            buttonText="All Blocks"
            options={ReportBlocksType}
          />
          <ButtonIcon
            icon="add"
            color="primary"
            classnames="ml-2 btn-sm"
            label="Add Custom Block"
            onclick={handleAddCustomInsight}
          />
        </div>
      </div>
      <ListGroup className="list-group-no-gutters mt-3 list-group-flush">
        <h4 className="text-black font-weight-semi-bold">All Insights</h4>
        {loaderInsights ? (
          <ReportBlockLoader rows={2} containerStyle={'px-3'} />
        ) : (
          <>
            {disabledBlocks?.filter(filterBlocks).map((block, index) => (
              <div key={block.id} className="position-relative">
                <BlockItem
                  key={block.id}
                  index={index}
                  block={block}
                  blocks={disabledBlocks}
                  editMode={false}
                  setBlocks={setDisabledBlocks}
                  organizationId={organizationId}
                  showRange={block.type === ComponentTextTypes.DonutSelection}
                  isDraggable={false}
                  showAdd={handleAdd}
                  handleChangeRange={handleChangeRange}
                  style="border mb-3 rounded"
                />
                {block.isAdding && (
                  <div
                    className="position-absolute w-100 text-center"
                    style={{
                      top: 0,
                      left: 0,
                      background: 'rgba(0,0,0,0.10)',
                      height: '91%',
                    }}
                  >
                    <div className="d-inline-flex h-100 align-items-center justify-content-center">
                      <Spinner />
                    </div>
                  </div>
                )}
              </div>
            ))}
            {!disabledBlocks?.filter(filterBlocks).length && (
              <NoDataFound
                title="No insights found."
                description="To get started, add a custom block from top right."
                icon="dashboard"
                containerStyle="text-gray-900 my-6 py-6"
              />
            )}
          </>
        )}
      </ListGroup>
    </SimpleModalCreation>
  );
};

export default InsightBlocksModal;
