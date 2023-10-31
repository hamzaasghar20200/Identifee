import React, { useContext, useEffect, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import stringConstants from '../utils/stringConstants.json';
import MenuPeople from '../components/prospecting/v2/MenuPeople';
import MenuCompany from '../components/prospecting/v2/MenuCompany';
import TablePeopleProspect from '../components/prospecting/v2/common/TablePeopleProspect';
import prospectService from '../services/prospect.service';
import AlertWrapper from '../components/Alert/AlertWrapper';
import Alert from '../components/Alert/Alert';
import {
  initialState,
  initialStateCompany,
  ProspectTypes,
} from '../components/prospecting/v2/constants';
import routes from '../utils/routes.json';
import { useHistory } from 'react-router';
import ImportProfile from '../components/organizationProfile/overview/ImportProfile';
import { useFilterProspectContext } from '../contexts/filterProspectContext';
import _ from 'lodash';
import BulkImportService from '../services/bulkImport.service';
import TableCompanyProspect from '../components/prospecting/v2/common/TableCompanyProspect';
import {
  addressify,
  clearMenuSelection,
  formatPhoneNumber,
  generateCSV,
  getKeysWithData,
  isModuleAllowed,
  isPermissionAllowed,
  overflowing,
  RESOURCES_COMPANY_FILTER,
  RESOURCES_PEOPLE_FILTER,
  scrollToTop,
} from '../utils/Utils';
import { TenantContext } from '../contexts/TenantContext';
import { PermissionsConstants } from '../utils/permissions.constants';
import ExportProfile from '../components/organizationProfile/overview/ExportProfile';
import ProspectSavedSearches from '../components/prospecting/v2/ProspectSavedSearches';
import { usePagesContext } from '../contexts/pagesContext';
import ImportOrganizations from '../components/organizationProfile/overview/ImportOrganizations';
import ExportCompanies from '../components/organizationProfile/overview/ExportCompanies';

const TAB_KEYS = {
  organization: 1,
  people: 2,
  domain: 3,
};

const ProspectSearch = ({ switchTab, activeTab, setActiveTab }) => {
  const [prospects, setProspects] = useState([]);
  const [prospectsCompany, setProspectsCompany] = useState([]);
  const [paginationCompany, setPaginationCompany] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);
  const [filter, setFilter] = useState({});
  const [filterCompany, setFilterCompany] = useState({});
  const [loadFilterCompany, setLoadFilterCompany] = useState(0);
  const [loadFilterPeople, setLoadFilterPeople] = useState(0);
  const [firstRender, setFirstRender] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [message, setMessage] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [currentProspect, setCurrentProspect] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const [selectAllCompanies, setSelectAllCompanies] = useState(false);

  const [selectedData, setSelectedData] = useState([]);
  const [selectedDataCompanies, setSelectedDataCompanies] = useState([]);

  const { tenant } = useContext(TenantContext);
  const [savedSearchToggle, setSavedSearchToggle] = useState(false);
  const { pageContext } = usePagesContext();
  const [permissionExportImport, setPermissionExportImport] = useState({
    export: true,
    import: true,
  });

  const checkForImportExport = () => {
    const { modules } = tenant;
    if (!modules || modules === '*') {
      const isPermissionCreate = isPermissionAllowed(
        PermissionsConstants.Resources?.collection,
        PermissionsConstants.Resources.create
      );
      const isPermissionView = isPermissionAllowed(
        PermissionsConstants.Resources?.collection,
        PermissionsConstants.Resources.view
      );
      setPermissionExportImport({
        export: isPermissionCreate,
        import: isPermissionView,
      });
    } else {
      const isAllowedImport = isModuleAllowed(
        tenant.modules,
        PermissionsConstants.Resources.import.toLowerCase().replace('-', '_')
      );
      const isAllowedExport = isModuleAllowed(
        tenant.modules,
        PermissionsConstants.Resources.export.toLowerCase().replace('-', '_')
      );
      const isPermissionCreate = isPermissionAllowed(
        PermissionsConstants.Resources?.collection,
        PermissionsConstants.Resources.create
      );
      const isPermissionView = isPermissionAllowed(
        PermissionsConstants.Resources?.collection,
        PermissionsConstants.Resources.view
      );
      setPermissionExportImport({
        import: isAllowedImport && isPermissionCreate,
        export: isAllowedExport && isPermissionView,
      });
    }
  };

  useEffect(() => {
    checkForImportExport();
  }, [tenant]);

  const {
    globalFilters,
    setGlobalFilters,
    globalFiltersCompany,
    setGlobalFiltersCompany,
  } = useFilterProspectContext();
  const [openModalImportProspects, setOpenModalImportProspects] =
    useState(false);
  const [openModalExportProspects, setOpenModalExportProspects] =
    useState(false);
  const [prospectsList, setProspectsList] = useState([]);
  const [prospectsListCompany, setProspectsListCompany] = useState([]);
  const [openModalImportProspectsComp, setOpenModalImportProspectsComp] =
    useState(false);
  const [
    openModalExportProspectsCompanies,
    setOpenModalExportProspectsCompanies,
  ] = useState(false);
  const history = useHistory();

  useEffect(() => {
    // if this view opens from Load more button in org profile right bar
    // then get the employer name from params and open prospects search against it
    // TODO: i am going to clean this, this needs to be replaced with useParams of react-router-dom
    const params = new URLSearchParams(history.location.search);
    const currentEmployer = params.get('current_employer');
    const companyId = params.get('id');
    const currentTab = params.get('tab');
    if (currentTab === ProspectTypes.company) {
      setActiveTab(TAB_KEYS.organization); // default to profile tab when switched from org right bar prospect
      setLoading(true);
      setFilterCompany(pageContext?.CompanySearch?.local);
      setGlobalFiltersCompany(pageContext?.CompanySearch?.global);
      setLoadFilterCompany((prevState) => prevState + 1);
    } else {
      if (currentEmployer) {
        setActiveTab(TAB_KEYS.people); // default to profile tab when switched from org right bar prospect
        setLoading(true);
        const currentEmployerFilter = {
          current_employer: companyId
            ? [`"${companyId}:${currentEmployer}"`]
            : [`"${currentEmployer}"`],
        };
        setFilter(currentEmployerFilter);
        setGlobalFilters({
          employer: {
            current_employer: [currentEmployer],
            company_id: [companyId],
          },
        });
        setLoadFilterPeople((prevState) => prevState + 1);
      } else {
        if (currentTab) {
          setActiveTab(TAB_KEYS.people);
          setFilter(pageContext?.PeopleSearch?.local);
          setGlobalFilters(pageContext?.PeopleSearch?.global);
          setLoadFilterPeople((prevState) => prevState + 1);
        }
      }
    }
    scrollToTop();
  }, [history.location]);

  useEffect(() => {
    const params = new URLSearchParams(history.location.search);
    const currentEmployer = params.get('current_employer');
    const companyId = params.get('id');
    const currentTab = params.get('tab');
    if (!currentEmployer && !companyId) {
      setActiveTab(
        currentTab === ProspectTypes.people
          ? TAB_KEYS.people
          : TAB_KEYS.organization
      );
      const resourcesPeopleFilter = prospectService.getListLocallyByKey(
        RESOURCES_PEOPLE_FILTER
      );
      const resourcesCompanyFilter = prospectService.getListLocallyByKey(
        RESOURCES_COMPANY_FILTER
      );
      if (Object.keys(getKeysWithData(resourcesPeopleFilter?.global)).length) {
        setLoading(true);
        setFilter(resourcesPeopleFilter?.local);
        setGlobalFilters(resourcesPeopleFilter?.global);
        setLoadFilterPeople((prevState) => prevState + 1);
      }
      if (Object.keys(getKeysWithData(resourcesCompanyFilter?.global)).length) {
        setLoading(true);
        setFilterCompany(resourcesCompanyFilter?.local);
        setGlobalFiltersCompany(resourcesCompanyFilter?.global);
        setLoadFilterCompany((prevState) => prevState + 1);
      }
    }
  }, []);

  const getProspects = async (page = 1) => {
    const limit = 10;
    if (!_.isEmpty(filter)) {
      const updatedFilter = { ...filter };
      if (updatedFilter.location?.length) {
        const locations = updatedFilter.location;
        if (
          updatedFilter.radius?.length &&
          updatedFilter.radius[0] !== '::~0mi'
        ) {
          updatedFilter.location = locations.map((loc) => {
            return `${loc}${updatedFilter.radius}`;
          });
          delete updatedFilter.radius;
        } else {
          delete updatedFilter.radius;
        }
      } else {
        delete updatedFilter.radius;
      }
      setLoading(true);
      try {
        const response = await prospectService.query(
          { ...updatedFilter },
          {
            page: (page - 1) * limit + 1, // while sending RR set page * limit + 1 so it becomes 1, 11, 21, 31 etc.
            limit,
            type: 'query',
            order_by: 'popularity',
          }
        );
        setLoading(false);
        if (response.response?.status === 429) {
          setErrorMessage('Error getting prospects');
          throw new Error('Error getting prospects');
        }

        const profiles = response.data.data;
        const {
          pagination: { total, next },
        } = response.data;

        setProspects(profiles);

        // on response back converting to page number by dividing size, so it converts 11, 21 back to 1, 2 to highlight on pagination etc.
        const currentPage = (next - 1) / limit;
        setPagination({
          page: currentPage,
          next,
          total,
          totalPages: Math.ceil(total / 10),
        });
      } catch (e) {
        console.log(e);
      }
    }
  };

  const getCompanyProspects = async (page = 1) => {
    const limit = 10;
    if (!_.isEmpty(filterCompany)) {
      const updatedFilter = { ...filterCompany };
      if (updatedFilter.location?.length) {
        const locations = updatedFilter.location;
        if (
          updatedFilter.radius?.length &&
          updatedFilter.radius[0] !== '::~0mi'
        ) {
          updatedFilter.location = locations.map((loc) => {
            return `${loc}${updatedFilter.radius}`;
          });
          delete updatedFilter.radius;
        } else {
          delete updatedFilter.radius;
        }
      } else {
        delete updatedFilter.radius;
      }
      setLoading(true);
      try {
        const response = await prospectService.query(
          { ...updatedFilter },
          {
            page: (page - 1) * limit + 1, // while sending RR set page * limit + 1 so it becomes 1, 11, 21, 31 etc.
            limit,
            type: ProspectTypes.company,
          }
        );
        setLoading(false);

        if (response.response?.status === 429) {
          setErrorMessage('Error getting prospects');
          throw new Error('Error getting prospects');
        }

        const profiles = response.data.data;
        const {
          pagination: { total, nextPage },
        } = response.data;

        setProspectsCompany(profiles);

        // on response back converting to page number by dividing size, so it converts 11, 21 back to 1, 2 to highlight on pagination etc.
        const currentPage = (nextPage - 1) / limit;
        setPaginationCompany({
          page: currentPage,
          next: nextPage,
          total,
          totalPages: Math.ceil(total / 10),
        });
      } catch (e) {
        console.log(e);
      }
    }
  };

  const onPageChangeCompany = (page) => {
    handleClearSelection();
    getCompanyProspects(page);
    scrollToTop();
  };

  const onPageChange = (page) => {
    handleClearSelection();
    getProspects(page);
    scrollToTop();
  };

  useEffect(() => {
    if (
      firstRender &&
      JSON.stringify(filter) !== JSON.stringify(initialState)
    ) {
      handleClearSelection();
      getProspects();
    } else {
      setFirstRender(true);
    }
  }, [filter]);

  useEffect(() => {
    if (
      firstRender &&
      JSON.stringify(filterCompany) !== JSON.stringify(initialStateCompany)
    ) {
      handleClearSelection();
      getCompanyProspects();
    } else {
      setFirstRender(true);
    }
  }, [filterCompany]);

  const onHandleEdit = (item) => {
    setCurrentProspect(item);
    setProspectsList([item]);
    setOpenModal(true);
  };

  const switchTabAndSearchByCompany = (
    item,
    switchTab = true,
    swot = false
  ) => {
    if (switchTab) {
      history.push(
        `${routes.resources}?id=${item.id}&current_employer=${item.name}&tab=${ProspectTypes.people}`
      );
    } else {
      history.push(
        `${routes.resourcesOrganization.replace(':name', item?.name)}?tab=${
          ProspectTypes.company
        }&swot=${swot}&ticker=${item.ticker?.trim()}&id=${item.id}`
      );
    }
  };

  const saveProspect = async () => {
    setLoadingImport(true);

    try {
      // this calls Rocket Reach to get company details by name
      const newOrg =
        currentProspect.organization ||
        (await prospectService.getCompanyRR(
          currentProspect.employer || currentProspect.current_employer
        ));

      const {
        id,
        state,
        city,
        title,
        work_email,
        work_phone,
        first_name,
        last_name,
        country,
        profile_pic,
      } = currentProspect;

      const dataContact = {
        first_name,
        last_name: last_name || first_name,
        email_work: work_email,
        title: title || '',
        avatar: profile_pic,
        primary_address_city: city,
        primary_address_state: state,
        country,
        phone_work: work_phone,
        status: 'cold',
        external_id: '' + id,
      };

      if (newOrg?.name) {
        dataContact.organization = newOrg;
      }

      const finalRequest = {
        update_existing: true,
        contacts: [dataContact],
      };

      const service = new BulkImportService();
      const { contacts } = await service.bulkImport(finalRequest, 'people', {});

      setLoadingImport(false);
      setOpenModal(false);
      clearMenuSelection();
      // redirecting to just imported contact profile
      history.push(`${routes.contacts}/${contacts[0].id}/profile`);
    } catch (error) {
      console.log(error);
      setErrorMessage(stringConstants.settings.security.errorMessage);
    } finally {
      setLoadingImport(false);
    }
  };

  const chargeFilter = (payload, action) => {
    setFilter(payload);
    if (action) {
      setLoading(false);
      if (action === 'CLEAR' || _.isEmpty(payload)) {
        setFilter({});
        setProspects([]);
        // remove query params when switching tabs
        history.replace({
          search: '',
        });
        setGlobalFilters(initialState);
      }
    }
  };

  const switchToWriteTab = (selectedProspect) => {
    switchTab({ tabId: 2 }, selectedProspect);
  };

  const chargeFilterCompany = (payload, action) => {
    setFilterCompany(payload);
    if (action) {
      setLoading(false);
      if (action === 'CLEAR' || _.isEmpty(payload)) {
        setFilterCompany({});
        setProspectsCompany([]);
        // remove query params when switching tabs
        history.replace({
          search: '',
        });
        setGlobalFiltersCompany(initialStateCompany);
      }
    }
  };

  const onSearchCompany = (e) => {
    if (e.keyCode === 13) {
      const { value } = e.target;
      let valueArray = value ? [value] : [];
      if (filter?.name?.length || globalFilters?.global?.name?.length) {
        valueArray = _.uniq([...filterCompany.name, ...valueArray]);
      }
      setFilterCompany({ ...filterCompany, name: valueArray });
      setGlobalFiltersCompany({
        ...globalFiltersCompany,
        global: { name: valueArray },
      });
      setLoadFilterCompany((prevState) => prevState + 1);
    }
  };

  const saveProspects = async () => {
    setLoadingImport(true);
    // ids of selected prospects
    const contactIds = [...selectedData];
    const requests = [];

    contactIds.forEach((id) => {
      // call RR to get contact detail of each prospect
      const currentProspect = _.find(prospects, { id: parseInt(id) });
      // if info is not already loaded, the call RR
      if (!currentProspect.emails_list && !currentProspect.phones_list) {
        requests.push(prospectService.getContact({ id }));
      } else {
        currentProspect.emails = currentProspect.emails_list;
        currentProspect.phones = currentProspect.phones_list;
        const myPromise = new Promise((resolve) => {
          resolve({ data: currentProspect });
        });
        requests.push(myPromise);
      }
    });

    const rocketReachContactsResponse = await Promise.all(requests);

    const contacts = await Promise.all(
      rocketReachContactsResponse.map(async (prospect) => {
        const { data } = prospect;
        const currentProspect = _.find(prospects, { id: data.id });
        const { id, state, city, title, first_name, last_name, country } =
          currentProspect;

        // this calls Rocket Reach to get company details by name
        const newOrganization =
          currentProspect.organization ||
          (await prospectService.getCompanyRR(
            data.employer || data.current_employer
          ));

        const newProspect = {
          first_name,
          last_name: last_name || first_name,
          avatar: data.profile_pic,
          email_work: data?.emails?.length ? data.emails[0].email : '',
          title: title || '',
          primary_address_city: city,
          primary_address_state: state,
          country,
          phone_work: data?.phones?.length ? data.phones[0].number : '',
          status: 'cold',
          external_id: '' + id,
        };

        if (newOrganization?.name) {
          newProspect.organization = newOrganization;
        }
        return newProspect;
      })
    );

    const finalRequest = {
      update_existing: true,
      contacts: contacts.filter((c) => !!c),
    };

    const service = new BulkImportService();
    await service.bulkImport(finalRequest, 'people', {});

    handleClearSelection();
    setLoadingImport(false);
    setOpenModalImportProspects(false);
    history.push(`${routes.contacts}?tab=people`);
  };

  const extractSocialLinks = (links) => {
    const newList = [];
    if (links) {
      for (const link in links) {
        if (links[link]) {
          if (
            link === 'facebook' ||
            link === 'twitter' ||
            link === 'linkedin' ||
            link === 'crunchbase'
          ) {
            newList.push({
              name: link,
              url: links[link],
            });
          }
        }
      }
    }

    return newList.length ? newList.map((l) => l.url).join(', ') : '';
  };

  const extractOther = (
    values,
    key,
    skipFirst = true,
    shouldFormatPhone = false
  ) => {
    if (!values) {
      return '';
    }

    let newValues = [...values];
    if (skipFirst) {
      newValues = values.slice(1);
    }

    return newValues
      .map((m) => {
        if (shouldFormatPhone) {
          return formatPhoneNumber(m[key]);
        } else {
          return m[key];
        }
      })
      .join(', ');
  };

  const exportProspects = async () => {
    setLoadingImport(true);
    // ids of selected prospects
    const contacts = [...selectedData].map((prospectId) => {
      const currentProspect = _.find(prospects, { id: parseInt(prospectId) });
      const { id, title, first_name, last_name, employer } = currentProspect;
      return {
        id,
        first_name,
        last_name: last_name || first_name,
        profile_pic: currentProspect.profile_pic,
        email_other: extractOther(currentProspect?.emails_list, 'email', true),
        phone_other: extractOther(
          currentProspect?.phones_list,
          'number',
          true,
          true
        ),
        title,
        links: extractSocialLinks(currentProspect.links),
        organization: employer,
        work_email: currentProspect.work_email,
        work_phone: formatPhoneNumber(currentProspect.work_phone),
        address: currentProspect.location,
      };
    });

    const headers = [
      { label: 'id', key: 'id' },
      { label: 'profile_pic', key: 'profile_pic' },
      { label: 'first_name', key: 'first_name' },
      { label: 'last_name', key: 'last_name' },
      { label: 'title', key: 'title' },
      { label: 'email_work', key: 'work_email' },
      { label: 'email_other', key: 'email_other' },
      { label: 'phone_work', key: 'work_phone' },
      { label: 'phone_other', key: 'phone_other' },
      { label: 'social_links', key: 'links' },
      { label: 'address', key: 'address' },
      { label: 'organization', key: 'organization' },
    ];

    generateCSV(headers, contacts, 'prospects');

    handleClearSelection();
    setLoadingImport(false);
    setOpenModalExportProspects(false);
  };

  const exportProspectsCompanies = async () => {
    setLoadingImport(true);
    // ids of selected prospects
    const companies = [...selectedDataCompanies].map((prospectId) => {
      const prospect = _.find(prospectsCompany, { id: parseInt(prospectId) });
      return {
        id: prospect.id,
        name: prospect.name,
        address: addressify(prospect, 'company'),
        avatar: prospect.logo_url,
        phone_office: prospect.phone,
        phone_fax: prospect.fax,
        website: prospect.domain,
        employees: prospect.employees,
        revenue: prospect.revenue,
        industry: prospect.industry,
        sic_code: prospect.sic,
        naics_code: prospect.naics,
        ticker: prospect.ticker,
        founded: prospect.founded,
        links: extractSocialLinks(prospect.links),
      };
    });

    const headers = Object.keys(companies[0]).map((k) => {
      return { label: k, key: k };
    });

    generateCSV(headers, companies, 'prospects-companies');

    handleClearSelection();
    setLoadingImport(false);
    setOpenModalExportProspectsCompanies(false);
  };

  const handleExportProspects = () => {
    const contactIds = [...selectedData];
    const selected = [];
    contactIds.forEach((val) => {
      const foundProspect = _.find(prospects, { id: parseInt(val) });
      selected.push(foundProspect);
    });
    setProspectsList(selected);
    setLoadingImport(false);
    setOpenModalExportProspects(true);
  };

  const handleSelectedProspects = () => {
    const contactIds = [...selectedData];
    const selected = [];
    contactIds.forEach((val) => {
      const foundProspect = _.find(prospects, { id: parseInt(val) });
      selected.push(foundProspect);
    });
    setProspectsList(selected);
    setOpenModalImportProspects(true);
  };

  const handleSelectedProspectsCompanies = () => {
    const contactIds = [...selectedDataCompanies];
    const selected = [];
    contactIds.forEach((val) => {
      const foundProspect = _.find(prospectsCompany, { id: parseInt(val) });
      selected.push(foundProspect);
    });
    setProspectsListCompany(selected);
    setOpenModalImportProspectsComp(true);
  };

  const handleExportProspectsCompanies = () => {
    const contactIds = [...selectedDataCompanies];
    const selected = [];
    contactIds.forEach((val) => {
      const foundProspect = _.find(prospectsCompany, { id: parseInt(val) });
      selected.push(foundProspect);
    });
    setProspectsListCompany(selected);
    setLoadingImport(false);
    setOpenModalExportProspectsCompanies(true);
  };

  const handleClearSelection = () => {
    setSelectAll(false);
    setSelectedData([]);
    setSelectAllCompanies(false);
    setSelectedDataCompanies([]);
  };

  const handleSaveFilter = (type, filter) => {
    setMessage('Filters are saved.');
  };

  const handleChangeTab = (tab) => {
    setActiveTab(tab);
    if (tab === TAB_KEYS.organization) {
      const params = new URLSearchParams(history.location.search);
      const currentEmployer = params.get('current_employer');
      const currentTab = params.get('tab');
      if (currentEmployer && currentTab === ProspectTypes.people) {
        if (
          Object.keys(getKeysWithData(pageContext?.CompanySearch?.global))
            .length
        ) {
          setFilterCompany(pageContext?.CompanySearch?.local);
          setGlobalFiltersCompany(pageContext?.CompanySearch?.global);
          setLoadFilterCompany((prevState) => prevState + 1);
        }
      }
    }
  };

  useEffect(() => {
    const filters = getKeysWithData(globalFilters);
    prospectService.saveListLocallyByKey(RESOURCES_PEOPLE_FILTER, {
      global: globalFilters,
      local: filters,
    });
  }, [globalFilters]);

  useEffect(() => {
    const filters = getKeysWithData(globalFiltersCompany);
    prospectService.saveListLocallyByKey(RESOURCES_COMPANY_FILTER, {
      global: globalFiltersCompany,
      local: filters,
    });
  }, [globalFiltersCompany]);

  const handleImportCompany = (company) => {
    setProspectsListCompany([company]);
    setOpenModalImportProspectsComp(true);
  };

  return (
    <>
      <ImportProfile
        openImportModal={openModal}
        tenant={tenant}
        setOpenImportModal={() => {
          overflowing();
          setLoadingImport(false);
          setOpenModal(false);
        }}
        prospect={prospectsList}
        handleImport={saveProspect}
        loading={loadingImport}
      />
      <ImportProfile
        openImportModal={openModalImportProspects}
        tenant={tenant}
        setOpenImportModal={() => {
          overflowing();
          setLoadingImport(false);
          setOpenModalImportProspects(false);
        }}
        prospect={prospectsList}
        handleImport={saveProspects}
        multiple={prospectsList.length > 1}
        loading={loadingImport}
      />
      <ImportOrganizations
        openImportModal={openModalImportProspectsComp}
        tenant={tenant}
        setOpenImportModal={setOpenModalImportProspectsComp}
        prospects={prospectsListCompany}
        clearSelection={handleClearSelection}
      />
      <ExportProfile
        openModal={openModalExportProspects}
        tenant={tenant}
        setOpenModal={setOpenModalExportProspects}
        prospect={prospectsList}
        handleExport={exportProspects}
        multiple={prospectsList.length > 1}
        loading={loadingImport}
      />
      <ExportCompanies
        openModal={openModalExportProspectsCompanies}
        setOpenModal={setOpenModalExportProspectsCompanies}
        prospect={prospectsListCompany}
        handleExport={exportProspectsCompanies}
        multiple={prospectsListCompany.length > 1}
        loading={loadingImport}
      />
      <AlertWrapper>
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
        <Alert color="success" message={message} setMessage={setMessage} />
      </AlertWrapper>
      <Row className="w-100" noGutters>
        <Col xs={3}>
          <Card className="m-0">
            <Card.Body className="px-0 pt-0 pb-0">
              <ProspectSavedSearches
                tabKeys={TAB_KEYS}
                setActiveTab={handleChangeTab}
                setErrorMessage={setErrorMessage}
                setSuccessMessage={setMessage}
                chargeFilter={chargeFilter}
                chargeFilterCompany={chargeFilterCompany}
                refreshCompanyFilter={setLoadFilterCompany}
                refreshPeopleFilter={setLoadFilterPeople}
                active={savedSearchToggle}
                setActive={setSavedSearchToggle}
                currentView={activeTab}
              />
              {activeTab === TAB_KEYS.organization && (
                <MenuCompany
                  chargeFilter={chargeFilterCompany}
                  saveFilter={() =>
                    handleSaveFilter(ProspectTypes.company, {
                      ...globalFiltersCompany,
                    })
                  }
                  loadFilter={loadFilterCompany}
                />
              )}
              {activeTab === TAB_KEYS.people && (
                <MenuPeople
                  chargeFilter={chargeFilter}
                  saveFilter={() =>
                    handleSaveFilter(ProspectTypes.people, { ...globalFilters })
                  }
                  loadFilter={loadFilterPeople}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col xs={9} className="p-0 position-relative">
          <div className="ml-2">
            {activeTab === TAB_KEYS.organization && (
              <TableCompanyProspect
                data={prospectsCompany}
                setData={setProspectsCompany}
                pagination={paginationCompany}
                selectAll={selectAllCompanies}
                setSelectAll={setSelectAllCompanies}
                selectedProspects={selectedDataCompanies}
                setSelectedProspects={setSelectedDataCompanies}
                importProspects={handleSelectedProspectsCompanies}
                onSearch={onSearchCompany}
                chargeFilter={chargeFilterCompany}
                refreshView={setLoadFilterCompany}
                showLoading={loading}
                onPageChange={onPageChangeCompany}
                onHandleEdit={switchTabAndSearchByCompany}
                onHandleImport={handleImportCompany}
                clearSelection={handleClearSelection}
                setErrorMessage={setErrorMessage}
                setSuccessMessage={setMessage}
                exportProspects={handleExportProspectsCompanies}
                permissionExportImport={permissionExportImport}
              />
            )}
            {activeTab === TAB_KEYS.people && (
              <TablePeopleProspect
                data={prospects}
                setData={setProspects}
                pagination={pagination}
                permissionExportImport={permissionExportImport}
                selectAll={selectAll}
                setSelectAll={setSelectAll}
                selectedProspects={selectedData}
                setSelectedProspects={setSelectedData}
                importProspects={handleSelectedProspects}
                exportProspects={handleExportProspects}
                switchToWriteTab={switchToWriteTab}
                filter={filter}
                chargeFilter={chargeFilter}
                showLoading={loading}
                onPageChange={onPageChange}
                onHandleEdit={onHandleEdit}
                clearSelection={handleClearSelection}
                setErrorMessage={setErrorMessage}
                setSuccessMessage={setMessage}
              />
            )}
          </div>
        </Col>
      </Row>
    </>
  );
};

export default ProspectSearch;
