import React, { useEffect, useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import RightPanelModal from '../../../modal/RightPanelModal';
import {
  CardBody,
  Form,
  CardFooter,
  Col,
  FormGroup,
  Input,
  Label,
} from 'reactstrap';
import { useTenantContext } from '../../../../contexts/TenantContext';
import { RESOURCE_NOT_FOUND } from '../../../../utils/constants';
import MaterialIcon from '../../../commons/MaterialIcon';
import NoDataFound from '../../../commons/NoDataFound';
import Loading from '../../../Loading';
import { DropdownTreeView } from './DropdownTreeView';
import { RIGHT_PANEL_WIDTH } from '../../../../utils/Utils';
import ButtonIcon from '../../../commons/ButtonIcon';
import InputValidationAdvance from '../../../commons/InputValidationAdvance';

export const TreeViewTable = (props) => {
  const {
    data,
    closeEditModal,
    setShowReport,
    handleEditModelShow,
    editRoleData,
    handleGetRoleById,
    setEditRoleData,
    dataGet,
    setOpenEditModal,
    setIsDropdownId,
    isDropdownId,
    isLoading,
    setShowCreateGroupModal,
    openEditModal,
    setIsAddSingleRole,
    showLoading,
    register,
    handleSubmit,
    setValue,
    errors,
  } = props;
  const [isShow, setIsShow] = useState(new Set());
  const handleCollapse = (e, id) => {
    e.preventDefault();
    if (isShow.has(id)) {
      setIsShow((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      setIsShow((prev) => new Set(prev).add(id));
    }
  };
  const getParentIds = (data) => {
    const parents = [];
    data?.forEach((child) => {
      if (child.parent_id) {
        parents.push(child.parent_id);
      }
      if (child.children && child.children.length > 0) {
        const childParents = getParentIds(child.children);
        parents.push(...childParents);
      }
    });
    return parents;
  };

  useEffect(() => {
    if (data) {
      const parentIds = getParentIds(data.children);
      parentIds.forEach((id) => {
        setIsShow((prev) => new Set(prev.add(id)));
      });
    }
  }, [data]);
  const handleAddSingleRole = (item) => {
    setShowCreateGroupModal(true);
    setIsAddSingleRole(item);
  };
  const loader = () => {
    if (showLoading) return <Loading />;
  };
  const { tenant } = useTenantContext();
  const Title = () => {
    return <div className="text-gray-search">{RESOURCE_NOT_FOUND}</div>;
  };
  const display = (parent) => {
    return (
      <>
        {showLoading ? (
          loader()
        ) : (
          <>
            {parent?.length > 0 &&
              parent.map((item, i) => {
                return (
                  <>
                    <div
                      key={`treeView_${i}`}
                      className={`${
                        isShow.has(item.id) ? 'show_border' : 'dnt_show_border'
                      } 
                  ${
                    item.children?.length > 0 ? '' : 'no-children-h-main'
                  } main-body-hh`}
                    >
                      <div
                        className={`${
                          isShow.has(item.id)
                            ? 'show_minus_icon btn_hover_show'
                            : 'show_plus_icon btn_hover_show'
                        }
                  ${
                    item.children?.length > 0
                      ? ''
                      : 'no-children-h btn_hover_show'
                  }
                  ${
                    isShow.has(item.children) ? '' : 'children-hh'
                  } btn_hover_show hover-actions main-row-hh table-tree-tbody-row`}
                      >
                        <div
                          className=" table-tree-body-cell"
                          onClick={(e) => handleCollapse(e, item.id)}
                        >
                          <span className="d-inline-block">{item.name}</span>
                        </div>
                        <div className="usersCount table-tree-body-cell">
                          {item.children?.length}
                        </div>
                        <div className="peerDataVisibility table-tree-body-cell">
                          {item.has_sibling_access === true ? 'Yes' : 'No'}
                        </div>
                        <div className="table-tree-body-cell">
                          <div className="d-flex action-items align-items-center gap-2">
                            <a
                              href=""
                              className="icon-hover-bg"
                              onClick={(e) => {
                                e.preventDefault();
                                handleAddSingleRole(item);
                              }}
                            >
                              <MaterialIcon icon="add" />
                            </a>
                            <a
                              href=""
                              className="icon-hover-bg"
                              onClick={(e) => {
                                e.preventDefault();
                                handleEditModelShow(item);
                              }}
                            >
                              <MaterialIcon icon="edit" />
                            </a>
                            {item.parent_id === null ? (
                              <></>
                            ) : (
                              <a
                                href=""
                                className="icon-hover-bg"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setShowReport(item);
                                }}
                              >
                                <MaterialIcon icon="delete" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {isShow.has(item.id) && (
                        <>
                          {item.children?.length > 0 && item.id ? (
                            <div className="child py-0 pl-3">
                              <div className="main-body-hh">
                                {isShow.has(item.id) && display(item.children)}
                              </div>
                            </div>
                          ) : (
                            ''
                          )}
                        </>
                      )}
                    </div>
                  </>
                );
              })}
          </>
        )}
      </>
    );
  };
  return (
    <div className="" id="no-more-tables">
      <div className="table-tree">
        <div className="active table-tree-thead-row">
          <div className="table-head-cell">
            {tenant.name}{' '}
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id={`tooltip-badge`}>
                  Roles help you define a hierarchy of access levels to records
                  in your organization. Users can&nbsp;only see the records of
                  other users below them in the role hierarchy.
                </Tooltip>
              }
            >
              <MaterialIcon icon={'info'} clazz="mx-1" />
            </OverlayTrigger>
          </div>
          <div className="table-head-cell">No. of Users</div>
          <div className="table-head-cell">Peer Data Visibility</div>
          <div className="table-head-cell"></div>
        </div>
        <div className="main-body-hh-table-body">
          {[data].length > 0 ? (
            display([data])
          ) : (
            <NoDataFound
              icon="account_tree"
              containerStyle="text-gray-search my-6 py-6"
              title={<Title />}
            />
          )}
        </div>
      </div>
      <RightPanelModal
        Title={'Edit Role'}
        onHandleCloseModal={() => closeEditModal()}
        showModal={openEditModal}
        allowCloseOutside={false}
        setShowModal={setOpenEditModal}
        showOverlay={true}
        containerBgColor={'pb-0'}
        containerWidth={RIGHT_PANEL_WIDTH}
        containerPosition={'position-fixed'}
        headerBgColor="bg-gray-5"
      >
        <CardBody>
          <Form>
            <div>
              <InputValidationAdvance
                fieldType="text"
                type="input"
                label="Role Name"
                name="name"
                id="group_name"
                classNames={`border-left-4 border-left-danger`}
                className="mt-2 mb-2"
                value={editRoleData}
                errors={errors}
                placeholder="Role Name"
                validationConfig={{
                  required: true,
                  inline: false,
                  onChange: (e) => {
                    setEditRoleData({
                      ...editRoleData,
                      name: e.target.value,
                    });
                    setValue(name, e.target.value);
                  },
                }}
                register={register}
              />
              {dataGet.parent_id !== null && (
                <FormGroup row>
                  <Label htmlFor="" md={3} className="form-label text-right">
                    Reports to
                  </Label>
                  <Col md={9} className="pl-0">
                    <DropdownTreeView
                      editRoleData={dataGet}
                      reportTo={editRoleData}
                      isDropdownId={isDropdownId}
                      setIsDropdownId={setIsDropdownId}
                      data={data}
                    />
                  </Col>
                </FormGroup>
              )}
              <FormGroup row className="mx-0">
                <Label
                  md={9}
                  htmlFor="has_sibling_access"
                  className="form-label ml-auto"
                >
                  <Input
                    type="checkbox"
                    name="has_sibling_access"
                    id="has_sibling_access"
                    value={editRoleData?.has_sibling_access}
                    checked={editRoleData?.has_sibling_access}
                    onChange={() =>
                      setEditRoleData({
                        ...editRoleData,
                        has_sibling_access: !editRoleData?.has_sibling_access,
                      })
                    }
                  />{' '}
                  <span className="font-weight-normal">
                    {' '}
                    Let users in this role see each other&apos;s data
                  </span>
                </Label>
              </FormGroup>
              <InputValidationAdvance
                fieldType="text"
                type="textarea"
                label="Description"
                name="description"
                id="description"
                classNames={`border-left-4 border-left-danger`}
                className="mt-2 mb-2"
                value={editRoleData}
                errors={errors}
                rows={3}
                placeholder="A few words about this role"
                validationConfig={{
                  required: true,
                  inline: false,
                  onChange: (e) => {
                    setEditRoleData({
                      ...editRoleData,
                      description: e.target.value,
                    });
                    setValue(name, e.target.value);
                  },
                }}
                register={register}
              />
            </div>
          </Form>
        </CardBody>
        <CardFooter className="text-right">
          <ButtonIcon
            label="Cancel"
            type="button"
            color="white"
            classnames="btn-white mx-1 btn-sm"
            onclick={closeEditModal}
          />
          <ButtonIcon
            classnames="btn-sm"
            type="button"
            onclick={handleSubmit(handleGetRoleById)}
            label={'Update'}
            color={`primary`}
            loading={isLoading}
          />
        </CardFooter>
      </RightPanelModal>
    </div>
  );
};
