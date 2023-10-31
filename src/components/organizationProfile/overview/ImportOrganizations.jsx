import { Image } from 'react-bootstrap';
import React, { useState, useContext, useEffect } from 'react';
import SimpleModalCreation from '../../modal/SimpleModalCreation';
import helpOutline from '../../../assets/svg/help_outline.svg';
import { CardButton } from '../../layouts/CardLayout';
import RocketReachOrganizationCard from './RocketReachOrganizationCard';
import { AlertMessageContext } from '../../../contexts/AlertMessageContext';
import {
  arrayToCsv,
  isModuleAllowed,
  isPermissionAllowed,
  overflowing,
  parseNaics,
} from '../../../utils/Utils';
import BulkImportService from '../../../services/bulkImport.service';
import MaterialIcon from '../../commons/MaterialIcon';
import Alert from '../../Alert/Alert';
import AlertWrapper from '../../Alert/AlertWrapper';
import routes from '../../../utils/routes.json';
import { useHistory } from 'react-router-dom';

const convertRocketReachObjectToCompanyObject = (rrObjects) => {
  return rrObjects.map((prospect) => ({
    name: prospect.name,
    employees: prospect.employees,
    address_street: prospect.address,
    annual_revenue: prospect.revenue,
    total_revenue: prospect.revenue,
    industry: prospect.industry,
    address_city: prospect.city,
    address_state: prospect.state,
    address_country: prospect.country,
    address_postalcode: prospect.postal_code,
    sic_code: parseNaics(prospect.sic),
    naics_code: parseNaics(prospect.naics),
    ticker_symbol: prospect.ticker,
    avatar: prospect.logo_url,
    phone_office: prospect.phone,
    phone_fax: prospect.fax,
    website: prospect.domain,
    external_id: '' + prospect.id,
  }));
};

const ImportOrganizations = ({
  openImportModal,
  setOpenImportModal,
  prospects,
  clearSelection,
  tenant,
}) => {
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState(false);
  const [failedItems, setFailedItems] = useState([]);
  const history = useHistory();
  const { successMessage, setSuccessMessage, errorMessage, setErrorMessage } =
    useContext(AlertMessageContext);

  useEffect(() => {
    if (imported) {
      setTimeout(() => {
        if (window.location.pathname === '/prospecting') {
          history.push(routes.companies);
        }
      }, 2000);
    }
  }, [imported]);

  const handleImportOrg = async () => {
    setLoading(true);
    try {
      const companies = convertRocketReachObjectToCompanyObject(prospects);
      const headers = Object.keys(companies[0]).map((m) => ({
        label: m,
        key: m,
      }));
      const csvData = arrayToCsv(headers, companies);
      const blob = new Blob([csvData], {
        type: 'text/csv;charset=utf-8',
      });
      const file = new File([blob], 'companies-import', {
        type: 'text/csv;charset=utf-8',
      });
      const formData = new FormData();
      formData.append('file', file, file.name);
      const service = new BulkImportService();
      const { itemsFailed } = await service.bulkImport(
        formData,
        'organizations',
        { updateExisting: true }
      );
      if (itemsFailed.length) {
        setFailedItems([...itemsFailed]);
      } else {
        overflowing();
        setSuccessMessage('Companies imported successfully.');
        clearSelection();
        setOpenImportModal(false);
        setImported(true);
      }
    } catch (e) {
      console.log(e);
      setErrorMessage('Error import company. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AlertWrapper>
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
        <Alert
          color="success"
          message={successMessage}
          setMessage={setSuccessMessage}
        />
      </AlertWrapper>
      {openImportModal && (
        <SimpleModalCreation
          open={openImportModal}
          bodyClassName="text-center"
          customModal="w-50"
          noFooter
          bankTeam
        >
          {failedItems.length ? (
            <div>
              <div className="mt-2 mb-4">
                <MaterialIcon icon="cancel" clazz="font-size-5em text-danger" />
                <p className="font-inter text-left mb-2 mt-4">
                  We were unable to import following companies:
                </p>
                <ul className={`list-disc`}>
                  {failedItems.map((item) => (
                    <li
                      className="font-weight-medium text-left ml-4"
                      key={item.id}
                    >
                      <p className="mb-1">{item.name}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div>
              <Image src={helpOutline} className="mb-4" />

              <p className="font-inter">
                Would you like to Import Companies? <br /> Importing will
                overwrite existing Company details.
              </p>

              <div
                className="card-body p-0 mb-0"
                style={{
                  maxHeight: 510,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                }}
              >
                {prospects?.map((prospect) => (
                  <div key={prospect.id} className="card mb-1">
                    <div className="card-body">
                      <RocketReachOrganizationCard
                        prospect={prospect}
                        showDescription={false}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="d-flex align-items-center gap-2 mt-3 mb-0">
            <CardButton
              type="button"
              title="Cancel"
              className="btn btn-sm btn-outline-danger w-100"
              onClick={() => {
                overflowing();
                setOpenImportModal(false);
              }}
            />
            {isPermissionAllowed('contacts', 'create') &&
              isModuleAllowed(
                tenant?.modules,
                'prospecting_companies_import'
              ) && (
                <CardButton
                  type="button"
                  title="Import"
                  variant="primary"
                  className="btn-sm w-100"
                  isLoading={loading}
                  disabled={loading || failedItems.length}
                  onClick={handleImportOrg}
                />
              )}
          </div>
        </SimpleModalCreation>
      )}
    </div>
  );
};

export default ImportOrganizations;
