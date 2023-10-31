import React, { forwardRef, useEffect, useState } from 'react';
import {
  Button,
  Card,
  FormControl,
  FormGroup,
  InputGroup,
} from 'react-bootstrap';

import Table from '../../../GenericTable';
import { columnsTableCompany } from '../../constants';
import MaterialIcon from '../../../commons/MaterialIcon';
import LookupPeopleLoader from '../../../loaders/LookupPeople';
import Skeleton from 'react-loading-skeleton';
import { useFilterProspectContext } from '../../../../contexts/filterProspectContext';
import TableSelectedCount from './TableSelectedCount';
import RocketReachPeopleCard from '../../../organizationProfile/overview/RocketReachPeopleCard';
import RocketReactCompanyDetails from '../../../organizationProfile/overview/RocketReactCompanyDetails';
import ButtonIcon from '../../../commons/ButtonIcon';
import { ProspectTypes } from '../constants';
import ProspectResults from '../ProspectResults';
import {
  addressify,
  getKeysWithData,
  isPermissionAllowed,
} from '../../../../utils/Utils';
import TableStartSearchPlaceholder from './TableStartSearchPlaceholder';
import { usePagesContext } from '../../../../contexts/pagesContext';
import RocketReachCompanyProfile from './RocketReachCompanyProfile';

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

const CompanyColumn = ({ prospect, chargeFilter, refreshView }) => {
  return (
    <RocketReachPeopleCard
      prospect={{ ...prospect, full_name: prospect.name }}
      showSocialLinks
      withCompany={false}
      isCompanyProfile={true}
      withLocation={false}
      avatarStyle={{ width: 50, height: 50 }}
      containerStyle={'pt-1 pb-3'}
      chargeFilter={chargeFilter}
      refreshView={refreshView}
    />
  );
};

const LocationColumn = ({ prospect }) => {
  return (
    <p
      className="prospect-typography-h6 text-wrap p-0 m-0 font-size-sm2"
      style={{ maxWidth: 180 }}
    >
      {addressify(prospect, 'company')}
    </p>
  );
};

const CompanyInfoColumn = ({ prospect }) => {
  return (
    <p className="prospect-typography-h6 text-wrap p-0 m-0">
      <RocketReactCompanyDetails prospect={prospect} />
    </p>
  );
};

const TableCompanyProspect = ({
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
  showLoading,
  chargeFilter,
  importProspects,
  clearSelection,
  refreshView,
  setErrorMessage,
  setSuccessMessage,
  permissionExportImport,
  exportProspects,
  onHandleImport,
}) => {
  const { globalFiltersCompany } = useFilterProspectContext();
  const [localFilter, setLocalFilter] = useState(globalFiltersCompany);
  const [searchClicked, setSearchClicked] = useState(false);

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
      detailType: ProspectTypes.company,
    }));
    setData(newProspects);
  };

  const rows = data.map((item) => {
    const response = {
      ...item,
      dataRow: [
        {
          key: 'Company',
          component: (
            <CompanyColumn
              prospect={item}
              chargeFilter={chargeFilter}
              refreshView={refreshView}
            />
          ),
        },
        {
          key: 'Location',
          component: <LocationColumn prospect={item} />,
        },
        {
          key: 'Details',
          component: (
            <CompanyInfoColumn
              prospect={item}
              setProspect={(item) => updateProspects(item)}
            />
          ),
        },
        {
          key: '',
          component: (
            <>
              <div className="d-flex flex-column align-items-center gap-1">
                <ButtonIcon
                  icon="search"
                  label="Employees"
                  onclick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onHandleEdit(item, true);
                  }}
                  className="btn btn-success btn-xs text-white"
                  style={{ width: 142 }}
                />
                {isPermissionAllowed('prospects', 'create') &&
                  isPermissionAllowed('contacts', 'create') && (
                    <ButtonIcon
                      icon="add"
                      label="Import Company"
                      onclick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onHandleImport(item);
                      }}
                      className="btn-xs btn-outline-primary mt-1 bg-white"
                      style={{ borderWidth: '1px', width: 142 }}
                    />
                  )}
                {item?.ticker && (
                  <ButtonIcon
                    icon="grid_view"
                    label="SWOT Analysis"
                    className="btn-xs btn-outline-primary mt-1 bg-white"
                    onclick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onHandleEdit(item, false, true);
                    }}
                    style={{ borderWidth: '1px', width: 142 }}
                  />
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
          ),
        },
      ],
    };

    return response;
  });

  const { pageContext, setPageContext } = usePagesContext();

  useEffect(() => {
    setLocalFilter(globalFiltersCompany);
    const filters = getKeysWithData(globalFiltersCompany);
    setSearchClicked(!!Object.keys(filters).length);
    setPageContext({
      ...pageContext,
      CompanySearch: { global: globalFiltersCompany, local: filters },
    });
  }, [globalFiltersCompany]);

  const CompanyGrowthSection = ({ prospect, inline }) => {
    return (
      <RocketReachCompanyProfile
        prospect={prospect}
        inline={inline}
        type={ProspectTypes.company}
        searchEmployees={() => {
          onHandleEdit(prospect, true);
        }}
      />
    );
  };

  return (
    <>
      <Card>
        <Card.Header className="border-bottom prospect-detail-heading d-flex align-items-center justify-between">
          <h4 className="mb-0">Companies</h4>
          {data && data.length > 0 && (
            <div>
              {pagination?.total && (
                <ProspectResults
                  pagination={pagination}
                  filter={localFilter}
                  type={domain ? ProspectTypes.domain : ProspectTypes.company}
                  setErrorMessage={setErrorMessage}
                  setSuccessMessage={setSuccessMessage}
                />
              )}
            </div>
          )}
        </Card.Header>
        <Card.Body className="p-0">
          {selectedProspects.length > 0 && (
            <TableSelectedCount
              list={selectedProspects}
              containerPadding="py-3 pr-3 pl-2_1"
              btnClick={importProspects}
              btnClass="btn-sm text-white"
              btnIcon="add"
              btnLabel="Import"
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
                            ? 'Imports Disabled'
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
                  columns={columnsTableCompany}
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
                  expandComponent={CompanyGrowthSection}
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

export default TableCompanyProspect;
