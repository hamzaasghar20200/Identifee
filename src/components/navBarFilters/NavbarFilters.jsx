import React, { useState, useEffect } from 'react';
import userService from '../../services/user.service';
import { isModuleAllowed, isPermissionAllowed } from '../../utils/Utils';
import { useTenantContext } from '../../contexts/TenantContext';
import RightPanelModal from '../modal/RightPanelModal';

import Alert from '../Alert/Alert';
import AlertWrapper from '../Alert/AlertWrapper';
import AddOrganization from '../organizations/AddOrganization';
import AddNewNoteModal from '../peopleProfile/contentFeed/AddNewNoteModal';
import AddDeal from '../peopleProfile/deals/AddDeal';
import AddPeople from '../peoples/AddPeople';
import AddNewActivityModal from '../steps/feedTypes/AddNewActivityModal';
import { useNavBarShortKey } from '../../hooks/useNavBarShortKey';
import { useNewPermissionContext } from '../../contexts/newPermissionContext';
import { Button, ListGroup, ListGroupItem } from 'react-bootstrap';
import pipelineServices from '../../services/pipeline.services';
import Loading from '../Loading';
import useIsTenant from '../../hooks/useIsTenant';

const DropdownChildren = ({ item, className, moduleMap }) => {
  return (
    <div
      className={`w-100 d-flex align-items-center justify-content-between text-block px-2 ${className}`}
    >
      <div>
        <i className="material-icons-outlined list-group-icon mr-2">
          {item.icon}
        </i>
        <span className="font-weight-medium">
          {item.title === 'Pipeline'
            ? moduleMap.deal.singular
            : item.title === 'Company'
            ? moduleMap.organization.singular
            : item.title === 'Contact'
            ? moduleMap.contact.singular
            : item.title === 'Task'
            ? moduleMap.task.singular
            : item.title === 'Call'
            ? moduleMap.call.singular
            : item.title === 'Event'
            ? moduleMap.event.singular
            : item.title}
        </span>
      </div>
    </div>
  );
};

