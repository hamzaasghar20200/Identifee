import React, { useState } from 'react';
import { Collapse } from 'react-bootstrap';

import InputSearch from './InputSearch';
import InputDefault from './InputDefault';
import { USACitiesByState } from '../../constants';
import {
  degreeList,
  normalizedTitle,
  revenueListNew,
  employeeCountListNew,
} from '../constants';
import CategoryMenu from '../CategoryMenu';
import InputRange from './InputRange';
import {
  INDUSTRIES_STORAGE_KEY,
  NAICS_STORAGE_KEY,
  SIC_STORAGE_KEY,
  sortedUSACitiesByState,
} from '../../../../utils/Utils';
import TechnologiesSearch from './TechnologiesSearch';

const cityArray = sortedUSACitiesByState(USACitiesByState);

const revenue = {
  components: [
    {
      component: (
        <InputSearch
          name="Revenue"
          limit={7}
          list={revenueListNew}
          customKey="key"
          keyType="employer"
          keyFilter="company_revenue"
          placeholder="Enter revenue search..."
          showLabelColon={false}
        />
      ),
    },
  ],
  id: 51,
  icon: 'monetization_on',
  titleWrapper: 'Revenue',
  keyFilter: ['company_revenue'],
  titles: ['Revenue'],
};

const industry = {
  components: [
    {
      component: (
        <TechnologiesSearch
          name="NAICS Code"
          keyType="employer"
          keyFilter="company_naics_code"
          placeholder="Enter a NAICS code search..."
          showLabelColon={false}
          callKey={NAICS_STORAGE_KEY}
          callType="getNaicsCodes"
        />
      ),
    },
    {
      component: (
        <TechnologiesSearch
          name="SIC Code"
          keyType="employer"
          keyFilter="company_sic_code"
          placeholder="Enter a SIC code search..."
          showLabelColon={false}
          callKey={SIC_STORAGE_KEY}
          callType="getSicCodes"
        />
      ),
    },
    {
      component: (
        <TechnologiesSearch
          name="Industry"
          keyType="employer"
          keyFilter="company_industry"
          placeholder="Enter a industry search..."
          showLabelColon={false}
          callKey={INDUSTRIES_STORAGE_KEY}
          callType="getIndustries"
        />
      ),
    },
  ],
  id: 7,
  titleWrapper: 'Industry',
  icon: 'area_chart',
  keyFilter: ['company_naics_code', 'company_sic_code', 'company_industry'],
  titles: ['NAICS Code', 'SIC Code', 'Industry'],
};

