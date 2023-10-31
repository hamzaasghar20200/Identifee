import { useParams, useHistory } from 'react-router';
import React, { useEffect, useState } from 'react';
import prospectService from '../services/prospect.service';
import { ProspectTypes } from '../components/prospecting/v2/constants';
import RRCompanyDetails from '../components/prospecting/v2/RRCompanyDetails';

const ProspectCompanyDetails = () => {
  const { name } = useParams();
  const [company, setCompany] = useState({});
  const [socialLinks, setSocialLinks] = useState({});
  const [loader, setLoader] = useState(false);
  const history = useHistory();
  const params = new URLSearchParams(history.location.search);
  const swot = params.get('swot');
  const id = params.get('id');
  useEffect(() => {
    (async () => {
      setLoader(swot !== 'true');
      try {
        const idIncluded = id ? { id: [id] } : {};
        const { data } = await prospectService.query(
          { name: [name], ...idIncluded },
          {
            page: 1,
            limit: 1,
            type: ProspectTypes.company,
          }
        );
        const companyDetails = data?.data[0];
        setCompany(companyDetails);
        setSocialLinks(companyDetails?.links || {});
      } catch (e) {
        console.log(e);
      } finally {
        setLoader(false);
      }
    })();
  }, []);
  return (
    <>
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <RRCompanyDetails
            company={company}
            loader={loader}
            socialLinks={socialLinks}
            allowBack={true}
          />
        </div>
      </div>
    </>
  );
};

export default ProspectCompanyDetails;
