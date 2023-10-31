import React, { useEffect, useReducer, useState } from 'react';
import { Nav } from 'react-bootstrap';

import './style.css';
import { initialStateDomain, reducer, domainFilters } from './constants';
import { useFilterProspectContext } from '../../../contexts/filterProspectContext';
import FilterItemMenu from './common/FilterItemMenu';
import { getKeysWithData } from '../../../utils/Utils';
import _ from 'lodash';

import { useLocation } from 'react-router';

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}
const MenuDomain = ({ chargeFilter, saveFilter, loadFilter }) => {
  const query = useQuery();
  const flag = query.get('back');
  const { globalFiltersDomain, setGlobalFiltersDomain } =
    useFilterProspectContext();
  const [data, dispatch] = useReducer(reducer, initialStateDomain);
  const [showClear, setShowClear] = useState(false);
  const [active, setActive] = useState(null);
  const [firstRender, setFirstRender] = useState(false);

  const onSubmit = async () => {
    const filters = getKeysWithData(data);
    if (Object.keys(filters).length) {
      setShowClear(true);
      setFirstRender(true);
      chargeFilter(filters);
      setGlobalFiltersDomain(data);
    } else {
      chargeFilter({}, 'LOAD');
      setShowClear(false);
      setFirstRender(true);
      dispatch({ type: 'set', payload: initialStateDomain });
      setGlobalFiltersDomain({});
    }
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
      dispatch({ type: 'set', payload: globalFiltersDomain });
    } else {
      setGlobalFiltersDomain(initialStateDomain);
    }
  }, []);

  useEffect(() => {
    setGlobalFiltersDomain(data);
    setFirstRender(true);
  }, [data]);

  useEffect(() => {
    // if we get load filter from parent component then dispatch updated filters list to show in filter menu
    dispatch({ type: 'set', payload: globalFiltersDomain });
    const filters = getKeysWithData(globalFiltersDomain);
    setShowClear(!_.isEmpty(filters));
    setFirstRender(true);
  }, [loadFilter]);

  return (
    <div>
      <Nav className="flex-column">
        {domainFilters.map((name) => (
          <Nav.Link as="div" key={name} className={`p-0`}>
            <FilterItemMenu
              title={name}
              data={data}
              setData={dispatch}
              onEnter={onEnter}
              active={active}
              setActive={setActive}
            />
          </Nav.Link>
        ))}
      </Nav>
    </div>
  );
};

export default MenuDomain;
