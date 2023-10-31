import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardBody, Col, FormGroup, InputGroup } from 'reactstrap';
import ButtonIcon from '../../../components/commons/ButtonIcon';
import { OperatorsByType } from './dashboard.constants';
import { FormControl } from 'react-bootstrap';
import TooltipComponent from '../../../components/lesson/Tooltip';
import MaterialIcon from '../../../components/commons/MaterialIcon';
import _ from 'lodash';
import ValidationErrorText from '../../../components/commons/ValidationErrorText';
import { ActionTypes } from '../../../components/reports/reports.constants';

const FilterCriteriaRow = ({
  index,
  filter,
  total,
  addRow,
  updateRow,
  removeRow,
  dimensionList,
  isEdited,
}) => {
  const [currentFilter, setCurrentFilter] = useState({ ...filter });
  const [, setSelectedDimension] = useState({});
  const [operators, setOperators] = useState([]);

  const loadOperatorsByDimension = (dimension) => {
    if (dimension) {
      setOperators(OperatorsByType[dimension.type]);
    }
  };

  const updateFilterData = (keyType, newData, title) => {
    const payLoad = {
      ...currentFilter,
      title,
      [keyType]: newData,
    };
    setCurrentFilter(payLoad);
    updateRow(ActionTypes.UPDATE, index, payLoad);
  };

  const handleChangeDimension = (dimension) => {
    const dimensionFromList = dimensionList.find(
      (d) => d.name === dimension.name
    );
    setSelectedDimension(dimension);
    updateFilterData('member', dimension.name, dimensionFromList.title);
    loadOperatorsByDimension(dimensionFromList);
  };

  const handleChangeValue = (value) => {
    const payLoad = {
      ...currentFilter,
      values: !value ? [] : [value],
    };
    delete payLoad.error;
    setCurrentFilter(payLoad);
    updateRow(ActionTypes.UPDATE, index, payLoad);
  };

  useEffect(() => {
    setCurrentFilter(filter);
  }, [filter]);

  useEffect(() => {
    const dimensionFromList = dimensionList.find(
      (d) => d.name === currentFilter.member
    );
    loadOperatorsByDimension(dimensionFromList);
  }, [isEdited, dimensionList]);

  return (
    <>
      <div className="d-flex align-items-center py-1">
        <span style={{ width: '3%' }}>{index + 1}.</span>
        <InputGroup className="flex-grow-1 ml-1 align-items-center">
          <select
            className="form-control font-size-sm"
            style={{ width: '25%' }}
            value={currentFilter?.member}
            onChange={(e) => handleChangeDimension({ name: e.target.value })}
          >
            <option value="">Select property</option>
            {dimensionList.map((ms, index) => (
              <option key={index} value={ms.name}>
                {ms.title}
              </option>
            ))}
          </select>
          <select
            className="form-control font-size-sm"
            style={{ width: '20%' }}
            value={currentFilter?.operator}
            onChange={(e) => {
              updateFilterData('operator', e.target.value, currentFilter.title);
            }}
          >
            <option value="">Select operator</option>
            {operators?.map((ms, index) => (
              <option key={index} value={ms.name}>
                {_.startCase(ms.title)}
              </option>
            ))}
          </select>
          {filter.operator !== 'notSet' && (
            <FormControl
              style={{ width: '45%' }}
              placeholder="Enter Value"
              value={currentFilter?.values[0]}
              onChange={(e) => handleChangeValue(e.target.value)}
              className="rounded-right"
            />
          )}
          <div
            className="d-flex align-items-center"
            style={{ width: filter.operator !== 'notSet' ? '7%' : '53%' }}
          >
            {index >= 0 && (
              <TooltipComponent title="Remove">
                <a onClick={removeRow} className="cursor-pointer">
                  <MaterialIcon icon="delete" clazz="ml-2 text-danger" />
                </a>
              </TooltipComponent>
            )}
            {total - 1 === index && (
              <TooltipComponent title="Add">
                <a onClick={addRow} className="cursor-pointer">
                  <MaterialIcon icon="add_circle" clazz="ml-2 text-success" />
                </a>
              </TooltipComponent>
            )}
          </div>
        </InputGroup>
      </div>
      {currentFilter?.error && (
        <ValidationErrorText
          text={currentFilter.error}
          extraClass="mb-2 ml-4"
        />
      )}
    </>
  );
};

const ComponentFilterCriteria = ({
  dimensionList,
  componentFormData,
  updateFormData,
  isEdited,
}) => {
  const [show, setShow] = useState(false);
  const [filters, setFilters] = useState([
    ...componentFormData.analytic.filters,
  ]);

  useEffect(() => {
    if (componentFormData?.analytic?.filters?.length) {
      setShow(true);
    }
  }, []);

  useEffect(() => {
    setFilters([...componentFormData.analytic.filters]);
  }, [componentFormData]);

  const handleFilterCriteria = (type, index, payload) => {
    let newArr = [];
    const defaultCriteria = {
      id: uuidv4(),
      member: '',
      title: '',
      values: [],
      operator: '',
    };
    switch (type) {
      case ActionTypes.ADD:
        setShow(true);
        newArr = [...filters, defaultCriteria];
        setFilters(newArr);
        updateFormData('analytic', 'filters', newArr);
        break;
      case ActionTypes.UPDATE:
        newArr = [...filters].map((filter) =>
          filter.id === payload.id ? payload : filter
        );
        setFilters(newArr);
        updateFormData('analytic', 'filters', newArr);
        break;
      case ActionTypes.REMOVE:
        setShow(true);
        newArr = [...filters];
        newArr.splice(index, 1);
        setFilters(newArr);
        updateFormData('analytic', 'filters', newArr);
        if (newArr.length === 0) {
          handleFilterCriteria(ActionTypes.CLEAR);
        }
        break;
      default:
        setShow(!show);
        setFilters([]);
        updateFormData('analytic', 'filters', []);
        break;
    }
  };

  return (
    <>
      {!show && (
        <FormGroup row>
          <Col md={9} className="pl-0 offset-3">
            <ButtonIcon
              color="link"
              icon="add"
              onclick={() => handleFilterCriteria(ActionTypes.ADD)}
              label="Criteria filter"
              classnames="border-0 px-0"
            />
          </Col>
        </FormGroup>
      )}
      {show && (
        <FormGroup row>
          <Col md={12}>
            <Card className="bg-gray-200 rounded-sm px-3">
              <div className="d-flex align-items-center pt-2">
                <h5 className="mb-0">Criteria</h5>
                <ButtonIcon
                  color="link"
                  onclick={() => handleFilterCriteria(ActionTypes.CLEAR)}
                  label="Remove"
                  classnames="border-0 px-0 fs-7 ml-2"
                />
              </div>
              <CardBody className="px-0 pt-2">
                {filters.map((filter, index) => (
                  <FilterCriteriaRow
                    key={filter.id}
                    index={index}
                    filter={filter}
                    total={filters.length}
                    addRow={() => handleFilterCriteria(ActionTypes.ADD)}
                    updateRow={handleFilterCriteria}
                    removeRow={() =>
                      handleFilterCriteria(ActionTypes.REMOVE, index)
                    }
                    dimensionList={dimensionList}
                    isEdited={isEdited}
                  />
                ))}
              </CardBody>
            </Card>
          </Col>
        </FormGroup>
      )}
    </>
  );
};

export default ComponentFilterCriteria;
