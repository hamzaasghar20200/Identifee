import React from 'react';
import Wrapper from './common/Wrapper';
import { employeeCountListNew, revenueListNew } from './constants';
import _ from 'lodash';

const CategoryMenu = ({
  stepItems = [],
  title,
  data,
  setData,
  onEnter,
  active,
  setActive,
}) => {
  const buildList = (list, optionList) => {
    return list
      .map((it) => {
        return _.find(optionList, { value: it })?.key;
      })
      .join(', ');
  };

  const toString = (key, keyChildren = [], titles) => {
    let string = '';
    const current = data[key];

    keyChildren.forEach((item, index) => {
      if (Array.isArray(current?.[item])) {
        if (current[item]?.length) {
          string = `"${current[item]}"${string === '' ? '' : ','} ${string} `;
        }
        // some exceptions
        if (string) {
          if (keyChildren.includes('company_revenue')) {
            const revenueString = buildList(current?.[item], revenueListNew);
            string = `"${revenueString}"`;
          } else if (keyChildren.includes('company_size')) {
            const employeeSizeString = buildList(
              current?.[item],
              employeeCountListNew
            );
            string = `"${employeeSizeString}"`;
          }
        }
      } else {
        if (current?.[item]?.trim()) {
          string = `"${current[item]}"${string === '' ? '' : ','} ${string} `;
        }
      }
    });

    return string;
  };

  return (
    <>
      {stepItems[title].map(
        ({ components, icon, keyFilter, titleWrapper, id, titles }, i) => {
          return (
            <Wrapper
              key={i}
              value={toString(title, keyFilter, titles)}
              title={titleWrapper || title}
              icon={icon}
              active={active}
              setActive={setActive}
              id={id}
            >
              {components.map(({ component }, j) => {
                return React.cloneElement(component, {
                  key: j,
                  data,
                  setData,
                  onEnter,
                });
              })}
            </Wrapper>
          );
        }
      )}
    </>
  );
};

export default CategoryMenu;
