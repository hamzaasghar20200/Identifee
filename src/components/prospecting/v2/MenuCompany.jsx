import React, { useEffect, useReducer, useState } from 'react';

import './style.css';
import { orgFilters, initialStateCompany, reducer } from './constants';
import ButtonIcon from '../../commons/ButtonIcon';
import { useFilterProspectContext } from '../../../contexts/filterProspectContext';
import FilterItemMenuCompany from './common/FilterItemMenuCompany';
import { getKeysWithData } from '../../../utils/Utils';
import _ from 'lodash';

import { useLocation } from 'react-router';

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}
const MenuCompany = ({ chargeFilter, saveFilter, loadFilter }) => {
  const query = useQuery();
  const flag = query.get('back');
  const { globalFiltersCompany, setGlobalFiltersCompany } =
    useFilterProspectContext();
  const [data, dispatch] = useReducer(reducer, initialStateCompany);
  const [showClear, setShowClear] = useState(false);
  const [active, setActive] = useState(null);
  const [firstRender, setFirstRender] = useState(false);

  const onSubmit = async () => {
    const filters = getKeysWithData(data);
    if (Object.keys(filters).length) {
      setShowClear(true);
      setFirstRender(true);
      chargeFilter(filters);
      setGlobalFiltersCompany(data);
    } else {
      chargeFilter({}, 'LOAD');
      setShowClear(false);
      setFirstRender(true);
      dispatch({ type: 'set', payload: initialStateCompany });
      setGlobalFiltersCompany({});
    }
  };

  const clearFilter = () => {
    setShowClear(false);
    dispatch({ type: 'set', payload: initialStateCompany });
    chargeFilter({}, 'CLEAR');
    setGlobalFiltersCompany(initialStateCompany);
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
      dispatch({ type: 'set', payload: globalFiltersCompany });
    } else {
      setGlobalFiltersCompany(initialStateCompany);
    }
  }, []);

  useEffect(() => {
    setGlobalFiltersCompany(data);
    setFirstRender(true);
  }, [data]);

  useEffect(() => {
    // if we get load filter from parent component then dispatch updated filters list to show in filter menu
    dispatch({ type: 'set', payload: globalFiltersCompany });
    const filters = getKeysWithData(globalFiltersCompany);
    setShowClear(!_.isEmpty(filters));
    setFirstRender(true);
  }, [loadFilter]);

  return (
    <div>
      <div className="flex-column">
        {orgFilters.map((name) => (
          <FilterItemMenuCompany
            title={name}
            key={name}
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

export default MenuCompany;
