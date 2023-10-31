import React, { useEffect, useRef, useState } from 'react';
import MaterialIcon from '../components/commons/MaterialIcon';
import stageService from '../services/stage.service';
import pipelineService from '../services/pipeline.services';
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  Row,
  Spinner,
} from 'reactstrap';
import ButtonIcon from '../components/commons/ButtonIcon';
import MoreActions from '../components/MoreActions';
import { Form } from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';
import TooltipComponent from '../components/lesson/Tooltip';
import SimpleModalCreation from '../components/modal/SimpleModalCreation';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useForm } from 'react-hook-form';
import InputValidation from '../components/commons/InputValidation';
import Asterick from '../components/commons/Asterick';
import AutoComplete from '../components/AutoComplete';
import InlineInput from '../components/commons/InlineInput';
import DeleteConfirmationModal from '../components/modal/DeleteConfirmationModal';
import TeamsService from '../services/teams.service';
import Alert from '../components/Alert/Alert';
import AlertWrapper from '../components/Alert/AlertWrapper';
import DropdownValidation from '../components/commons/DropdownValidation';
import CheckBoxInput from '../components/inputs/CheckBoxInput';
import { TransitionGroup } from 'react-transition-group';
import Collapse from '@mui/material/Collapse';

const Messages = {
  Team: 'Team is assigned.',
  Teams: 'All teams are assigned.',
  TeamRemoved: 'Team is removed.',
  TeamError:
    'Error assigning team to pipeline. Please check console for details.',
  Stage: {
    Added: 'Stage is created.',
    Updated: 'Stage is updated.',
    Deleted: 'Stage is deleted.',
    DeletedError: 'Error deleting stage. Please check console for details.',
  },
  Pipeline: {
    Created: 'Pipeline is created.',
    Updated: 'Pipeline name is updated.',
    Deleted: 'Pipeline is deleted.',
    DeletedError: 'Error deleting pipeline. Please check console for details.',
    Default: 'Pipeline set as default.',
    DefaultError:
      'Error setting pipeline as default. Please check console for details.',
  },
  TeamGlobal: 'Pipeline marked as global.',
  TeamGlobalError:
    'Error setting pipeline global, Please check console for details.',
};

const Actions = {
  Add: 'ADD',
  Edit: 'EDIT',
  Update: 'UPDATE',
  Save: 'SAVE',
  Remove: 'REMOVE',
  Delete: 'DELETE',
  Clone: 'CLONE',
  Default: 'DEFAULT',
};

const PIPELINE_NEW_KEY = 'PipelineNew';

const DeleteStageModal = ({
  stages,
  stage,
  openModal,
  setOpenModal,
  handleConfirmModal,
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
    defaultValues: { stageId: '' },
  });
  const [moveStageId, setMoveStageId] = useState(-1);
  const [loaderDeleteStage, setLoaderDeleteStage] = useState(false);
  const stagesExceptMe = stages.filter((p) => p.id !== stage.id);

  useEffect(() => {
    setMoveStageId(-1);
  }, [openModal]);

  const handleStageChange = (e) => {
    setMoveStageId(e.target.value);
  };

  const handleDeleteStage = async (data) => {
    setLoaderDeleteStage(true);
    try {
      await stageService.deleteStage(
        stage.id,
        moveStageId === -1 ? null : moveStageId
      );
      setSuccessMessage(Messages.Stage.Deleted);
    } catch (err) {
      console.log(JSON.stringify(err));
      setErrorMessage(Messages.Stage.DeletedError);
    }
    reset({ stageId: '' });
    handleConfirmModal();
    setLoaderDeleteStage(false);
  };

  const DeleteButton = () => {
    return (
      <div className="d-flex align-items-center">
        <MaterialIcon icon="delete" clazz="mr-1" />
        <span>Delete Stage</span>
      </div>
    );
  };
  return (
    <SimpleModalCreation
      modalTitle="Remove Stage from Pipeline"
      open={openModal}
      bankTeam={false}
      isLoading={loaderDeleteStage}
      handleSubmit={handleSubmit(handleDeleteStage)}
      saveButtonStyle="btn-outline-danger btn-sm"
      saveButton={<DeleteButton />}
      onHandleCloseModal={() => {
        reset({ stageId: '' });
        setOpenModal(!openModal);
      }}
    >
      <>
        <p className={stagesExceptMe.length > 0 ? '' : 'mb-0'}>
          {' '}
          Are you sure you want to remove the stage <b>{stage.name}</b> from
          this pipeline?
        </p>
        {stagesExceptMe.length > 0 && (
          <p>
            Before deleting, we&apos;ll check if there are any deals associated
            with this stage. In that case we&apos;ll transfer those deals to
            another stage you choose from the below drop-down.
          </p>
        )}
        {stagesExceptMe.length > 0 && (
          <Row className="align-items-center mb-3">
            <Col md={3}>Stage Name</Col>
            <Col md={9}>
              <Form
                className="w-100"
                onSubmit={handleSubmit(handleDeleteStage)}
              >
                <DropdownValidation
                  name="stageId"
                  value={moveStageId}
                  validationConfig={{
                    required: 'Select a stage to transfer.',
                    onChange: (e) => {
                      handleStageChange(e);
                      // hook form method to set so that requirement meets
                      setValue('stageId', e.target.value);
                    },
                  }}
                  errors={errors}
                  customKeys={['id', 'name']}
                  register={register}
                  classNames="font-size-sm comfort"
                  options={stagesExceptMe || []}
                  emptyOption="None"
                  placeholder="Select stage"
                  errorDisplay="position-absolute mb-0 left-0 -bottom-26"
                />
              </Form>
            </Col>
          </Row>
        )}
      </>
    </SimpleModalCreation>
  );
};

