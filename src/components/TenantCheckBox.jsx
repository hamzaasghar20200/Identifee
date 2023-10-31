import React, { useEffect, useState } from 'react';
import { FormCheck } from 'react-bootstrap';
import { isModuleChecked, replaceSpaceWithCharacter } from '../utils/Utils';
import { ModulesList } from '../utils/modules';
import _ from 'lodash';
import { ImageList, ImageListItem } from '@mui/material';
// Create an array of unique group names

const groupedData = ModulesList.map((item) => {
  const newItem = {
    id: item.id,
    label: item.name,
    group: item.group,
    name: item.name.replace(/ /g, '_').toLowerCase(),
  };

  if (item.children) {
    newItem.children = item.children.map((child) => ({
      id: child.id,
      label: child.name,
      name: child.name.replace(/ /g, '_').toLowerCase(),
      grandchildren: child.grandchildren
        ? child.grandchildren.map((grandchild) => ({
            id: grandchild.id,
            label: grandchild.name,
            name: grandchild.name.replace(/ /g, '_').toLowerCase(),
          }))
        : undefined,
    }));
  }

  return newItem;
});

const groupNames = [...new Set(groupedData.map((module) => module.group))];

// Combine the data and groups
const combinedData = groupNames.map((groupName) => ({
  name: groupName,
  modules: groupedData.filter((module) => module.group === groupName),
}));