const NavbarFilters = (data) => {
  const [openDeal, setOpenDeal] = useState(false);
  const context = useNewPermissionContext();
  const [openOrganization, setOpenOrganization] = useState(false);
  const [openActivity, setOpenActivity] = useState(false);
  const [openTask, setOpenTask] = useState(false);
  const [openEvent, setOpenEvent] = useState(false);
  const [openPeople, setOpenPeople] = useState(false);
  const [openNote, setOpenNote] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openList, setOpenList] = useState(false);
  const [pipelineId, setPipelineId] = useState('');
  const [me, setMe] = useState(null);
  const [optionList, setOptionList] = useState();
  const [permissionCheck, setPermissionCheck] = useState({});
  const [getPipelinesData, setGetPipelinesData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { tenant } = useTenantContext();
  const isSynovus = useIsTenant().isSynovusBank;
  const moduleMap = data.moduleMap;
  const options = [
    {
      title: isSynovus ? 'Insights' : 'Company',
      icon: 'business',
      tenantModule: 'companies',
      shortcut: 'O',
      permission: { collection: 'contacts', action: 'create' },
      callbackFunction: setOpenOrganization,
      component: <></>,
    },
    {
      title: 'Contact',
      icon: 'person',
      tenantModule: 'contacts',
      shortcut: 'P',
      permission: { collection: 'contacts', action: 'create' },
      callbackFunction: setOpenPeople,
      component: <></>,
    },
    {
      title: 'Pipeline',
      tenantModule: 'pipelines',
      permission: { collection: 'deals', action: 'create' },
      icon: 'monetization_on',
      shortcut: 'D',
      callbackFunction: setOpenDeal,
      component: <></>,
      childern: getPipelinesData,
    },
    {
      title: 'Task',
      icon: 'task',
      tenantModule: 'activities',
      shortcut: 'T',
      btnType: 'task',
      permission: { collection: 'activities', action: 'create' },
      callbackFunction: setOpenTask,
      component: <></>,
    },
    {
      title: 'Event',
      icon: 'event',
      shortcut: 'E',
      tenantModule: 'activities',
      btnType: 'event',
      permission: { collection: 'activities', action: 'create' },
      callbackFunction: setOpenEvent,
      component: <></>,
    },
    {
      title: 'Call',
      icon: 'phone',
      tenantModule: 'activities',
      shortcut: 'C',
      btnType: 'call',
      permission: { collection: 'activities', action: 'create' },
      callbackFunction: setOpenActivity,
      component: <></>,
    },

    {
      title: 'Note',
      icon: 'text_snippet',
      tenantModule: 'crm',
      shortcut: 'N',
      permission: { collection: 'notes', action: 'create' },
      callbackFunction: setOpenNote,
      component: <></>,
    },
  ];

  options.forEach((opt) => {
    useNavBarShortKey(['shift', opt.shortcut.toLowerCase()], () =>
      opt.callbackFunction(true)
    );
  });
  useEffect(() => {
    const getCurrentUser = async () => {
      const self = await userService
        .getUserInfo()
        .catch((err) => console.error(err));

      setMe(self);
    };

    getCurrentUser();
    const listData = options.filter((el) => {
      return isModuleAllowed(tenant.modules, el.tenantModule);
    });
    setOptionList(listData);
  }, []);

  const renderIcon = () => {
    return (
      <span className="material-icons-outlined border-0">
        {openList ? 'close' : 'add'}
      </span>
    );
  };
  const checkPermissions = () => {
    const permissionData = context?.permissionChanges?.find((item) => {
      return options.some((child) => {
        return (
          child.permission.collection === item.collection &&
          child.permission.action === item.action
        );
      });
    });

    if (permissionData) {
      setPermissionCheck(permissionData);
    }

    return options.filter((child) => {
      return (
        child.permission.collection === permissionData?.collection &&
        child.permission.action === permissionData.action
      );
    });
  };
  useEffect(() => {
    checkPermissions();
  }, [context.permissionChanges]);
  const handleGetPipelineId = (id) => {
    setOpenDeal(true);
    setPipelineId(id);
  };
  const handleClick = () => {
    getPipelines();
    setOpenList(true);
  };
  const getPipelines = async () => {
    setIsLoading(true);
    try {
      const { data } = await pipelineServices.getPipelines();
      const pipelineArray = data?.map((item, i) => {
        const { name, ...rest } = item;
        return {
          title: name,
          permission: { collection: 'deals', action: 'create' },
          shortcut: i,
          tenantModule: 'deals',
          icon: 'monetization_on',
          callbackFunction: () => handleGetPipelineId(item),
          ...rest,
        };
      });
      const nevOptions = optionList?.map((item) => ({
        ...item,
        ...(item.title === 'Pipeline' && { children: pipelineArray }),
      }));
      setGetPipelinesData(nevOptions);
    } catch (error) {
      setErrorMessage('Error fetching pipelines:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const loader = () => {
    if (isLoading) return <Loading />;
  };
  return (
    <>
      {openDeal && (
        <AddDeal
          className="btn-transparent"
          setOpenDeal={setOpenDeal}
          openDeal={openDeal}
          setOpenList={setOpenList}
          errorMessage={errorMessage}
          pipeline={pipelineId}
          setErrorMessage={setErrorMessage}
          successMessage={successMessage}
          setSuccessMessage={setSuccessMessage}
          fromNavbar={true}
        />
      )}
      {openPeople && (
        <AddPeople
          openPeople={openPeople}
          setOpenPeople={setOpenPeople}
          setOpenList={setOpenList}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          successMessage={successMessage}
          setSuccessMessage={setSuccessMessage}
          fromNavbar={true}
        />
      )}

      {openOrganization && (
        <AddOrganization
          moduleMap={moduleMap.organization.singular}
          openOrganization={openOrganization}
          setOpenOrganization={setOpenOrganization}
          setOpenList={setOpenList}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          successMessage={successMessage}
          setSuccessMessage={setSuccessMessage}
          fromNavbar={true}
          me={me}
        />
      )}

      {openActivity && (
        <AddNewActivityModal
          call={moduleMap.call.singular}
          openActivity={openActivity}
          setOpenActivity={setOpenActivity}
          setOpenList={setOpenList}
          btnType={'call'}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          successMessage={successMessage}
          setSuccessMessage={setSuccessMessage}
          fromNavbar={true}
          shortcut="shift+c"
        />
      )}
      {openTask && (
        <AddNewActivityModal
          task={moduleMap.task.singular}
          openActivity={openTask}
          setOpenActivity={setOpenTask}
          setOpenList={setOpenList}
          btnType={'task'}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          successMessage={successMessage}
          setSuccessMessage={setSuccessMessage}
          fromNavbar={true}
          shortcut="shift+t"
        />
      )}
      {openEvent && (
        <AddNewActivityModal
          event={moduleMap.event.singular}
          openActivity={openEvent}
          setOpenActivity={setOpenEvent}
          setOpenList={setOpenList}
          btnType={'event'}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          successMessage={successMessage}
          setSuccessMessage={setSuccessMessage}
          fromNavbar={true}
          shortcut="shift+e"
        />
      )}
      {openNote && (
        <AddNewNoteModal
          openNote={openNote}
          setOpenNote={setOpenNote}
          setOpenList={setOpenList}
          fromNavbar={true}
        />
      )}
      {isPermissionAllowed(
        permissionCheck?.collection,
        permissionCheck?.action
      ) && (
        <div>
          {optionList.length > 0 ? (
            <Button
              className="btn btn-icon btn-sm rounded-circle dropdown-hide-arrow"
              variant="success"
              onClick={() => handleClick()}
            >
              {renderIcon()}
            </Button>
          ) : (
            ''
          )}
        </div>
      )}
      <RightPanelModal
        showModal={openList}
        setShowModal={() => setOpenList(false)}
        showOverlay={true}
        containerBgColor={'pb-0'}
        containerWidth={'480px'}
        containerPosition={'position-fixed'}
        headerBgColor="bg-gray-5"
        Title={
          <div className="d-flex py-2 align-items-center text-capitalize">
            <h3 className="mb-0">Create New Record</h3>
          </div>
        }
      >
        {!isLoading ? (
          <ListGroup className="px-1">
            {getPipelinesData?.map((item) => {
              const { component, ...restProps } = item;
              return (
                <>
                  {item?.permission ? (
                    <ListGroupItem
                      key={item.shortcut}
                      className={`cr-p border-left-0 border-right-0 ${
                        item.title === 'Pipeline' ? 'px-0 pb-0' : ''
                      }`}
                      onClick={() => {
                        setOpenList(false);
                        item.callbackFunction(true);
                      }}
                    >
                      {isPermissionAllowed(
                        item.permission.collection,
                        item.permission.action
                      ) && (
                        <>
                          {React.cloneElement(
                            component,
                            {
                              errorMessage,
                              setErrorMessage,
                              successMessage,
                              setSuccessMessage,
                              fromNavbar: true,
                              ...restProps,
                            },
                            <>
                              {' '}
                              {moduleMap.deal && (
                                <DropdownChildren
                                  moduleMap={moduleMap}
                                  item={item}
                                  className={`${
                                    item.title === 'Pipeline'
                                      ? 'pl-4 ml-1 pb-2'
                                      : ''
                                  }`}
                                />
                              )}
                            </>
                          )}
                          <>
                            {item?.children?.map((child, i) => {
                              return (
                                <ListGroupItem
                                  key={child?.shortcut}
                                  className={`cr-p border-left-0 border-right-0 pl-5 ${
                                    i === item?.children?.length - 1
                                      ? 'border-bottom-0'
                                      : ''
                                  }`}
                                  onClick={() => {
                                    setOpenList(false);
                                    child.callbackFunction(true);
                                  }}
                                >
                                  <DropdownChildren
                                    moduleMap={moduleMap.deal.singular}
                                    item={child}
                                  />
                                </ListGroupItem>
                              );
                            })}
                          </>
                        </>
                      )}
                    </ListGroupItem>
                  ) : (
                    <ListGroupItem
                      key={item.shortcut}
                      className="cr-p border-left-0 border-right-0 "
                      onClick={() => {
                        setOpenList(false);
                        item.callbackFunction(true);
                      }}
                    >
                      {React.cloneElement(
                        component,
                        {
                          errorMessage,
                          setErrorMessage,
                          successMessage,
                          setSuccessMessage,
                          fromNavbar: true,
                          ...restProps,
                        },
                        <DropdownChildren
                          moduleMap={moduleMap.deal.singular}
                          item={item}
                        />
                      )}
                    </ListGroupItem>
                  )}
                </>
              );
            })}
          </ListGroup>
        ) : (
          loader()
        )}
      </RightPanelModal>
      <AlertWrapper>
        <Alert
          message={errorMessage}
          setMessage={setErrorMessage}
          color="danger"
        />
        <Alert
          message={successMessage}
          setMessage={setSuccessMessage}
          color="success"
        />
      </AlertWrapper>
    </>
  );
};

export default NavbarFilters;