const DeletePipelineModal = ({
  pipeline,
  pipelines,
  openModal,
  setOpenModal,
  handleConfirmModal,
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
    defaultValues: { stageId: '', pipelineId: '' },
  });
  const [moveStageId, setMoveStageId] = useState(-1);
  const pipelinesExceptMe = pipelines.filter((p) => p.id !== pipeline.id);
  const [selectedPipeline, setSelectedPipeline] = useState(
    pipelinesExceptMe[0]
  );
  const [loaderDeletePipeline, setLoaderDeletePipeline] = useState(false);
  const [loaderStages, setLoaderStages] = useState(false);
  const [stages, setStages] = useState([]);

  useEffect(() => {
    setMoveStageId(-1);
    setValue('pipelineId', selectedPipeline?.id);
  }, [openModal]);

  const handleStageChange = (e) => {
    setMoveStageId(e.target.value);
  };

  const getStagesByPipeline = async (id) => {
    setLoaderStages(true);
    const data = await stageService.getStages(id);
    setStages(data);
    setLoaderStages(false);
  };

  const handlePipelineChange = async (e) => {
    const { value } = e.target;
    setSelectedPipeline({ id: value });
    setValue('pipelineId', value);
    if (value) {
      getStagesByPipeline(value);
    }
  };

  const handleDeletePipeline = async () => {
    setLoaderDeletePipeline(true);
    try {
      await pipelineService.deletePipeline(
        pipeline.id,
        moveStageId === -1 ? null : moveStageId
      );
      setSuccessMessage(Messages.Pipeline.Deleted);
    } catch (err) {
      console.log(JSON.stringify(err));
      setErrorMessage(Messages.Pipeline.DeletedError);
    }
    reset({ stageId: '', pipelineId: '' });
    handleConfirmModal();
    setLoaderDeletePipeline(false);
  };

  const DeleteButton = () => {
    return (
      <div className="d-flex align-items-center">
        <MaterialIcon icon="delete" clazz="mr-1" />
        <span>Delete Pipeline</span>
      </div>
    );
  };

  useEffect(() => {
    getStagesByPipeline(selectedPipeline?.id);
  }, [openModal]);

  return (
    <SimpleModalCreation
      modalTitle="Delete Pipeline"
      open={openModal}
      bankTeam={false}
      isLoading={loaderDeletePipeline}
      handleSubmit={handleSubmit(handleDeletePipeline)}
      saveButtonStyle="btn-outline-danger btn-sm"
      saveButton={<DeleteButton />}
      onHandleCloseModal={() => {
        reset({ stageId: '', pipelineId: '' });
        setOpenModal(!openModal);
      }}
    >
      <Form className="w-100" onSubmit={handleSubmit(handleDeletePipeline)}>
        <p>
          {' '}
          Are you sure you want to remove the pipeline <b>{pipeline.name}</b>?
        </p>
        <p>
          This pipeline has deals associated with it. Choose another pipeline
          where you want these deals transferred.
        </p>
        <Row className="align-items-center mb-2">
          <Col md={3}>Pipeline</Col>
          <Col md={9}>
            <DropdownValidation
              name="pipelineId"
              value={selectedPipeline?.id}
              validationConfig={{
                required: 'Select pipeline to load its stages.',
                onChange: (e) => {
                  handlePipelineChange(e);
                },
              }}
              errors={errors}
              customKeys={['id', 'name']}
              register={register}
              classNames="font-size-sm comfort"
              options={pipelinesExceptMe || []}
              emptyOption="None"
              placeholder="Select pipeline"
              errorDisplay="mb-0 mt-2"
            />
          </Col>
        </Row>
        <Row className="align-items-center mb-3">
          <Col md={3}>Stage name</Col>
          <Col md={9}>
            <DropdownValidation
              name="stageId"
              value={moveStageId}
              validationConfig={{
                required: 'Select a stage to transfer.',
                onChange: (e) => {
                  handleStageChange(e);
                  // hook form method to set so that requirement meets
                  setValue('stageId', e.target.value);
                },
              }}
              errors={errors}
              customKeys={['id', 'name']}
              register={register}
              classNames="font-size-sm comfort"
              options={stages || []}
              emptyOption="None"
              placeholder="Select stage"
              errorDisplay="mb-0 position-absolute left-0 -bottom-26"
            />
          </Col>
          {loaderStages && (
            <Spinner
              className="spinner-grow-xs position-absolute"
              style={{ right: 50 }}
            />
          )}
        </Row>
      </Form>
    </SimpleModalCreation>
  );
};

