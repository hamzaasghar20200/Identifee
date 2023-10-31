import DromoUploader from 'dromo-uploader-react';
import React from 'react';
import { Col, Row } from 'react-bootstrap';
import Heading from '../components/heading';
import { IconAndTitle } from '../components/commons/SettingCardItem';
import { isPermissionAllowed } from '../utils/Utils';
import dromoService from '../services/dromo.service';
import useIsTenant from '../hooks/useIsTenant';

const { NODE_ENV } = process.env;

const BulkImport = () => {
  const { isExcelBank } = useIsTenant();
  // Global tenant refers to the base common schema
  const getSchemaURN = (env, schemaName, tenantId = 'global') => {
    return `urn:env:${env}:tenant:${tenantId}:schema:${schemaName}`;
  };

  const sendResults = (type) => {
    /**
     * data: { [key: string]: string | boolean | number | null }[]
     * metadata: { id: string }
     */
    return async (data, metadata) => {
      await dromoService.callback({
        type,
        uploadId: metadata.id,
      });
    };
  };

  const getDromoTile = (type, iconProps) => {
    return (
      <Col md={3}>
        <div className={`card setting-item border-2 position-relative h-100`}>
          <DromoUploader
            licenseKey={process.env.REACT_APP_PROVIDER_DROMO_KEY}
            className="card-body text-center p-4"
            style={{ border: 0, backgroundColor: 'white' }}
            schemaName={getSchemaURN(NODE_ENV, type)}
            onResults={sendResults(type)}
          >
            <div className="stretched-link justify-content-center align-items-center d-flex flex-column">
              <IconAndTitle item={iconProps} />
            </div>
          </DromoUploader>
        </div>
      </Col>
    );
  };

  return (
    <div>
      <Heading title="Select Import type" />
      <Row>
        {getDromoTile('organization', {
          title: 'Import Companies',
          icon: 'corporate_fare',
        })}
        {isPermissionAllowed('contacts', 'create') &&
          getDromoTile('contact', {
            title: 'Import People',
            icon: 'people_outline',
          })}
        {getDromoTile('product', {
          title: 'Import Products',
          icon: 'app_registration',
        })}
        {isExcelBank && (
          <Col md={3}>
            <div
              className={`card setting-item border-2 cursor-pointer p-4 text-center position-relative h-100`}
            >
              <IconAndTitle
                item={{
                  title: 'Import Checklists',
                  icon: 'edit_note',
                }}
              />
            </div>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default BulkImport;