const stepItems = {
  global: [
    {
      components: [
        {
          component: (
            <InputDefault
              name="Name"
              keyType="global"
              keyFilter="name"
              placeholder="Enter name search..."
              showLabelColon={false}
            />
          ),
        },
      ],
      id: 1,
      icon: 'person',
      titleWrapper: 'Name',
      keyFilter: ['name'],
      titles: ['Name'],
    },
  ],
  domain: [
    {
      components: [
        {
          component: (
            <InputDefault
              name="Domain"
              keyType="domain"
              keyFilter="domain"
              placeholder="Enter domain"
              showLabelColon={false}
            />
          ),
        },
      ],
      id: 15,
      icon: 'language',
      keyFilter: ['domain'],
      titles: ['Domain'],
    },
  ],
  location: [
    {
      components: [
        {
          component: (
            <InputSearch
              name="City, State"
              list={cityArray}
              limit={cityArray?.length}
              keyType="location"
              keyFilter="location"
              placeholder="Enter city, state search..."
              showLabelColon={false}
            />
          ),
        },
        {
          component: <InputRange keyType="location" keyFilter="radius" />,
        },
      ],
      id: 2,
      icon: 'pin_drop',
      keyFilter: ['city', 'location'],
      titles: ['City', 'Location'],
    },
  ],
  employees: [
    {
      components: [
        {
          component: (
            <InputSearch
              name="Employee Count"
              limit={9}
              keyType="employer"
              keyFilter="employees"
              customKey="key"
              list={employeeCountListNew}
              placeholder="Enter employee count search..."
              showLabelColon={false}
            />
          ),
        },
      ],
      id: 5,
      icon: 'group',
      titleWrapper: 'Employee Count',
      keyFilter: ['employees'],
      titles: ['Employee Count'],
    },
  ],
  occupation: [
    {
      components: [
        {
          component: (
            <InputDefault
              name="Job Title"
              keyType="occupation"
              keyFilter="current_title"
              placeholder="Enter job title search..."
              showLabelColon={false}
            />
          ),
        },
        {
          component: (
            <InputSearch
              name="Normalized Job Title"
              list={normalizedTitle}
              keyType="occupation"
              keyFilter="normalized_title"
              placeholder="Enter normalized job title search..."
              showLabelColon={false}
            />
          ),
        },
      ],
      id: 3,
      titleWrapper: 'Job Title',
      icon: 'business_center',
      keyFilter: ['current_title', 'normalized_title'],
      titles: ['Job Title', 'Normalized Job Title'],
    },
  ],
  employer: [
    {
      components: [
        {
          component: (
            <InputDefault
              name="Company Name or Domain"
              keyType="employer"
              keyFilter="current_employer"
              placeholder="Enter company name or domain search..."
              showLabelColon={false}
            />
          ),
        },
      ],
      id: 4,
      titleWrapper: 'Company Name or Domain',
      icon: 'domain',
      keyFilter: ['current_employer'],
      titles: ['Company Name'],
    },
    {
      components: [
        {
          component: (
            <InputSearch
              name="Employee Count"
              limit={9}
              keyType="employer"
              keyFilter="company_size"
              customKey="key"
              list={employeeCountListNew}
              placeholder="Enter employee count search..."
              showLabelColon={false}
            />
          ),
        },
      ],
      id: 5,
      icon: 'group',
      titleWrapper: 'Employee Count',
      keyFilter: ['company_size'],
      titles: ['Employee Count'],
    },
    revenue,
    industry,
  ],
  education: [
    {
      components: [
        {
          component: (
            <InputDefault
              name="Major"
              keyType="education"
              keyFilter="major"
              placeholder="Enter major search..."
              showLabelColon={false}
            />
          ),
        },
        {
          component: (
            <InputDefault
              name="School"
              keyType="education"
              keyFilter="school"
              placeholder="Enter school search..."
              showLabelColon={false}
            />
          ),
        },
        {
          component: (
            <InputSearch
              name="Degree"
              limit={9}
              keyType="education"
              placeholder="Enter degree search..."
              keyFilter="degree"
              list={degreeList}
              showLabelColon={false}
            />
          ),
        },
      ],
      id: 8,
      icon: 'school',
      keyFilter: ['degree', 'school', 'major'],
      titles: ['Degree', 'School', 'Major'],
    },
  ],
  other: [
    {
      components: [
        {
          component: (
            <InputDefault
              name="Keywords"
              keyType="other"
              keyFilter="keyword"
              placeholder="Enter keywords search..."
              showLabelColon={false}
            />
          ),
        },
      ],
      id: 9,
      titleWrapper: 'Keywords',
      icon: 'search',
      keyFilter: ['keyword'],
      titles: ['Keywords'],
    },
  ],
};

const FilterItemMenu = ({
  title,
  data,
  setData,
  onEnter,
  active,
  setActive,
}) => {
  const [activeTap] = useState(true);

  return (
    <div className="w-100">
      <Collapse in={activeTap}>
        <div>
          {Array.isArray(stepItems[title]) ? (
            <CategoryMenu
              stepItems={stepItems}
              title={title}
              data={data}
              setData={setData}
              onEnter={onEnter}
              active={active}
              setActive={setActive}
            />
          ) : (
            <></>
          )}
        </div>
      </Collapse>
    </div>
  );
};

export default FilterItemMenu;
