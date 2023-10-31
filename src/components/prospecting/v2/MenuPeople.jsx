import React, { useEffect, useReducer, useState } from 'react';
import FilterItemMenu from './common/FilterItemMenu';
import './style.css';
import { filters, initialState, reducer } from './constants';
import ButtonIcon from '../../commons/ButtonIcon';
import { useFilterProspectContext } from '../../../contexts/filterProspectContext';
import { getKeysWithData } from '../../../utils/Utils';
import _ from 'lodash';
import { useLocation } from 'react-router';

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const MenuPeople = ({ chargeFilter, saveFilter, loadFilter }) => {
  const query = useQuery();
  const flag = query.get('back');
  const { globalFilters, setGlobalFilters } = useFilterProspectContext();
  const [data, dispatch] = useReducer(reducer, initialState);
  const [showClear, setShowClear] = useState(false);
  const [firstRender, setFirstRender] = useState(false);
  const [active, setActive] = useState(null);

  const onSubmit = async () => {
    const filters = getKeysWithData(data);
    if (Object.keys(filters).length) {
      setShowClear(true);
      setFirstRender(false);
      chargeFilter(filters);
      setGlobalFilters(filters);
    } else {
      chargeFilter({}, 'LOAD');
      setShowClear(false);
      setFirstRender(true);
      dispatch({ type: 'set', payload: initialState });
      setGlobalFilters({});
    }
  };

  const clearFilter = () => {
    setShowClear(false);
    dispatch({ type: 'set', payload: initialState });
    chargeFilter({}, 'CLEAR');
    setGlobalFilters(initialState);
    setActive(null);
  };

  const onEnter = () => {
    if (firstRender || showClear) {
      onSubmit();
    } else {
      setFirstRender(true);
    }

    if (firstRender) setFirstRender(false);
  };

  useEffect(() => {
    if (flag === 'true') {
      dispatch({ type: 'set', payload: globalFilters });
    } else {
      setGlobalFilters(initialState);
    }
  }, []);

  useEffect(() => {
    setGlobalFilters(data);
    setFirstRender(true);
  }, [data]);

  useEffect(() => {
    // if we get load filter from parent component then dispatch updated filters list to show in filter menu
    dispatch({ type: 'set', payload: globalFilters });
    const filters = getKeysWithData(globalFilters);
    setShowClear(!_.isEmpty(filters));
    setFirstRender(true);
  }, [loadFilter]);

  return (
    <div>
      <div className="flex-column">
        {filters.map((name) => (
          <FilterItemMenu
            key={name}
            title={name}
            data={data}
            setData={dispatch}
            onEnter={onEnter}
            active={active}
            setActive={setActive}
          />
        ))}
      </div>
      {showClear && (
        <>
          <div className="w-100 d-flex my-3">
            <ButtonIcon
              label="Clear All"
              classnames="btn-sm mx-3 fw-bold btn-block"
              color="outline-danger"
              onclick={clearFilter}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default MenuPeople;