const TenantCheckBox = ({
  modulesData,
  selectedCheckboxes,
  setSelectedCheckboxes,
}) => {
  const [allCheck, setAllCheck] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});

  // Function to check or uncheck all checkboxes
  const handleSelectAllChange = (isChecked) => {
    const updatedCheckedItems = { ...checkedItems };
    ModulesList.forEach((item) => {
      const itemName = replaceSpaceWithCharacter(item.name, '_').toLowerCase();
      updatedCheckedItems[itemName] = isChecked;

      if (item.children && item.children.length > 0) {
        item.children.forEach((child) => {
          const childName = `${
            itemName !== child.name
              ? `${itemName}_${replaceSpaceWithCharacter(
                  child.name,
                  '_'
                ).toLowerCase()}`
              : replaceSpaceWithCharacter(child.name, '_').toLowerCase()
          }`;
          updatedCheckedItems[childName] = isChecked;

          if (child.grandchildren && child.grandchildren.length > 0) {
            child.grandchildren.forEach((grandchild) => {
              const grandchildName = `${childName}_${replaceSpaceWithCharacter(
                grandchild.name,
                '_'
              ).toLowerCase()}`;
              updatedCheckedItems[grandchildName] = isChecked;
            });
          }
        });
      }
    });
    setCheckedItems(updatedCheckedItems);
    setAllCheck(!allCheck);
  };

  const renderCheckboxes = (items, parentName = '') => {
    return items?.map((item, index) => {
      const checkboxName = parentName
        ? `${parentName}_${replaceSpaceWithCharacter(
            item.name,
            '_'
          ).toLowerCase()}`
        : replaceSpaceWithCharacter(item.name, '_').toLowerCase();

      return (
        <div key={index} className="p-1 fs-7">
          <FormCheck
            id={checkboxName}
            name={checkboxName}
            type="checkbox"
            custom={true}
            label={item?.label}
            checked={checkedItems[checkboxName] || false}
            onChange={() =>
              handleCheckboxChange(
                checkboxName,
                item.children,
                item.grandchildren,
                parentName
              )
            }
          />
          {item.grandchildren && item.grandchildren.length > 0 && (
            <div className="pl-3">
              {renderCheckboxes(item.grandchildren, checkboxName)}
            </div>
          )}
        </div>
      );
    });
  };

  const isAnyModuleChecked = (moduleName, checkedItems) => {
    const keys = _.keys(checkedItems).filter((it) => it.includes(moduleName));
    return keys.some((s) => checkedItems[s] === true);
  };
  const isAllUnChecked = (moduleName, checkedItems) => {
    const keys = Object.keys(checkedItems).filter(
      (key) => key.includes(moduleName) && key.includes('_')
    );
    const allUnchecked = keys.every((key) => {
      const isUnChecked = checkedItems[key] === false;
      return isUnChecked;
    });

    checkedItems[moduleName] = !allUnchecked;
  };

  const handleCheckboxChange = (
    itemName,
    children,
    grandchildren,
    parentName
  ) => {
    setCheckedItems((prevCheckedItems) => {
      const updatedCheckedItems = { ...prevCheckedItems };
      updatedCheckedItems[itemName] = !updatedCheckedItems[itemName];

      if (children && children.length > 0) {
        children.forEach((child) => {
          const childName = `${
            itemName !== child.name
              ? `${itemName}_${replaceSpaceWithCharacter(
                  child.name,
                  '_'
                ).toLowerCase()}`
              : replaceSpaceWithCharacter(child.name, '_').toLowerCase()
          }`;
          updatedCheckedItems[childName] = updatedCheckedItems[itemName];
          if (child.grandchildren && child.grandchildren.length > 0) {
            child.grandchildren.forEach((grandchild) => {
              const grandchildName = `${childName}_${replaceSpaceWithCharacter(
                grandchild.name,
                '_'
              ).toLowerCase()}`;
              updatedCheckedItems[grandchildName] =
                updatedCheckedItems[itemName];
            });
          }
        });
      }
      if (grandchildren && grandchildren?.length > 0) {
        grandchildren?.forEach((grandchild) => {
          const grandchildName = `${itemName}_${replaceSpaceWithCharacter(
            grandchild.name,
            '_'
          ).toLowerCase()}`;
          updatedCheckedItems[grandchildName] = updatedCheckedItems[itemName];
        });
      }
      if (parentName) {
        const splitParent = parentName.split('_');
        if (splitParent?.length) {
          updatedCheckedItems[splitParent[0]] =
            isAllUnChecked(parentName, updatedCheckedItems) ||
            isAnyModuleChecked(parentName, updatedCheckedItems);
          if (splitParent.length > 1) {
            updatedCheckedItems[splitParent.join('_')] =
              isAllUnChecked(parentName, updatedCheckedItems) ||
              isAnyModuleChecked(parentName, updatedCheckedItems);
          }
        }
      }
      return updatedCheckedItems;
    });
  };
  useEffect(() => {
    if (modulesData?.modules === '*') {
      handleSelectAllChange(true);
    }
    if (modulesData?.modules !== '*' && modulesData?.modules?.length > 0) {
      const modules = modulesData?.modules.split(',');
      const modulesObject = {};

      modules.forEach((item) => {
        modulesObject[item] = true;
      });
      setCheckedItems(modulesObject);
    }
  }, [modulesData]);

  useEffect(() => {
    if (allCheck || Object.keys(checkedItems)?.length > 0) {
      const isAllModulesChecked = ModulesList.every((item) => {
        return isModuleChecked(item, checkedItems);
      });
      if (isAllModulesChecked) {
        setAllCheck(true);
        setSelectedCheckboxes('*');
      } else {
        const selectedCheckboxNames = Object.keys(checkedItems).filter(
          (key) => checkedItems[key]
        );
        setSelectedCheckboxes(selectedCheckboxNames.join(','));
        setAllCheck(false);
      }
    } else {
      const selectedCheckboxNames = Object.keys(checkedItems).filter(
        (key) => checkedItems[key]
      );
      setSelectedCheckboxes(selectedCheckboxNames.join(','));
      setAllCheck(false);
    }
  }, [checkedItems, allCheck]);
  return (
    <>
      <div>
        <FormCheck
          id="selectAll"
          name="selectAll"
          type="switch"
          custom={true}
          label="Select All"
          checked={allCheck}
          onChange={(e) => handleSelectAllChange(e.target.checked)}
        />
      </div>
      <div className="mt-3">
        <ImageList variant="masonry" cols={2} gap={10}>
          {combinedData.map((group, index) => (
            <ImageListItem
              key={index}
              className="bg-gray-200 rounded border p-2"
            >
              {group?.modules?.map((item) => (
                <div key={item}>
                  <h5 className="mb-0 text-capitalize d-flex align-items-center">
                    <FormCheck
                      id={item.name.toLowerCase()}
                      name={item.name.toLowerCase()}
                      type="switch"
                      custom={true}
                      checked={checkedItems[item.name.toLowerCase()] || false}
                      onChange={() =>
                        handleCheckboxChange(
                          item.name.toLowerCase(),
                          item.children,
                          item.grandchildren
                        )
                      }
                    />
                    <span>{item.group}</span>
                  </h5>
                  {item?.children?.length > 0 ? (
                    <div className="pl-2 pt-2">
                      {renderCheckboxes(item.children, item.name)}
                    </div>
                  ) : null}
                </div>
              ))}
            </ImageListItem>
          ))}
        </ImageList>
      </div>
    </>
  );
};

export default TenantCheckBox;
