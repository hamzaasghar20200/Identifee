import { ListGroupItem } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import {
  ComponentTextTypes,
  DynamicBlock,
  ReportBlockControls,
} from '../constants/reportBuilderConstants';
import ControlsBlock from './ControlsBlock';
import axios from 'axios';
import authHeader from '../../../services/auth-header';
import ReportBlockLoader from '../../loaders/ReportBlock';
import { capitalize } from '../../../utils/Utils';

const getDataArray = (key, obj) => {
  return [obj[key], 100 - obj[key]];
};

const regex = /\$\.[^\s]+/g; // this will bring out $. keys from text

// found this here: https://jpedroribeiro.com/2020/01/nested-property-dot-notation/
const getPropValue = (sourceObject, dotNotationPath) => {
  let returnData = sourceObject;

  dotNotationPath.split('.').forEach((subPath) => {
    returnData = returnData[subPath] || `Property ${subPath} not found`;
  });

  return returnData;
};

const BlocksQuery = ({
  block,
  request,
  organizationId,
  showAdd,
  showRange,
  handleDelete,
  handleChangePosition,
  handleChangeRange,
}) => {
  const [component, setComponent] = useState(
    <DynamicBlock
      type={block.type}
      {...block}
      showAdd={showAdd}
      block={block}
      showRange={showRange}
      handleDelete={() => handleDelete(block)}
      handleChangePosition={handleChangePosition}
      handleChangeRange={handleChangeRange}
    />
  );

  // dont liking it, BUT API sends :\
  const getPrettyLabels = (name) => {
    if (!name.includes('_') && name === 'ach') {
      return name.toUpperCase();
    } else if (name === 'all_card_platforms') {
      return 'All cards';
    }
    return capitalize(name.replaceAll('_', ' '));
  };

  const getInfo = () => {
    return axios({
      method: request.method,
      url: `${process.env.REACT_APP_API_URL}/api${request.path.replace(
        ':organizationId',
        organizationId
      )}`,
      headers: authHeader(),
    });
  };

  // it replaces this
  // "On average, your peers pay $.rpmg.transaction_summary[].wire_transfer% of all payables between $.selectedResponseOptionKey by Wire."
  // with
  // "On average, your peers pay (2%) of all payables between 2500 by Wire."
  const updateDescription = (data, range) => {
    const match = block.text.match(regex);
    if (match.length) {
      let newText = block.text;
      let index = 0;
      const toReplaceWith = [`(${data[0]}%)`, range];
      for (const k of match) {
        newText = newText.replace(k.trim(), toReplaceWith[index++]);
      }
      return [newText];
    }
  };

  useEffect(() => {
    (async () => {
      const response = await getInfo();
      const { data } = response;
      const { rpmg } = data;
      const match = block.text.match(regex);
      let updatedBlock = { ...block };
      let firstMatched = '';
      let key = '';
      let keyActual = '';
      let labels = [];
      let defaultRange = '';
      const chartDataMap = {};

      switch (block.type) {
        case ComponentTextTypes.Calendar:
          if (match?.length) {
            for (const k of match) {
              key = k.trim().substring(2, k.length); // start from 2 to ignore starting $. string
              updatedBlock = { ...block };
              updatedBlock.data = {
                value: getPropValue(data, key),
                text: 'Days',
              };
              updatedBlock.description = [
                block.text.replace(`$.${key} DAYS.`, ''),
              ];
              setComponent(
                <DynamicBlock
                  type={block.type}
                  {...updatedBlock}
                  showAdd={showAdd}
                  block={block}
                  showRange={showRange}
                  handleDelete={() => handleDelete(updatedBlock)}
                  handleChangePosition={handleChangePosition}
                  handleChangeRange={handleChangeRange}
                />
              );
            }
          }
          break;
        case ComponentTextTypes.DonutSelection:
        case ComponentTextTypes.Donut:
          updatedBlock.type = block.type || 'RPMG';
          // for matching $.rpmg.transaction_summary[].wire_transfer% and then getting rpmg.transaction_summary[].wire_transfer only
          firstMatched = match[0].trim();
          key = firstMatched.substring(2, firstMatched.length - 1);
          // then just getting .wire_transfer from above so that can traverse on API response below
          keyActual = key.split('.').pop();
          // making map like {'>2500': [2, 3]} etc
          rpmg.transaction_summary.forEach((t) => {
            chartDataMap[t.transaction.range] = getDataArray(keyActual, t);
          });
          try {
            const requestObject = JSON.parse(request.responseOptionKey);
            labels = [getPrettyLabels(keyActual), 'Others'];
            defaultRange = requestObject.range.value;

            // replacing $. keys in text/description to show left/right of the chart
            updatedBlock.description = updateDescription(
              chartDataMap[defaultRange],
              defaultRange
            );
            updatedBlock.transactionSummary = {
              labels,
              chartDataMap,
              defaultRange,
              updateDescription,
            };
          } catch (e) {
            // making [ACH, 'Others'] for chart legends
            labels = [getPrettyLabels(keyActual), 'Others'];
            defaultRange = rpmg.transaction_summary[0].transaction.range;
            // replacing $. keys in text/description to show left/right of the chart
            updatedBlock.description = updateDescription(
              chartDataMap[defaultRange],
              defaultRange
            );
            updatedBlock.transactionSummary = {
              labels,
              chartDataMap,
              updateDescription,
            };
          }
          setComponent(
            <DynamicBlock
              type={updatedBlock.type}
              {...updatedBlock}
              showAdd={showAdd}
              showRange={showRange}
              block={block}
              handleDelete={() => handleDelete(updatedBlock)}
              handleChangePosition={handleChangePosition}
              handleChangeRange={handleChangeRange}
            />
          );
          break;
      }
    })();
  }, [block?.direction]);

  return <div>{component}</div>;
};
const BlockItem = ({
  block,
  blocks,
  setBlocks,
  openAddBlocksModal,
  editMode,
  children,
  index,
  isDraggable,
  organizationId,
  style = 'border-bottom',
  showAdd,
  showRange,
  handleDelete,
  handleChangePosition,
  setErrorMessage,
  setSuccessMessage,
  messages,
  handleChangeRange,
}) => {
  const [loader] = useState(false);
  const [reportControls, setReportControls] = useState(ReportBlockControls);
  const renderBlock = () => {
    if (!block.request) {
      return (
        <DynamicBlock
          type={block.type}
          {...block}
          showAdd={showAdd}
          block={block}
        />
      );
    }

    return (
      <BlocksQuery
        request={block.request}
        organizationId={organizationId}
        showAdd={showAdd}
        showRange={showRange}
        handleDelete={handleDelete}
        handleChangePosition={handleChangePosition}
        handleChangeRange={handleChangeRange}
        block={block}
      />
    );
  };

  return (
    <>
      {loader ? (
        <ListGroupItem>
          <ReportBlockLoader rows={1} />
        </ListGroupItem>
      ) : (
        <>
          {isDraggable ? (
            <Draggable
              key={`block-${index}`}
              draggableId={`id-block-${index}`}
              index={index}
            >
              {(provided, snapshot) => (
                <ListGroupItem
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className={`p-4 report-block ${style} ${
                    snapshot.isDragging ? 'shadow-lg border rounded' : ''
                  }`}
                >
                  {children}
                </ListGroupItem>
              )}
            </Draggable>
          ) : (
            <ListGroupItem className={`p-4 report-block ${style}`}>
              {renderBlock()}
              {block.isDisabled ? (
                <div className="position-absolute drop-disabled h-100 w-100 top-0 left-0">
                  <ControlsBlock
                    controls={[
                      {
                        id: 2,
                        icon: 'visibility',
                        type: 'hideShow',
                        tooltip: 'Enable',
                      },
                    ]}
                    currentBlock={block}
                    position={index}
                    blocks={blocks}
                    setBlocks={setBlocks}
                    openAddBlocksModal={openAddBlocksModal}
                    handleDeleteBlock={handleDelete}
                    placement="bottom-0 abs-center bg-white"
                  />
                </div>
              ) : (
                <>
                  {editMode ? (
                    <div className="position-absolute drop-disabled h-100 w-100 top-0 left-0">
                      <ControlsBlock
                        controls={reportControls}
                        currentBlock={block}
                        position={index}
                        blocks={blocks}
                        setBlocks={setBlocks}
                        openAddBlocksModal={openAddBlocksModal}
                        handleDeleteBlock={handleDelete}
                        handleChangePosition={async (b, p) => {
                          try {
                            const newRptCtrls = [...reportControls].map(
                              (rc) => ({
                                ...rc,
                                isLoading: rc.type === 'changePosition',
                              })
                            );
                            setReportControls(newRptCtrls);
                            await handleChangePosition(b, p);
                            setSuccessMessage(messages.BlockPosition);
                          } catch (e) {
                            console.log(e);
                            setErrorMessage(messages.BlockPositionError);
                          } finally {
                            const newRptCtrls = [...reportControls].map(
                              (rc) => ({
                                ...rc,
                                isLoading: false,
                              })
                            );
                            setReportControls(newRptCtrls);
                          }
                        }}
                        placement="bottom-0 abs-center bg-white"
                      />
                    </div>
                  ) : (
                    ''
                  )}
                </>
              )}
            </ListGroupItem>
          )}
        </>
      )}
    </>
  );
};

export default BlockItem;
