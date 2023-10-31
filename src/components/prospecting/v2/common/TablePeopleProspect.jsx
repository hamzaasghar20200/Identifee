import React, { forwardRef, useEffect, useState } from 'react';
import {
  Button,
  Card,
  FormControl,
  FormGroup,
  InputGroup,
} from 'react-bootstrap';

import Table from '../../../GenericTable';
import { columnsTablePeople } from '../../constants';
import MaterialIcon from '../../../commons/MaterialIcon';
import RocketReachPeopleCard from '../../../organizationProfile/overview/RocketReachPeopleCard';
import RocketReachViewInfoCard from '../../../organizationProfile/overview/RocketReachViewInfoCard';
import LookupPeopleLoader from '../../../loaders/LookupPeople';
import Skeleton from 'react-loading-skeleton';
import { useFilterProspectContext } from '../../../../contexts/filterProspectContext';
import TableSelectedCount from './TableSelectedCount';
import {
  clearMenuSelection,
  getKeysWithData,
  isModuleAllowed,
  isPermissionAllowed,
} from '../../../../utils/Utils';
import ButtonIcon from '../../../commons/ButtonIcon';
import ProspectResults from '../ProspectResults';
import { ProspectTypes } from '../constants';

import TableStartSearchPlaceholder from './TableStartSearchPlaceholder';
import { usePagesContext } from '../../../../contexts/pagesContext';
import IdfTooltip from '../../../idfComponents/idfTooltip';
import RocketReachLocation from './RocketReachLocation';
import RocketReachCompanyProfile from './RocketReachCompanyProfile';

import routes from '../../../../utils/routes.json';
import { useHistory } from 'react-router-dom';
import { PermissionsConstants } from '../../../../utils/permissions.constants';
import { useTenantContext } from '../../../../contexts/TenantContext';

const SearchButton = ({ onClick }) => (
  <InputGroup.Text
    role="button"
    onClick={onClick}
    className="position-absolute border-0 p-0 z-10"
    style={{ top: 13, left: 10 }}
  >
    <MaterialIcon icon="search" />
  </InputGroup.Text>
);

const SearchInput = forwardRef(
  ({ value, onChange, onClear, onSearch }, ref) => (
    <div className="p-3">
      <FormGroup className="position-relative" size="sm">
        <SearchButton onClick={onSearch} />
        <FormControl
          id="search-input"
          ref={ref}
          aria-label="Search"
          className={`form-control w-100 rounded px-5`}
          placeholder="Search"
          value={value}
          onChange={onChange}
          onKeyDown={onSearch}
        />
        {value && <ResetButton onClick={onClear} show={true} />}
      </FormGroup>
    </div>
  )
);

SearchInput.displayName = 'SearchInput';

const ResetButton = ({ onClick, show = true }) =>
  show && (
    <Button
      variant="link"
      className="border-0 pl-0 p-0 position-absolute"
      style={{ top: 13, right: 10 }}
      size="sm"
      onClick={onClick}
    >
      <span className="material-icons-outlined search-close">close</span>
    </Button>
  );

const NameColumn = ({ prospect }) => {
  return (
    <RocketReachPeopleCard
      prospect={prospect}
      showSocialLinks
      withCompany={false}
      withLocation={false}
      avatarStyle={{ width: 50, height: 50 }}
      containerStyle="pt-1 pb-3"
    />
  );
};

const CompanyColumn = ({ prospect, inline, type }) => {
  return (
    <>
      {prospect.employer && prospect.employer.toLowerCase() !== 'undefined' ? (
        <RocketReachCompanyProfile
          prospect={prospect}
          inline={inline}
          type={type}
        />
      ) : (
        ''
      )}
    </>
  );
};

const PeopleWithCompanyColumn = ({ prospect, inline }) => {
  return (
    <>
      {prospect.employer && prospect.employer.toLowerCase() !== 'undefined' ? (
        <RocketReachCompanyProfile
          prospect={prospect}
          inline={inline}
          type={ProspectTypes.people}
        />
      ) : (
        ''
      )}
    </>
  );
};

