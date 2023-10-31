import React, { useState, useEffect } from 'react';
import { FormControl, Form } from 'react-bootstrap';
import { useHistory } from 'react-router';
import { CardButton } from '../../layouts/CardLayout';
import usersOutlined from '../../../assets/svg/users-outlined.svg';
import prospectService from '../../../services/prospect.service';
import ProspectCard from './ProspectCard';
import _ from 'lodash';
import LookupPeopleLoader from '../../loaders/LookupPeople';
import routes from '../../../utils/routes.json';
import { clearMenuSelection, overflowing } from '../../../utils/Utils';
import { ProspectTypes } from '../../prospecting/v2/constants';

const LookupPeople = ({ profileInfo = {} }) => {
  const history = useHistory();
  const limit = 4;
  const [prospects, setProspects] = useState([]);
  const [pagination, setPagination] = useState({ total: 0 });
  const [matchFound, setMatchFound] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchProspect, setSearchProspect] = useState('');
  const [onlySearchOrganizationProspects, setOnlySearchOrganizationProspects] =
    useState(true);
  const [filter, setFilter] = useState({
    name: `${
      profileInfo.name || profileInfo.first_name + ' ' + profileInfo.last_name
    }`,
  });

  const getCompanyFilter = (companyFilter) => {
    if (onlySearchOrganizationProspects) {
      return companyFilter;
    }
    return {
      name: [filter.name],
    };
  };

  useEffect(() => {
    if (_.has(profileInfo, 'naics_code') && searchProspect === '') {
      // if this is a company profile we are opening the lookup panel,
      // then lets look employees within the company, ignore for search
      getEmployees(
        getCompanyFilter({
          current_employer: [`"${filter.name}"`],
        })
      );
    } else {
      // get contacts with similar name
      if (profileInfo.organization) {
        const companyFilter = getCompanyFilter({
          current_employer: [`"${profileInfo.organization.name}"`],
        });
        getContact({
          name: [filter.name],
          ...companyFilter,
        });
      } else {
        if (onlySearchOrganizationProspects) {
          getEmployees(
            getCompanyFilter({
              name: [searchProspect],
              current_employer: [`"${profileInfo.name}"`],
            })
          );
        } else {
          getContact({ ...getCompanyFilter() });
        }
      }
    }
  }, [filter, onlySearchOrganizationProspects]);

  const getContact = async (opts) => {
    try {
      setLoading(true);
      const { data } = await prospectService.query(opts, {
        type: 'query',
        limit,
      });
      setProspects(data?.data);
      setPagination(data?.pagination);
      setMatchFound(data?.data.length > 0);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const getEmployees = async (opts) => {
    try {
      setLoading(true);
      const { data } = await prospectService.query(opts, {
        type: 'query',
        limit,
      });
      setProspects(data?.data);
      setPagination(data?.pagination);
      setMatchFound(data?.data.length > 0);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const onKeyEnter = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();

      if (!matchFound) {
        setOnlySearchOrganizationProspects(false);
      }
      setFilter({
        ...filter,
        current_employer: [`"${profileInfo.name}"`], // organization name
        name: [searchProspect],
      });
    }
  };

  const redirectToProspectsSearch = () => {
    overflowing();
    clearMenuSelection();
    const withCompanyId =
      profileInfo.name && profileInfo?.external_id
        ? `?id=${profileInfo?.external_id}&`
        : '?';
    history.push(
      `${routes.resources}${withCompanyId}current_employer=${profileInfo.name}&tab=${ProspectTypes.people}`
    );
  };

  const handleOnChange = () => {
    setOnlySearchOrganizationProspects(!onlySearchOrganizationProspects);
  };
  return (
    <div className="mb-3 pb-3">
      <Form className="global-search d-flex align-items-center w-100 mt-3">
        <span className="material-icons-outlined ml-3">search</span>
        <FormControl
          id="global-search-input"
          aria-label="Search"
          className="border-0 search-input"
          placeholder="Search"
          value={searchProspect || ''}
          onChange={(e) => {
            setSearchProspect(e.target.value);
            if (!matchFound) {
              setOnlySearchOrganizationProspects(false);
            }
          }}
          onKeyDown={onKeyEnter}
        />
      </Form>
      <div className="custom-control text-right pt-2 pb-3">
        <Form.Check
          type="checkbox"
          onChange={handleOnChange}
          label="Only search company prospects."
          name="onlySearchOrganizationProspects"
          className="cursor-pointer"
          checked={onlySearchOrganizationProspects}
        />
      </div>

      {!loading ? (
        <>
          {prospects?.map((prospect) => (
            <ProspectCard
              key={prospect.id}
              organization={profileInfo}
              prospect={prospect}
            />
          ))}
          {pagination?.total > 3 && (
            <CardButton
              title="Load More"
              variant="primary"
              className="mr-2 w-100"
              onClick={redirectToProspectsSearch}
            />
          )}
        </>
      ) : (
        <LookupPeopleLoader count={3} container lineCount={4} />
      )}

      {!prospects?.length && !loading && (
        <div className="mt-5">
          <img src={usersOutlined} width={72} height={72} />
          <p className="prospect-typography-h6 text-center">
            Sorry, no matching prospects. Try searching.
          </p>
        </div>
      )}
    </div>
  );
};

export default LookupPeople;