const AddEditPipelineStageModal = ({
  pipeline,
  stages,
  stage,
  openModal,
  setOpenModal,
  handleConfirmModal,
  mode = Actions.Add,
  setErrorMessage,
  setSuccessMessage,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '', probability: 0 },
  });

  const [editedStage, setEditedStage] = useState({ ...stage });
  const [loaderSaveStage, setLoaderSaveStage] = useState(false);

  useEffect(() => {
    setEditedStage(stage);
    setValue('name', stage?.name);
    setValue('probability', stage?.probability);
  }, [stage]);

  const handleProbabilityChange = (value) => {
    setEditedStage({ ...editedStage, probability: value });
  };

  const handleValueChange = (e) => {
    const { value } = e.target;
    setEditedStage({
      ...editedStage,
      name: value,
    });
    setValue('name', value);
  };

  const handleSave = async () => {
    setLoaderSaveStage(true);
    if (mode === Actions.Add) {
      const position =
        stages.length > 0 ? stages[stages.length - 1].position + 1 : 1;
      let newStage = [];
      try {
        newStage = await stageService.createStage([
          {
            ...editedStage,
            pipelineId: pipeline.id,
            position,
            probability: parseFloat(editedStage.probability),
          },
        ]);
        setSuccessMessage(Messages.Stage.Added);
        handleConfirmModal(Actions.Add, newStage[0]);
      } catch (err) {
        console.log(err);
        setErrorMessage('Error in saving. Please check console for details.');
      } finally {
        setLoaderSaveStage(false);
      }
    } else {
      try {
        const updatedStage = await stageService.createStage([
          {
            ...editedStage,
            pipelineId: pipeline.id,
            probability: parseFloat(editedStage.probability),
            description: '',
          },
        ]);
        handleConfirmModal(Actions.Edit, updatedStage[0]);
        setSuccessMessage(Messages.Stage.Updated);
      } catch (err) {
        console.log(err);
        setErrorMessage('Error in saving. Please check console for details.');
      } finally {
        setLoaderSaveStage(false);
      }
    }
    reset({ name: '', probability: 0 });
  };

  const StageModalTitle = () => {
    return (
      <div className="d-flex align-items-center">
        <span>{mode === Actions.Edit ? 'Rename Stage' : 'Add Stage'}</span>
        <span
          className="ml-2 m-0 fs-7 badge-pill font-weight-medium tag-item"
          color="soft-secondary"
        >
          {pipeline.name}
        </span>
      </div>
    );
  };

  return (
    <SimpleModalCreation
      modalTitle={<StageModalTitle />}
      open={openModal}
      bankTeam={false}
      isLoading={loaderSaveStage}
      handleSubmit={handleSubmit((d) => handleSave(d))}
      onHandleCloseModal={() => setOpenModal(!openModal)}
    >
      <Form onSubmit={handleSubmit(handleSave)}>
        <Row className="align-items-center pb-3">
          <Col md={3}>
            <h5 className="mb-0">
              Stage Name <Asterick />{' '}
            </h5>
          </Col>
          <Col md={9}>
            <InputValidation
              name="name"
              type="input"
              autofocus
              placeholder="Stage Name"
              value={editedStage?.name || ''}
              errorDisplay="position-absolute error-show-right"
              validationConfig={{
                required: true,
                inline: true,
                onChange: handleValueChange,
              }}
              errors={errors}
              register={register}
            />
          </Col>
        </Row>

        <Row className="align-items-center">
          <Col md={3}>
            <h5 className="mb-0">Probability</h5>
          </Col>
          <Col md={9}>
            <input
              type="number"
              min={0}
              max={100}
              className="form-control"
              placeholder="Probability"
              value={editedStage?.probability}
              onChange={(e) => handleProbabilityChange(e.target.value)}
            />
          </Col>
        </Row>
      </Form>
    </SimpleModalCreation>
  );
};

