import SimpleModalCreation from '../../modal/SimpleModalCreation';
import helpOutline from '../../../assets/svg/help_outline.svg';
import { Image } from 'react-bootstrap';
import { CardButton } from '../../layouts/CardLayout';
import { isModuleAllowed, overflowing } from '../../../utils/Utils';
import React from 'react';
import RocketReachOrganizationCard from './RocketReachOrganizationCard';

const ExportCompanies = ({
  children,
  openModal,
  setOpenModal,
  prospect,
  handleExport,
  loading,
  multiple,
  tenant,
}) => {
  return (
    <div>
      {openModal && (
        <SimpleModalCreation
          open={openModal}
          bodyClassName="text-center"
          customModal="w-30"
          noFooter
          bankTeam
        >
          <div>
            <Image src={helpOutline} className="mb-4" />

            <p className="font-inter">
              {multiple
                ? 'Are you sure you want to export following companies'
                : 'Are you sure you want to export the following company'}
              ?
            </p>

            {multiple ? (
              <div
                style={{
                  maxHeight: 410,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                }}
              >
                {prospect.map((pros) => (
                  <div key={pros.id} className="card mb-1">
                    <div className="card-body">
                      <RocketReachOrganizationCard
                        prospect={pros}
                        showDescription={false}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card">
                <div className="card-body mb-2">
                  <RocketReachOrganizationCard
                    prospect={prospect[0]}
                    showDescription={false}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="d-flex align-items-center gap-2 mt-3 mb-0">
            <CardButton
              type="button"
              title="No, Cancel"
              className="btn-sm btn-outline-danger w-100"
              onClick={() => {
                overflowing();
                setOpenModal(false);
              }}
            />
            {isModuleAllowed(
              tenant?.modules,
              'prospecting_companies_export'
            ) && (
              <CardButton
                type="button"
                title="Yes, Export"
                variant="primary"
                className="btn-sm w-100"
                isLoading={loading}
                onClick={() => {
                  overflowing();
                  handleExport();
                }}
              />
            )}
          </div>
        </SimpleModalCreation>
      )}
      {children}
    </div>
  );
};

export default ExportCompanies;
