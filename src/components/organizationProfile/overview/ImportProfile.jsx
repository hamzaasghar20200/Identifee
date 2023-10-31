import SimpleModalCreation from '../../modal/SimpleModalCreation';
import helpOutline from '../../../assets/svg/help_outline.svg';
import { Image } from 'react-bootstrap';
import { CardButton } from '../../layouts/CardLayout';
import RocketReachPeopleCard from './RocketReachPeopleCard';
import {
  isModuleAllowed,
  isPermissionAllowed,
  overflowing,
} from '../../../utils/Utils';
import React, { useState } from 'react';

// made the component generic so that we can call it from everywhere
// currently its being used in Import Profile click from Find Prospects UI and right bar in Org profile
const ImportProfile = ({
  children,
  openImportModal,
  setOpenImportModal,
  prospect,
  handleImport,
  loading,
  tenant,
  multiple,
  data = {},
  fromAutoAwesome = {},
  modalDescription = 'Would you like to Import Contact? <br /> Importing will overwrite existing Contact details.',
}) => {
  const [infoLoading, setInfoLoading] = useState(true);
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
                __html: multiple
                  ? 'Would you like to Import Contacts? Importing will overwrite existing Contact details.'
                  : modalDescription,
              }}
            ></p>

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
              title="Cancel"
              className="btn btn-sm btn-outline-danger w-100"
              onClick={() => {
                overflowing();
                setOpenImportModal(false);
              }}
            />

            {data?.external_id && (
              <CardButton
                type="button"
                title="Merge"
                variant="primary"
                className="btn-sm w-100"
                isLoading={fromAutoAwesome.loading}
                disabled={fromAutoAwesome.loading || infoLoading}
                onClick={fromAutoAwesome.handleMerge}
              />
            )}

            {isPermissionAllowed('prospects', 'create') &&
              isPermissionAllowed('contacts', 'create') &&
              isModuleAllowed(
                tenant?.modules,
                'prospecting_peoples_import'
              ) && (
                <CardButton
                  type="button"
                  title="Import"
                  variant="primary"
                  className="btn-sm w-100"
                  isLoading={loading}
                  disabled={infoLoading}
                  onClick={() => {
                    overflowing();
                    handleImport();
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

export default ImportProfile;