const StageSkeletonLoader = ({ circle = true, rows }) => {
  const [rowCount] = useState(Array(rows).fill(0));
  const Circle = ({ children }) => {
    return <div style={{ height: 20, width: 20 }}>{children}</div>;
  };
  return (
    <>
      {rowCount.map((r, idx) => (
        <div key={idx} className="d-flex col py-2 my-2 px-0 align-items-center">
          {circle && (
            <Circle>
              <Skeleton
                circle
                style={{ borderRadius: '50%', lineHeight: 1.3 }}
              />
            </Circle>
          )}
          <div className={`w-100 ${circle ? 'ml-2' : 'ml-0'}`}>
            <Skeleton height="10" />
          </div>
        </div>
      ))}
    </>
  );
};

const StageItem = ({
  stage,
  index,
  disabled,
  onHandleEdit,
  onHandleRemove,
  isDraggable,
}) => {
  const actionItems = [
    {
      id: 'remove',
      icon: 'delete',
      name: 'Delete',
    },
  ];

  const JustField = () => {
    return (
      <div className="ml-1 d-flex align-items-center flex-grow-1 border w-100 px-2 py-1 bg-white my-2 rounded">
        <div className="flex-grow-1">
          <p className="fs-7 mb-0 font-weight-medium">{stage.name}</p>
          <TooltipComponent title="This represents your confidence in winning a deal by the expected close date. Probability can be assigned by deal or pipeline stage and is used to project your future revenue. The default probability for each stage is 100%, but you can assign any value between 0% and 100%.">
            <a className="cursor-pointer p-0 m-0 text-black">
              <MaterialIcon icon="scale" clazz="font-size-sm" />{' '}
            </a>
          </TooltipComponent>
          <span className="fs-8 mb-0">{stage.probability}% </span>
        </div>
        <div
          className={`d-flex align-items-center refresh-icon ${
            disabled ? 'hide' : ''
          }`}
        >
          <TooltipComponent title="Rename stage">
            <a
              onClick={() => onHandleEdit(stage)}
              className={`icon-hover-bg mr-1 cursor-pointer`}
            >
              <MaterialIcon icon="edit" clazz="text-gray-700 font-size-lg" />{' '}
            </a>
          </TooltipComponent>
          <a className={`icon-hover-bg cursor-pointer`}>
            <MoreActions
              icon="more_vert"
              items={actionItems}
              onHandleRemove={() => onHandleRemove(stage)}
              onHandleEdit={() => onHandleEdit(stage)}
              toggleClassName="w-auto p-0 h-auto"
            />
          </a>
        </div>
      </div>
    );
  };
  return (
    <>
      {isDraggable ? (
        <Draggable key={stage.id} draggableId={stage.id} index={index}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={`d-flex pl-2 pr-3 setting-item bg-hover-gray align-items-center ${
                snapshot.isDragging ? 'shadow-lg rounded-lg' : ''
              }`}
            >
              <MaterialIcon icon="drag_indicator" clazz="text-gray-600" />
              <JustField />
            </div>
          )}
        </Draggable>
      ) : (
        <div
          className={`d-flex px-2 setting-item bg-hover-gray align-items-center`}
        >
          <JustField />
        </div>
      )}
    </>
  );
};

