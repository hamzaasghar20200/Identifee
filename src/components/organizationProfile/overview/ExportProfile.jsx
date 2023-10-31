import SimpleModalCreation from '../../modal/SimpleModalCreation';
import helpOutline from '../../../assets/svg/help_outline.svg';
import { Image } from 'react-bootstrap';
import { CardButton } from '../../layouts/CardLayout';
import RocketReachPeopleCard from './RocketReachPeopleCard';
import { isModuleAllowed, overflowing } from '../../../utils/Utils';
import { useState } from 'react';

const ExportProfile = ({
  children,
  openModal,
  setOpenModal,
  prospect,
  handleExport,
  loading,
  multiple,
  tenant,
}) => {
  const [infoLoading, setInfoLoading] = useState(false);
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
                ? 'Are you sure you want to export following profiles'
                : 'Are you sure you want to export the following profile'}
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
                      <RocketReachPeopleCard
                        prospect={pros}
                        showSocialLinks={false}
                        withContactInfo={true}
                        setInfoLoading={setInfoLoading}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card">
                <div className="card-body mb-2">
                  <RocketReachPeopleCard
                    prospect={prospect[0]}
                    showSocialLinks={false}
                    withContactInfo={true}
                    setInfoLoading={setInfoLoading}
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
            {isModuleAllowed(tenant?.modules, 'prospecting_peoples_export') && (
              <CardButton
                type="button"
                title="Yes, Export"
                variant="primary"
                className="btn-sm w-100"
                isLoading={loading}
                disabled={infoLoading}
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

export default ExportProfile;