const ContactInfoColumn = ({ prospect, setProspect }) => {
  return (
    <RocketReachViewInfoCard
      prospect={prospect}
      setProspect={setProspect}
      layout="column"
    />
  );
};

const TablePeopleProspect = ({
  data = [],
  setData,
  checkbox = false,
  pagination,
  onPageChange,
  selectedProspects,
  setSelectedProspects,
  onHandleEdit,
  domain,
  selectAll,
  setSelectAll,
  switchToWriteTab,
  showLoading,
  chargeFilter,
  importProspects,
  exportProspects,
  clearSelection,
  filter,
  setErrorMessage,
  setSuccessMessage,
  permissionExportImport,
}) => {
  const { globalFilters } = useFilterProspectContext();
  const [localFilter, setLocalFilter] = useState(globalFilters);
  const [searchClicked, setSearchClicked] = useState(false);
  const { tenant } = useTenantContext();
  const history = useHistory();
  const updateProspects = (prospect) => {
    const newProspects = [...selectedProspects];
    newProspects.forEach((pros) => {
      if (pros.id === prospect.id) {
        pros.emails_list = prospect.emails_list;
        pros.phones_list = prospect.phones_list;
      }
    });
    setSelectedProspects(newProspects);
  };

  const updateData = (item) => {
    const newProspects = [...data].map((p) => ({
      ...p,
      isExpanded: p.id === item.id ? !p.isExpanded : false,
      detailType: ProspectTypes.people,
    }));
    setData(newProspects);
  };

  const ComponentAction = ({ item }) => {
    return (
      <>
        <div className="d-flex flex-column gap-2">
          {isPermissionAllowed('prospects', 'create') &&
          isPermissionAllowed('contacts', 'create') ? (
            <IdfTooltip
              text={`${
                isPermissionAllowed('prospects', 'create')
                  ? 'Import Profile'
                  : 'Import Disabled.'
              }`}
            >
              <ButtonIcon
                icon="add"
                label=""
                className="btn-xs btn-success border-success"
                onclick={(e) => {
                  e.stopPropagation();
                  handleOnEdit(item);
                }}
                style={{ border: '1px solid' }}
              />
            </IdfTooltip>
          ) : (
            <></>
          )}

          {isModuleAllowed(
            tenant?.modules,
            PermissionsConstants.AIAssist.Assist
          ) &&
            isModuleAllowed(
              tenant?.modules,
              PermissionsConstants.AIAssist.Write
            ) && (
              <IdfTooltip text="Write Email">
                <ButtonIcon
                  icon="auto_fix_high"
                  label=""
                  className="btn-xs btn-outline-primary mt-1 bg-white"
                  onclick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    clearMenuSelection(e);
                    const { first_name, last_name, employer, title } = item;
                    const prospect = { first_name, last_name, employer, title };
                    history.push(
                      `${routes.aiAssist}?prospect=${JSON.stringify(prospect)}`
                    );
                  }}
                  style={{ borderWidth: '1px' }}
                />
              </IdfTooltip>
            )}
        </div>
        <div className="position-absolute expand-collapse bottom-0 abs-center z-index-99">
          <a
            href=""
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              updateData(item);
            }}
          >
            <MaterialIcon
              icon={`${item.isExpanded ? 'expand_less' : 'expand_more'}`}
              clazz={`font-size-xl2 ${
                item.isExpanded ? 'text-gray-dark' : 'text-gray-search'
              }`}
            />
          </a>
        </div>
      </>
    );
  };

  const rows = data.map((item) => {
    const response = {
      ...item,
      dataRow: [
        {
          key: 'Name',
          component: <NameColumn prospect={item} />,
        },
        {
          key: 'Company',
          component: <CompanyColumn prospect={item} />,
        },
        {
          key: 'Location',
          component: <RocketReachLocation prospect={item} />,
        },
        {
          key: 'Available Details',
          component: (
            <ContactInfoColumn
              prospect={item}
              setProspect={(item) => updateProspects(item)}
            />
          ),
        },
        {
          key: '',
          component: <ComponentAction item={item} />,
        },
      ],
    };

    return response;
  });

  const handleOnEdit = (row) => {
    onHandleEdit(row);
  };
  const { pageContext, setPageContext } = usePagesContext();

  useEffect(() => {
    setLocalFilter(globalFilters);
    const filters = getKeysWithData(globalFilters);
    setSearchClicked(!!Object.keys(filters).length);
    setPageContext({
      ...pageContext,
      PeopleSearch: { global: globalFilters, local: filters },
    });
  }, [globalFilters]);

  return (
    <>
      <Card>
        <Card.Header className="border-bottom d-flex prospect-detail-heading align-items-center justify-between">
          <h4 className="mb-0">People</h4>
          {data && data.length > 0 && (
            <div>
              {domain && <span className="fw-bold">Contacts at {domain}</span>}
              {pagination?.total && (
                <ProspectResults
                  pagination={pagination}
                  filter={localFilter}
                  type={ProspectTypes.people}
                  setErrorMessage={setErrorMessage}
                  setSuccessMessage={setSuccessMessage}
                />
              )}
            </div>
          )}
        </Card.Header>
        <Card.Body className="p-0">
          {showLoading && (
            <div className="px-3 pt-3">
              <LookupPeopleLoader
                count={7}
                circle={<Skeleton height={60} width={60} circle />}
                container
              />
            </div>
          )}

          {selectedProspects.length > 0 && (
            <TableSelectedCount
              list={selectedProspects}
              containerPadding="py-3 pr-3 pl-2_1"
              btnClick={importProspects}
              btnClass="btn-sm text-white"
              btnIcon="add"
              btnLabel="Create"
              btnColor="success"
              onClear={clearSelection}
              align="justify-content-start"
              customButton={
                <div className="d-flex align-items-center gap-2 flex-grow-1 justify-content-end">
                  {isPermissionAllowed('prospects', 'create') &&
                    isPermissionAllowed('contacts', 'create') && (
                      <ButtonIcon
                        onclick={importProspects}
                        icon="add"
                        label="Import"
                        classnames={`btn-sm px-3 text-white ${
                          isPermissionAllowed('prospects', 'create')
                            ? ''
                            : 'd-flex align-items-center justify-content-center'
                        }`}
                        color="success"
                        tooltip={
                          !isPermissionAllowed('prospects', 'create')
                            ? 'Import Disabled'
                            : ''
                        }
                      />
                    )}
                  {isPermissionAllowed('prospects', 'view') && (
                    <ButtonIcon
                      onclick={exportProspects}
                      icon="file_download"
                      label="Export"
                      classnames="btn-sm px-3"
                      color="outline-primary"
                    />
                  )}
                </div>
              }
            />
          )}

          {showLoading ? (
            <div className="px-3 pt-3">
              <LookupPeopleLoader
                count={7}
                circle={<Skeleton height={60} width={60} circle />}
                container
              />
            </div>
          ) : (
            <>
              {data?.length > 0 || rows.length > 0 ? (
                <Table
                  className={`prospect-table`}
                  checkbox={
                    isPermissionAllowed('prospects', 'view') ||
                    isPermissionAllowed('prospects', 'create')
                  }
                  selectedData={selectedProspects}
                  setSelectedData={setSelectedProspects}
                  columns={columnsTablePeople}
                  data={rows}
                  showLoading={showLoading}
                  selectAll={selectAll}
                  setSelectAll={setSelectAll}
                  paginationInfo={pagination}
                  onPageChange={onPageChange}
                  onClick={(item) => updateData(item)}
                  title="prospects"
                  usePagination
                  dataInDB={pagination?.total > 9}
                  noDataInDbValidation
                  expandComponent={PeopleWithCompanyColumn}
                />
              ) : (
                <>
                  {searchClicked ? (
                    <TableStartSearchPlaceholder
                      title="No Results Found."
                      description="Results matching this query could not be displayed. Please try refining your search or clearing some of your filters."
                    />
                  ) : (
                    <TableStartSearchPlaceholder />
                  )}
                </>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default TablePeopleProspect;
