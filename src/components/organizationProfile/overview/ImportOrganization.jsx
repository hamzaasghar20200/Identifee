import { Image } from 'react-bootstrap';
import React, { useState, useContext } from 'react';
import SimpleModalCreation from '../../modal/SimpleModalCreation';
import helpOutline from '../../../assets/svg/help_outline.svg';
import { CardButton } from '../../layouts/CardLayout';
import orgService from '../../../services/organization.service';
import { useParams } from 'react-router-dom';
import RocketReachOrganizationCard from './RocketReachOrganizationCard';
import { AlertMessageContext } from '../../../contexts/AlertMessageContext';
import {
  convertDataToNewDataObject,
  getDiffBetweenObjects,
  isPermissionAllowed,
  overflowing,
  parseNaics,
} from '../../../utils/Utils';

const RR_TO_API_DATA_OBJECT = {
  employees: 'employees',
  address: 'address_street',
  revenue: 'annual_revenue',
  industry: 'industry',
  city: 'address_city',
  state: 'address_state',
  country: 'address_country',
  postal_code: 'address_postalcode',
  sic: 'sic_code',
  naics: 'naics_code',
  ticker: 'ticker_symbol',
  logo_url: 'avatar',
  phone: 'phone_office',
  fax: 'phone_fax',
  website: 'domain',
  id: 'external_id',
  name: 'name',
};

const ImportOrganization = ({
  children,
  openImportModal,
  setOpenImportModal,
  data,
  prospect,
  refresh,
  modalDescription = `Would you like to Import Company? <br /> Importing will overwrite existing Company details.`,
}) => {
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [merging, setMerging] = useState(false);

  const { setSuccessMessage, setErrorMessage } =
    useContext(AlertMessageContext);

  const importedData = {
    name: data.name,
    industry: data.industry,
    revenue: parseFloat(data.annual_revenue || '0'),
    fax: data.phone_fax,
    phone: data.phone_office,
    domain: data.website,
    employees: parseFloat(data.employees || '0'),
    ticker: data.ticker_symbol?.trim(),
    address: data.address_street,
    city: data.address_city,
    state: data.address_state,
    postal_code: data.address_postalcode,
    country: data.address_country,
    sic: parseNaics(data.sic_code),
    naics: parseNaics(data.naics_code),
    logo_url: data.avatar,
  };

  const rrData = {
    name: prospect.name,
    domain: prospect.domain,
    address: prospect.address,
    city: prospect.city,
    state: prospect.state,
    postal_code: prospect.postal_code,
    country: prospect.country,
    employees: parseFloat(prospect.employees || '0'),
    sic: parseNaics(prospect.sic),
    ticker: prospect.ticker?.trim() || '',
    naics: parseNaics(prospect.naics),
    fax: prospect.fax,
    industry: prospect.industry,
    revenue: parseFloat(prospect.revenue || '0'),
    logo_url: prospect.logo_url,
    phone: prospect.phone,
  };

  const diff = getDiffBetweenObjects(importedData, rrData);
  const newApiData = convertDataToNewDataObject(RR_TO_API_DATA_OBJECT, diff);

  const handleImportOrg = async () => {
    setLoading(true);
    const updateOrganizationData = {
      employees: prospect.employees,
      address_street: prospect.address,
      annual_revenue: prospect.revenue,
      total_revenue: prospect.revenue,
      industry: prospect.industry,
      address_city: prospect.city,
      address_state: prospect.state,
      address_country: prospect.country,
      address_postalcode: prospect.postal_code,
      sic_code: '' + parseNaics(prospect.sic),
      naics_code: '' + parseNaics(prospect.naics),
      ticker_symbol: prospect.ticker,
      avatar: prospect.logo_url,
      phone_office: prospect.phone,
      phone_fax: prospect.fax,
      website: prospect.domain,
      external_id: '' + prospect.id,
      name: prospect.name,
    };

    try {
      // import, but we are really updating existing info
      await orgService.updateOrganization(
        params.organizationId,
        updateOrganizationData
      );
      setOpenImportModal(false);
      setSuccessMessage('Company imported successfully.');
      overflowing();
      if (refresh) {
        refresh();
      } else {
        setTimeout(() => {
          window.location.reload(false);
        }, 3000);
      }
    } catch (e) {
      console.log(e);
      setErrorMessage('Error import company. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  const handleMergeOrg = async () => {
    if (Object.keys(newApiData)?.length > 0) {
      setMerging(true);
      try {
        // import, but we are really updating existing info
        await orgService.updateOrganization(params.organizationId, newApiData);
        setOpenImportModal(false);
        setSuccessMessage('Company data merged successfully.');
        overflowing();
        if (refresh) {
          refresh();
        } else {
          setTimeout(() => {
            window.location.reload(false);
          }, 3000);
        }
      } catch (e) {
        console.log(e);
        setErrorMessage('Error merging company data. Please try again later.');
      } finally {
        setMerging(false);
      }
    } else {
      setMerging(false);
      setOpenImportModal(false);
      setSuccessMessage('Company data merged successfully.');
      overflowing();
    }
  };

  return (
    <div>
      {openImportModal && (
        <SimpleModalCreation
          open={openImportModal}
          bodyClassName="text-center"
          customModal="w-50"
          noFooter
          bankTeam
        >
          <div>
            <Image src={helpOutline} className="mb-4" />
            <p
              className="font-inter"
              dangerouslySetInnerHTML={{
                __html: modalDescription,
              }}
            ></p>

            <div className="card">
              <div className="card-body mb-2">
                <RocketReachOrganizationCard
                  prospect={prospect}
                  showDescription={false}
                />
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 my-3">
            <CardButton
              type="button"
              title="Cancel"
              className="btn btn-sm btn-outline-danger w-100"
              onClick={() => {
                overflowing();
                setOpenImportModal(false);
              }}
            />
            {data.external_id && (
              <CardButton
                type="button"
                title="Merge"
                variant="primary"
                className="btn-sm w-100"
                isLoading={merging}
                disabled={merging}
                onClick={handleMergeOrg}
              />
            )}
            {isPermissionAllowed('prospects', 'create') &&
              isPermissionAllowed('contacts', 'create') && (
                <CardButton
                  type="button"
                  title="Import"
                  variant="primary"
                  className="btn-sm w-100"
                  isLoading={loading}
                  disabled={loading}
                  onClick={handleImportOrg}
                />
              )}
          </div>
        </SimpleModalCreation>
      )}
      {children}
    </div>
  );
};

export default ImportOrganization;