const PipelineSection = ({ updatePipelines, pipelines, pipeline }) => {
  let actionItems = [
    {
      id: 'edit',
      icon: 'copy',
      name: 'Clone Pipeline',
    },
  ];

  // if there are more than one pipelines then show delete option, if there is one then dont allow deleting it, IDF-2429
  if (pipelines?.length > 1) {
    actionItems = [
      ...actionItems,
      {
        id: 'remove',
        icon: 'delete',
        name: 'Delete',
      },
    ];
  }

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
      [...stages],
      result.source.index,
      result.destination.index
    );
    setStages(items);
  };
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaderPipelineName, setLoaderPipelineName] = useState(false);
  const [stages, setStages] = useState([]);
  const [currentStage, setCurrentStage] = useState({});
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openDeletePipelineModal, setOpenDeletePipelineModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [mode, setMode] = useState(Actions.Add);
  const [pipe, setPipe] = useState(pipeline);
  const [showDeletePipelineModal, setShowDeletePipelineModal] = useState(false);
  const [pipelinesToDelete, setPipelinesToDelete] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [savingTeam, setSavingTeam] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deletingPipeline, setDeletingPipeline] = useState(false);

  const sortByPosition = (a, b) => {
    return a.position - b.position;
  };

  const onCancelPipelineName = async () => {
    setPipe(pipeline);
  };

  const onSavePipelineName = async () => {
    setLoaderPipelineName(true);
    // when cloning pipeline
    if (pipeline?.cloned) {
      // first need to create pipeline
      const newPipeline = await pipelineService.createPipeline({
        name: pipe.name,
      });
      // if cloned pipeline has stages then create those as well with new pipeline
      if (stages.length) {
        const newStages = stages.map((s, index) => ({
          name: s.name,
          position: index + 1,
          probability: s.probability,
          pipelineId: newPipeline.id,
          description: '',
        }));
        const createdStages = await stageService.createStage(newStages);
        setLoaderPipelineName(false);
        setStages(createdStages);
        updatePipelines(Actions.Save, newPipeline);
      }
    } else {
      if (pipeline.id !== PIPELINE_NEW_KEY) {
        await pipelineService.updatePipeline(pipeline.id, {
          name: pipe.name,
        });
        setLoaderPipelineName(false);
        updatePipelines(Actions.Update, pipe);
        setSuccessMessage(Messages.Pipeline.Updated);
      } else {
        const newPipeline = await pipelineService.createPipeline({
          name: pipe.name,
        });
        setLoaderPipelineName(false);
        updatePipelines(Actions.Save, newPipeline);
        setSuccessMessage(Messages.Pipeline.Created);
      }
    }
  };

  const handleAddNewStage = () => {
    setIsEditingMode(false);
    setMode(Actions.Add);
    setCurrentStage({ name: '', probability: 0 });
    setOpenEditModal(true);
  };

  const onHandleRemovePipeline = async () => {
    setDeletingPipeline(true);
    const { counts } = await pipelineService.getPipelineSummary(pipeline.id);

    setDeletingPipeline(false);
    if (counts.deal > 0) {
      setOpenDeletePipelineModal(true);
    } else {
      // if no deals in any of the stages then just delete pipeline
      setPipelinesToDelete([{ ...pipeline, title: pipeline.name }]);
      setShowDeletePipelineModal(true);
    }
  };

  const onHandleClonePipeline = () => {
    updatePipelines(Actions.Clone, pipeline, stages);
  };

  const onHandleRemove = (stage) => {
    setIsEditingMode(false);
    setCurrentStage(stage);
    setOpenDeleteModal(true);
  };

  const onHandleEdit = (stage) => {
    setIsEditingMode(false);
    setCurrentStage(stage);
    setMode(Actions.Edit);
    setOpenEditModal(true);
  };

  const handleConfirmDeleteStage = () => {
    setOpenDeleteModal(false);
    setStages([...stages].filter((s) => s.id !== currentStage.id));
  };

  const handleConfirmDeletePipelineOrTransfer = () => {
    setOpenDeletePipelineModal(false);
    updatePipelines(Actions.Delete, pipeline);
  };

  const handleConfirmDeletePipeline = async () => {
    try {
      await pipelineService.deletePipeline(pipeline.id);
      setSuccessMessage(Messages.Pipeline.Deleted);
      setShowDeletePipelineModal(false);
      updatePipelines(Actions.Delete, pipeline);
    } catch (err) {
      console.log(JSON.stringify(err));
      setErrorMessage(Messages.Pipeline.DeletedError);
    }
  };

  const handleConfirmUpdateStage = (action, updatedStage) => {
    setIsEditingMode(false);
    setOpenEditModal(false);
    if (action === Actions.Edit) {
      setStages([
        ...stages
          .map((stage) =>
            stage.id === updatedStage.id ? { ...updatedStage } : stage
          )
          .sort(sortByPosition),
      ]);
    } else {
      setStages([...stages, updatedStage].sort(sortByPosition));
    }
  };

  const removeTeam = (team) => {
    return pipelineService.deletePipelineTeam(pipeline.id, team.id);
  };

  const handleGlobalTeamChange = async (e) => {
    const { checked } = e.target;
    setSavingTeam(true);
    try {
      await pipelineService.updatePipeline(pipeline.id, {
        global: checked,
      });
      setSuccessMessage(Messages.TeamGlobal);
      updatePipelines(Actions.Update, { ...pipeline, global: checked });
    } catch (e) {
      console.log(e);
      setErrorMessage(Messages.TeamGlobalError);
    } finally {
      setSavingTeam(false);
    }
  };

  const saveTeams = async (selectedTeams, itemToRemove, allTeams) => {
    const allOption = selectedTeams.find((t) => t.id === -1);
    setSavingTeam(true);
    try {
      if (itemToRemove) {
        await removeTeam(itemToRemove);
        setSuccessMessage(Messages.TeamRemoved);
      } else {
        if (selectedTeams.length) {
          if (allOption) {
            await pipelineService.setPipelineTeam(
              allTeams.map((m) => ({
                teamId: m.id,
                pipelineId: pipeline.id,
              }))
            );
            setSuccessMessage(Messages.Teams);
          } else {
            await pipelineService.setPipelineTeam(
              selectedTeams.map((m) => ({
                teamId: m.id,
                pipelineId: pipeline.id,
              }))
            );
            setSuccessMessage(Messages.Team);
          }
        } else {
          await removeTeam(selectedTeam[0]);
          setSuccessMessage(Messages.TeamRemoved);
        }
      }
    } catch (err) {
      console.log(JSON.stringify(err));
      setErrorMessage(Messages.TeamError);
    } finally {
      setSavingTeam(false);
    }
  };

  const handleTeamSelect = async (team) => {
    const newTeams = [...selectedTeam, team];
    setSelectedTeam(newTeams);
  };

  const setAsDefault = async (e) => {
    e.preventDefault();
    if (!pipeline?.isDefault) {
      setDeletingPipeline(true);
      try {
        await pipelineService.setDefaultPipeline(pipeline.id);
        setSuccessMessage(Messages.Pipeline.Default);
        updatePipelines(Actions.Default, pipeline);
      } catch (err) {
        console.log(JSON.stringify(err));
        setErrorMessage(Messages.Pipeline.DefaultError);
      }
      setDeletingPipeline(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (pipeline?.id !== PIPELINE_NEW_KEY) {
        setLoading(true);
        const data = await stageService.getStages(pipeline?.id);
        setStages(data.sort(sortByPosition));
        setLoading(false);
      }
      const { data } = await TeamsService.getTeams({ page: 1, limit: 50 });
      // add All option in dropdown
      data.unshift({ id: -1, name: 'All' });
      setTeams(data);
    })();
  }, []);

  useEffect(() => {
    setPipe(pipeline);
    if (pipeline?.stages) {
      setStages(pipeline?.stages);
    }
  }, [pipeline]);

  useEffect(() => {
    (async () => {
      if (pipeline?.id !== PIPELINE_NEW_KEY) {
        const teams = await pipelineService.getPipelineTeam(pipeline?.id);
        if (teams) {
          setSelectedTeam(teams);
        }
      }
    })();
  }, []);

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
        showModal={showDeletePipelineModal}
        setShowModal={setShowDeletePipelineModal}
        setSelectedCategories={setPipelinesToDelete}
        event={handleConfirmDeletePipeline}
        itemsConfirmation={pipelinesToDelete}
        itemsReport={[]}
        setErrorMessage={setErrorMessage}
        setSuccessMessage={setSuccessMessage}
      />
      <DeletePipelineModal
        openModal={openDeletePipelineModal}
        setOpenModal={setOpenDeletePipelineModal}
        pipeline={pipeline}
        pipelines={pipelines}
        handleConfirmModal={handleConfirmDeletePipelineOrTransfer}
        setErrorMessage={setErrorMessage}
        setSuccessMessage={setSuccessMessage}
      />
      <DeleteStageModal
        openModal={openDeleteModal}
        setOpenModal={setOpenDeleteModal}
        stages={stages}
        stage={currentStage}
        handleConfirmModal={handleConfirmDeleteStage}
        setErrorMessage={setErrorMessage}
        setSuccessMessage={setSuccessMessage}
      />
      <AddEditPipelineStageModal
        openModal={openEditModal}
        setOpenModal={setOpenEditModal}
        mode={mode}
        stages={stages}
        stage={currentStage}
        pipeline={pipeline}
        handleConfirmModal={handleConfirmUpdateStage}
        setErrorMessage={setErrorMessage}
        setSuccessMessage={setSuccessMessage}
      />
      <Card className="h-100 hover-actions">
        <CardHeader className="px-3 py-2">
          {isEditingMode ? (
            <InlineInput
              show={isEditingMode}
              setShow={setIsEditingMode}
              value={pipe?.name}
              loading={loaderPipelineName}
              setInputValue={(name) => setPipe({ ...pipe, name })}
              onCancel={onCancelPipelineName}
              onSave={onSavePipelineName}
            />
          ) : (
            <div className="d-flex align-items-center w-100 justify-content-between">
              {pipeline.id !== PIPELINE_NEW_KEY && !pipeline.cloned ? (
                <>
                  <div>
                    {loaderPipelineName ? (
                      <Skeleton height="10" width={240} />
                    ) : (
                      <h4 className="mb-0">
                        {pipe?.name}
                        <a
                          href=""
                          onClick={(e) => setAsDefault(e)}
                          className={`ml-1 ${
                            pipe?.isDefault ? '' : 'action-items'
                          }`}
                        >
                          <TooltipComponent
                            title={
                              pipe?.isDefault
                                ? 'Default pipeline'
                                : 'Set as default'
                            }
                          >
                            <MaterialIcon
                              icon="star"
                              clazz={
                                pipe?.isDefault ? 'text-green' : 'text-gray-300'
                              }
                            />
                          </TooltipComponent>
                        </a>
                      </h4>
                    )}
                    <p className="text-muted fs-8 mb-0">
                      {loading ? (
                        <Skeleton height="10" width={120} />
                      ) : (
                        <> {stages?.length} Stages </>
                      )}
                    </p>
                  </div>
                  <div className={`d-flex align-items-center action-items`}>
                    {deletingPipeline && (
                      <Spinner className="spinner-grow-xs text-gray-600 mr-2" />
                    )}
                    <TooltipComponent title="Rename pipeline">
                      <a
                        className={`icon-hover-bg mr-1 cursor-pointer`}
                        onClick={() => setIsEditingMode(true)}
                      >
                        <MaterialIcon
                          icon="edit"
                          clazz="text-gray-700 font-size-lg"
                        />{' '}
                      </a>
                    </TooltipComponent>
                    <a className={`icon-hover-bg cursor-pointer`}>
                      <MoreActions
                        icon="more_vert"
                        items={actionItems}
                        onHandleRemove={() => onHandleRemovePipeline(null)}
                        onHandleEdit={() => onHandleClonePipeline(null)}
                        toggleClassName="w-auto p-0 h-auto"
                      />
                    </a>
                  </div>
                </>
              ) : (
                <InlineInput
                  show={true}
                  setShow={() => {}}
                  value={pipe?.name}
                  setInputValue={(name) => setPipe({ ...pipe, name })}
                  onCancel={onCancelPipelineName}
                  onSave={onSavePipelineName}
                  showControls={false}
                />
              )}
            </div>
          )}
        </CardHeader>
        <CardBody className="py-2 px-0 overflow-y-auto">
          <h5 className="pt-2 pb-0 px-3 mb-0">Open Stages</h5>
          {pipeline?.id !== PIPELINE_NEW_KEY || pipeline?.cloned ? (
            <>
              {loading ? (
                <div className="my-1 px-3">
                  <StageSkeletonLoader rows={5} />
                </div>
              ) : (
                <DragDropContext onDragEnd={onHandleDragEnd}>
                  <Droppable droppableId={`pipeline-${pipeline?.id}`}>
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        <TransitionGroup appear={true}>
                          {stages?.map((stage, index) => (
                            <Collapse key={stage.id}>
                              <StageItem
                                stage={stage}
                                index={index}
                                key={index}
                                disabled={pipeline?.cloned}
                                onHandleEdit={onHandleEdit}
                                onHandleRemove={onHandleRemove}
                                isDraggable={false}
                              />
                            </Collapse>
                          ))}
                          {provided.placeholder}
                        </TransitionGroup>
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </>
          ) : (
            <></>
          )}

          {!loading &&
            pipeline?.id !== PIPELINE_NEW_KEY &&
            !pipeline?.cloned && (
              <ButtonIcon
                color="link"
                icon="add"
                disabled={isEditingMode === true}
                onclick={handleAddNewStage}
                label="Stage"
                classnames="border-0 px-4 text-primary"
              />
            )}
        </CardBody>
        <CardFooter className="px-3">
          {pipeline?.id !== PIPELINE_NEW_KEY && !pipeline?.cloned ? (
            <>
              <div className="d-flex align-items-center justify-content-between">
                <h5 className="mb-0">Assigned Teams</h5>
                <CheckBoxInput
                  labelCheckBox={`Global Pipeline`}
                  value={pipeline.global}
                  onChange={handleGlobalTeamChange}
                />
              </div>
              <AutoComplete
                id={`team_id_${pipeline?.id}`}
                placeholder="Select Team"
                name={`team_id_${pipeline?.id}`}
                data={teams}
                loading={savingTeam}
                onChange={(items, itemToRemove) => {
                  const allOption = items.find((t) => t.id === -1);
                  if (allOption) {
                    setSelectedTeam(teams.filter((t) => t.id !== -1));
                  } else {
                    setSelectedTeam(items.filter((t) => t.id !== -1));
                  }
                  saveTeams(
                    items,
                    itemToRemove,
                    teams.filter((t) => t.id !== -1)
                  );
                }}
                customKey="name"
                isMultiple={true}
                selected={selectedTeam}
                onHandleSelect={(item) => handleTeamSelect(item)}
              />
            </>
          ) : (
            <>
              <ButtonIcon
                color="primary"
                classnames="btn-sm mr-1"
                label="Save"
                loading={loaderPipelineName}
                disabled={!pipe?.name}
                onclick={onSavePipelineName}
              />
              <ButtonIcon
                color="white"
                classnames="btn-sm"
                label="Cancel"
                onclick={() => updatePipelines(Actions.Remove, pipe)}
              />
            </>
          )}
        </CardFooter>
      </Card>
    </>
  );
};

