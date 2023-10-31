import React, { useState } from 'react';
import classnames from 'classnames';
import { Button, Card, Col, Nav, NavItem, NavLink, Row } from 'react-bootstrap';
import {
  Badge,
  Input,
  FormGroup,
  Label,
  TabContent,
  TabPane,
} from 'reactstrap';
import MaterialIcon from '../commons/MaterialIcon';
import Heading from '../heading';
import { SidePenalWorkFlow } from './SidePenalWorkFlow';
import ConditionsFields from './conditionsFields';

const WorkFlowTab = [
  {
    id: '1',
    name: 'On a Record Action',
    icon: 'group_add',
  },
  {
    id: '2',
    name: 'On a Date/Time',
    icon: 'clock',
  },
];

const TabWorkFlow = ({ activeTab, toggle, tab }) => {
  return (
    <NavItem className="tab-title z-index-99 py-0">
      <NavLink
        className={`pt-1 pb-2 fw-bold ${classnames({
          active: activeTab === tab.id,
        })}`}
        onClick={() => {
          toggle(tab.id);
        }}
      >
        {tab.name}
      </NavLink>
    </NavItem>
  );
};

export const WorkFlowDetail = () => {
  const [isExpendData, setIsExpendData] = useState('');
  const [activeTab, setActiveTab] = useState('1');
  const [isFieldName, setIsFieldName] = useState('');
  const [isDescription, setIsDescription] = useState(false);
  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };
  const [modal, setModal] = useState(false);

  const handleModel = (item) => {
    setModal(!modal);
    setIsFieldName(item);
  };
  return (
    <>
      <div>
        <Row>
          <Col md={6}>
            <div className="d-flex align-items-center justify-content-start">
              <MaterialIcon icon="west" clazz="font-size-2xl cursor-pointer" />
              <Input
                type="text"
                placeholder="workflow Name"
                className="w-50 ml-3"
                onChange={''}
              />
              <div>
                <MaterialIcon
                  icon="lock"
                  clazz="font-size-xl cursor-pointer ml-3"
                />
                <Badge bg="success" className="ml-3 font-size-md" pill>
                  Info
                </Badge>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col md={isExpendData ? 9 : 6}>
            <div className="container">
              <div className="pl-4">
                {!isDescription ? (
                  <h5
                    className="mt-3 text-primary cursor-pointer"
                    onClick={() => setIsDescription(true)}
                  >
                    <MaterialIcon
                      icon="add"
                      clazz="font-size-xl cursor-pointer"
                    />{' '}
                    Description
                  </h5>
                ) : (
                  <textarea
                    className="form-control mt-3 ml-1"
                    rows={5}
                  ></textarea>
                )}
                <Card className="mt-5 workflow_box">
                  <Card.Body>
                    <h3 className="d-flex align-items-center justify-content-between">
                      <span>1. Trigger</span>
                      {isExpendData !== 'trigger' && (
                        <MaterialIcon
                          onClick={() => setIsExpendData('trigger')}
                          icon="edit"
                          clazz="font-size-xl cursor-pointer edit_workflow icon-circle p-2 text-success"
                        />
                      )}
                    </h3>
                    {isExpendData !== 'trigger' && (
                      <p>
                        Trigger this workflow when a deal is
                        <span className="font-weight-bold text-primary">
                          {' '}
                          Created or Edited
                        </span>
                      </p>
                    )}
                    {isExpendData === 'trigger' && (
                      <div>
                        <Heading
                          title="Users and Controls"
                          useBc
                          showGreeting={false}
                        >
                          <Nav tabs>
                            {WorkFlowTab.map((tab, index) => (
                              <TabWorkFlow
                                key={index}
                                activeTab={activeTab}
                                toggle={toggle}
                                tab={tab}
                              />
                            ))}
                          </Nav>
                        </Heading>
                        <TabContent activeTab={activeTab}>
                          <TabPane className="position-relative" tabId={'1'}>
                            <p className="mt-3">
                              Trigger this workflow when a deal is{' '}
                              <span className="text-primary font-weight-bold">
                                Created
                              </span>
                            </p>
                            <FormGroup tag="fieldset">
                              <FormGroup check>
                                <Label check>
                                  <Input type="radio" name="radio1" />
                                  <span className="font-size-md">Created</span>
                                </Label>
                              </FormGroup>
                              <FormGroup check>
                                <Label check>
                                  <Input type="radio" name="radio1" />
                                  <span className="font-size-md">
                                    Created Or Edited
                                  </span>
                                </Label>
                              </FormGroup>
                              <FormGroup check>
                                <Label check>
                                  <Input type="radio" name="radio1" />
                                  <span className="font-size-md">Edited</span>
                                </Label>
                              </FormGroup>
                            </FormGroup>
                            <Card.Footer className="text-right pb-0 mt-3">
                              <Button
                                type="button"
                                onClick={() => setIsExpendData(false)}
                              >
                                Done
                              </Button>
                            </Card.Footer>
                          </TabPane>
                          <TabPane
                            className="position-relative"
                            tabId={'2'}
                          ></TabPane>
                        </TabContent>
                      </div>
                    )}
                  </Card.Body>
                </Card>
                <Card className="mt-5 workflow_box step-2">
                  <Card.Body>
                    <h3 className="d-flex align-items-center justify-content-between">
                      <span>2. Conditions</span>
                      {isExpendData !== 'conditions' && (
                        <MaterialIcon
                          onClick={() => setIsExpendData('conditions')}
                          icon="edit"
                          clazz="font-size-xl cursor-pointer edit_workflow icon-circle p-2 text-success"
                        />
                      )}
                    </h3>
                    {isExpendData !== 'conditions' && (
                      <p className="d-flex align-items-center">
                        <span className="count">1</span>
                        <span className="text-primary ml-3">
                          {' '}
                          Amount
                          {' >= '} 1000
                        </span>
                      </p>
                    )}
                    {isExpendData === 'conditions' && (
                      <div>
                        <h5>
                          Which Deals would you like to apply the workflow to?
                        </h5>
                        <div className="d-flex align-items-center mb-4">
                          <FormGroup check>
                            <Label check>
                              <Input type="radio" name="radio1" />
                              <span className="font-size-md">
                                Deals matching certain conditions
                              </span>
                            </Label>
                          </FormGroup>
                          <FormGroup check className="ml-3">
                            <Label check>
                              <Input type="radio" name="radio1" />
                              <span className="font-size-md">All Deals</span>
                            </Label>
                          </FormGroup>
                        </div>
                        <ConditionsFields />
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <div className="container">
              <div className="pl-4">
                <Card className="mt-5 step-2">
                  <Card.Body>
                    <h3>3. Actions</h3>
                    <div className="border-bottom py-2">
                      <h6
                        className="cursor-pointer"
                        onClick={() => handleModel('Create Email Notification')}
                      >
                        <MaterialIcon
                          icon="add"
                          clazz="font-size-xl cursor-pointer text-primary"
                        />{' '}
                        Email Notification
                      </h6>
                    </div>
                    <div className="border-bottom py-2">
                      <h6
                        className="cursor-pointer"
                        onClick={() => handleModel('Add WorkFlow Task')}
                      >
                        <MaterialIcon
                          icon="add"
                          clazz="font-size-xl cursor-pointer text-primary"
                        />{' '}
                        Task
                      </h6>
                    </div>
                    <div className="py-2">
                      <h6
                        className="cursor-pointer"
                        onClick={() => handleModel('Update Field')}
                      >
                        <MaterialIcon
                          icon="add"
                          clazz="font-size-xl cursor-pointer text-primary"
                        />{' '}
                        Update Field
                      </h6>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </Col>
          <Col md={5} className="pl-1">
            <Card className="mt-5 step-3">
              <Card.Body>
                <h3>
                  <MaterialIcon icon="task_alt" /> Scheduled Actions
                </h3>
                <div className="border-bottom py-2">
                  <h6
                    className="cursor-pointer"
                    onClick={() => handleModel('Create Email Notification')}
                  >
                    <MaterialIcon
                      icon="add"
                      clazz="font-size-xl cursor-pointer text-primary"
                    />{' '}
                    Email Notification
                  </h6>
                </div>
                <div className="border-bottom py-2">
                  <h6
                    className="cursor-pointer"
                    onClick={() => handleModel('Add WorkFlow Task')}
                  >
                    <MaterialIcon
                      icon="add"
                      clazz="font-size-xl cursor-pointer text-primary"
                    />{' '}
                    Task
                  </h6>
                </div>
                <div className="py-2">
                  <h6
                    className="cursor-pointer"
                    onClick={() => handleModel('Update Field')}
                  >
                    <MaterialIcon
                      icon="add"
                      clazz="font-size-xl cursor-pointer text-primary"
                    />{' '}
                    Update Field
                  </h6>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
      <SidePenalWorkFlow
        showSelectComponentModal={modal}
        setShowSelectComponentModal={setModal}
        isFieldName={isFieldName}
      />
    </>
  );
};
