import { ListGroup } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import BlockItem from '../../reportbuilder/blocks/BlockItem';
import NewCustomInsightBlockModal from '../../reportbuilder/modals/NewCustomInsightBlockModal';
import InsightBlocksModal from '../../reportbuilder/modals/InsightBlocksModal';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import InsightsService from '../../../services/insights.service';
import ReportBlockLoader from '../../loaders/ReportBlock';
import DeleteConfirmationModal from '../../modal/DeleteConfirmationModal';
import Alert from '../../Alert/Alert';
import AlertWrapper from '../../Alert/AlertWrapper';
import InlineInput from '../../commons/InlineInput';
import MaterialIcon from '../../commons/MaterialIcon';
import {
  ComponentSourceTypes,
  ComponentTextTypes,
  PartnerLogoBySource,
} from '../../reportbuilder/constants/reportBuilderConstants';

const Messages = {
  BlockPosition: 'Block position is updated.',
  BlockPositionError:
    'Error updating block position. Please check console for details.',
  ReportName: 'Report name updated.',
  ReportNameError:
    'Error updating report name. Please check console for details.',
  BlockDeleted: 'Report block is disabled.',
  BlockDeletingError:
    'Error disabling report block. Please check console for details.',
};
const CustomReport = ({
  organizationId,
  editMode,
  blocks,
  setBlocks,
  readonly,
  isPrincipalOwner,
}) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteBlockModal, setShowDeleteBlockModal] = useState(false);
  const [showDeleteReportModal, setShowDeleteReportModal] = useState(false);
  const [blocksToDelete, setBlocksToDelete] = useState([]);
  const [currentBlock, setCurrentBlock] = useState({});
  const [currentInsight, setCurrentInsight] = useState({}); // its the selection of Custom Report
  const [loaderInsights, setLoaderInsights] = useState(false);
  const [showInsightsBlockModal, setShowInsightsBlockModal] = useState(false);
  const [insightComponents, setInsightComponents] = useState([]);
  const [toggleNameEdit, setToggleNameEdit] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [showCustomInsightBlockModal, setShowCustomInsightBlockModal] =
    useState(false);

  const getLogoOrTypeByText = (componentText) => {
    // custom blocks are also come under IconText so checking source if its custom then do this else part raw html display
    if (componentText.source === ComponentSourceTypes.Custom) {
      return {
        type: 'IconText',
        iconConfig: {
          icon: componentText.icon || 'info',
          color: 'text-black',
        },
        data: { text: componentText.iconLabel || '' },
        description: [componentText.text],
        text: componentText.text,
      };
    } else if (componentText.type === ComponentTextTypes.IconText) {
      return {
        type: ComponentTextTypes.Static,
        iconConfig: {},
        data: {},
        text: componentText.text,
      };
    } else {
      return {
        type: componentText.type,
        iconConfig: {
          icon: componentText.icon || 'info',
          color: 'text-black',
        },
        data: { text: componentText.iconLabel || 'Legal' },
        description: [componentText.text],
        text: componentText.text,
      };
    }
  };

  const buildInsights = (insightsApi) => {
    return insightsApi?.map((insight) => {
      const { component } = insight;
      const { componentText } = component;
      const logoOrType = getLogoOrTypeByText(componentText);
      return {
        id: component.id,
        componentTextId: componentText.id,
        source: componentText.source,
        direction:
          !componentText.position || componentText.position === 'left'
            ? 'flex-row-reverse'
            : '',
        iconConfig: {
          icon: componentText.icon || 'info',
          color: 'text-black',
        },
        partnerLogo: {
          src: PartnerLogoBySource[componentText.source],
          position: `${componentText.source}-img`,
        },
        data: {
          text: componentText.iconLabel || '',
        },
        request: componentText.request,
        ...logoOrType,
      };
    });
  };

  const getInsights = async () => {
    setLoaderInsights(true);
    try {
      const { data } = await InsightsService.getInsights(organizationId);
      // if not found then create default insights
      if (!data.length) {
        try {
          const defaultInsights = await InsightsService.createDefaultInsights(
            organizationId
          );
          if (defaultInsights?.length) {
            setCurrentInsight({
              ...defaultInsights[0],
              nameBackup: defaultInsights[0].name,
            });
            // once default insight created, for instance Custom Report in this case then get its components to display
            const components = await InsightsService.getInsightsComponents(
              defaultInsights[0].id,
              true
            );
            setInsightComponents(buildInsights(components?.data));
          }
        } catch (err) {
          console.log(err);
        } finally {
          setLoaderInsights(false);
        }
      } else {
        // if already insight -> custom report there then get its components to display
        const components = await InsightsService.getInsightsComponents(
          data[0].id,
          true
        );
        setCurrentInsight({
          ...data[0],
          nameBackup: data[0].name,
        });
        setInsightComponents(buildInsights(components?.data));
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoaderInsights(false);
    }
  };

  useEffect(() => {
    getInsights();
  }, []);

  const handleAddCustomInsightsBlock = () => {
    setShowInsightsBlockModal(false);
    setShowCustomInsightBlockModal(true);
  };

  const openAddBlocksModal = (block, position, type) => {
    setCurrentBlock({ block, position, type });
    setShowInsightsBlockModal(true);
  };

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onHandleDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const items = reorder(
      blocks,
      result.source.index,
      result.destination.index
    );

    setBlocks(items);
  };

  const handleConfirmDeleteBlock = async () => {
    try {
      // just updating enabled flag to false and remove from report and available in add blocks modal
      const blockToDelete = blocksToDelete[0];
      await InsightsService.updateInsightComponent(
        currentInsight.id,
        blockToDelete.id,
        {
          component: {
            name: '',
            enabled: false,
          },
        }
      );
      setInsightComponents(
        [...insightComponents].filter((f) => f.id !== blockToDelete.id)
      );
      setBlocksToDelete([]);
      setShowDeleteBlockModal(false);
      setSuccessMessage(Messages.BlockDeleted);
    } catch (err) {
      console.log(err);
      setErrorMessage(Messages.BlockDeletingError);
    }
  };

  const handleChangePosition = (block, newDirection) => {
    return InsightsService.updateInsightComponent(currentInsight.id, block.id, {
      component: {
        name: '',
        enabled: true,
        componentText: {
          position: newDirection === 'flex-row-reverse' ? 'left' : 'right',
        },
      },
    });
  };

  const handleDeleteBlock = (block) => {
    setShowDeleteBlockModal(true);
    setBlocksToDelete([{ ...block, title: block.text }]);
  };

  const onCancelReportNameSave = () => {
    setCurrentInsight({ ...currentInsight, name: currentInsight.nameBackup });
  };
  const onSaveReportName = async () => {
    setSavingName(true);
    try {
      await InsightsService.updateInsightReport(currentInsight.id, {
        name: currentInsight.name,
      });
      setSuccessMessage(Messages.ReportName);
    } catch (e) {
      console.log(e);
      setErrorMessage(Messages.ReportNameError);
    } finally {
      setSavingName(false);
    }
  };

  const handleDeleteReport = () => {
    setShowDeleteReportModal(true);
  };

  const handleConfirmDeleteReport = async () => {
    try {
      await InsightsService.deleteInsight(currentInsight.id);
      setInsightComponents([]);
      setBlocksToDelete([]);
      setShowDeleteReportModal(false);
      setSuccessMessage('Custom report is deleted.');
      // once the report is deleted, regenerate a custom report.
      getInsights();
    } catch (err) {
      console.log(err);
      setErrorMessage(
        'Error deleting a report. Please check console for errors.'
      );
    }
  };

  const DeleteBody = ({ text }) => {
    return (
      <div>
        <div className="d-flex justify-content-center align-items-center">
          <MaterialIcon icon="report_problem" clazz="font-size-4em" />
        </div>
        <hr />
        <h4 className="text-center">{text}</h4>
      </div>
    );
  };
  return (
    <>
      <AlertWrapper className="alert-position">
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
        <Alert
          color="success"
          message={successMessage}
          setMessage={setSuccessMessage}
        />
      </AlertWrapper>
      <DeleteConfirmationModal
        showModal={showDeleteBlockModal}
        setShowModal={setShowDeleteBlockModal}
        setSelectedCategories={setBlocksToDelete}
        event={handleConfirmDeleteBlock}
        itemsConfirmation={blocksToDelete}
        itemsReport={[]}
        setErrorMessage={setErrorMessage}
        setSuccessMessage={setSuccessMessage}
        customBody={
          <DeleteBody text="Are you sure you want to disable block from the Report?" />
        }
        positiveBtnText="Yes, Disable"
      />
      <DeleteConfirmationModal
        showModal={showDeleteReportModal}
        setShowModal={setShowDeleteReportModal}
        setSelectedCategories={[currentInsight]}
        event={handleConfirmDeleteReport}
        itemsConfirmation={[currentInsight]}
        itemsReport={[]}
        setErrorMessage={setErrorMessage}
        setSuccessMessage={setSuccessMessage}
        customBody={
          <DeleteBody text="Are you sure you want to delete the Report? This will regenerate default custom report." />
        }
      />
      {showCustomInsightBlockModal && (
        <NewCustomInsightBlockModal
          show={showCustomInsightBlockModal}
          setShow={setShowCustomInsightBlockModal}
          handleBack={() => {
            setShowCustomInsightBlockModal(false);
            setShowInsightsBlockModal(true);
          }}
          blocks={insightComponents}
          setBlocks={setInsightComponents}
          currentBlock={currentBlock}
          currentInsight={currentInsight}
          setErrorMessage={setErrorMessage}
          setSuccessMessage={setSuccessMessage}
        />
      )}

      {showInsightsBlockModal && (
        <InsightBlocksModal
          show={showInsightsBlockModal}
          setShow={setShowInsightsBlockModal}
          handleAddCustomInsight={handleAddCustomInsightsBlock}
          parentBlocks={insightComponents}
          setParentBlocks={setInsightComponents}
          currentBlock={currentBlock}
          organizationId={organizationId}
          currentInsight={currentInsight}
          buildInsights={buildInsights}
          setErrorMessage={setErrorMessage}
          setSuccessMessage={setSuccessMessage}
        />
      )}

      <div id="customReportContainer" className={`m-0 position-relative`}>
        {loaderInsights ? (
          <ReportBlockLoader rows={6} />
        ) : (
          <>
            <div className="d-none">
              <InlineInput
                show={toggleNameEdit}
                setShow={setToggleNameEdit}
                showEdit={!editMode && !readonly}
                loading={savingName}
                value={currentInsight?.name}
                setInputValue={(name) =>
                  setCurrentInsight({ ...currentInsight, name })
                }
                placeholder="Report Name"
                onCancel={onCancelReportNameSave}
                onSave={onSaveReportName}
                onDelete={handleDeleteReport}
                editButtonStyle="position-absolute w-50 -top-65 z-index-99"
                containerStyle="position-absolute w-55 -top-54 left-17 z-index-99"
                showControls={isPrincipalOwner}
              />
            </div>
            <DragDropContext onDragEnd={onHandleDragEnd}>
              <Droppable droppableId="reportBuilder">
                {(provided) => (
                  <ListGroup
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="list-group-no-gutters list-group-flush"
                  >
                    {insightComponents?.map((block, index) => (
                      <>
                        {block.type !== 'bar' && ( // TODO: ignoring bar type for now, will turn it on later
                          <BlockItem
                            key={block.id}
                            index={index}
                            block={block}
                            blocks={insightComponents}
                            editMode={editMode}
                            setBlocks={setInsightComponents}
                            isDraggable={false}
                            showRange={false}
                            showAdd={null}
                            organizationId={organizationId}
                            handleDelete={() => handleDeleteBlock(block)}
                            handleChangePosition={handleChangePosition}
                            openAddBlocksModal={openAddBlocksModal}
                            setErrorMessage={setErrorMessage}
                            setSuccessMessage={setSuccessMessage}
                            messages={Messages}
                          />
                        )}
                      </>
                    ))}
                    {provided.placeholder}
                  </ListGroup>
                )}
              </Droppable>
            </DragDropContext>
          </>
        )}
      </div>
    </>
  );
};

export default CustomReport;