const PipelineSectionLoader = () => {
  return (
    <Card className="h-100 hover-actions">
      <CardHeader className="px-3">
        <div className="d-flex align-items-center w-100 justify-content-between">
          <div>
            <h4 className="mb-0">Pipeline</h4>
            <p className="text-muted fs-8 mb-0">
              <Skeleton height="10" width="120" />
            </p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="py-2 px-0">
        <h5 className="pt-2 pb-0 px-3 mb-0">Open Stages</h5>
        <div className="my-1 px-3">
          <StageSkeletonLoader rows={5} />
        </div>
      </CardBody>
      <CardFooter className="px-3">
        <h5 className="mb-0">Assigned Teams</h5>
        <div className="my-1">
          <StageSkeletonLoader circle={false} rows={1} />
        </div>
      </CardFooter>
    </Card>
  );
};

const PipelinesAndStages = () => {
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(false);
  const pipelineBoardRef = useRef(null);

  const getPipelines = async () => {
    setLoading(true);
    const { data } = await pipelineService.getPipelines();
    setLoading(false);
    setPipelines(data);
  };

  useEffect(() => {
    getPipelines();
  }, []);

  const handleCreateNewPipeline = () => {
    setPipelines([...pipelines, { id: PIPELINE_NEW_KEY }]);
  };

  const updatePipelines = (action, pipe, stages) => {
    switch (action) {
      case Actions.Remove:
        // newly created static delete
        setPipelines(pipelines.slice(0, -1));
        break;
      case Actions.Delete:
        // api delete and refresh
        setPipelines([...pipelines].filter((p) => p.id !== pipe.id));
        break;
      case Actions.Save:
        // call to create new pipeline here
        setPipelines([
          ...pipelines.map((p) => (p.id === PIPELINE_NEW_KEY ? pipe : p)),
        ]);
        break;
      case Actions.Update:
        // just for update in ARRAY
        setPipelines([
          ...pipelines.map((pipeline) =>
            pipeline.id === pipe.id ? { ...pipe } : { ...pipeline }
          ),
        ]);
        break;
      case Actions.Clone:
        // clone the object and add in pipelines array
        setPipelines([
          ...pipelines,
          { ...pipe, id: PIPELINE_NEW_KEY, cloned: true, stages },
        ]);

        setTimeout(() => {
          pipelineBoardRef.current.scrollTo(
            pipelineBoardRef.current.scrollWidth,
            0
          );
        });
        break;
      case Actions.Default:
        // only set current pipeline default and update rest of them
        setPipelines(
          [...pipelines].map((p) => ({ ...p, isDefault: pipe.id === p.id }))
        );
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div
        ref={pipelineBoardRef}
        className="row stages-board smooth-scroll overflow-x-auto flex-nowrap pb-2"
      >
        {loading ? (
          <Col className="vertical-section">
            <PipelineSectionLoader />
          </Col>
        ) : (
          <>
            {pipelines?.map((pipeline, index) => (
              <Col
                key={index}
                className={`vertical-section ${index > 0 ? 'pl-0' : ''}`}
              >
                <PipelineSection
                  updatePipelines={updatePipelines}
                  pipeline={pipeline}
                  pipelines={pipelines}
                />
              </Col>
            ))}
          </>
        )}
        <Col
          className={`vertical-section ${pipelines.length > 0 ? 'pl-0' : ''}`}
        >
          <div
            className={`d-flex card flex-column justify-content-center setting-item cursor-pointer align-items-center h-100`}
          >
            <div className="text-center">
              <ButtonIcon
                color="link"
                icon="add"
                onclick={handleCreateNewPipeline}
                label="New Pipeline"
                classnames="border-0 px-0 text-primary"
              />
            </div>
          </div>
        </Col>
      </div>
    </>
  );
};

export default PipelinesAndStages;
