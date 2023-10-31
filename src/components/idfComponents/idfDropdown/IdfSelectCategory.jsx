import React, { useState, useEffect } from 'react';
import { FormGroup, Label } from 'reactstrap';
import categoryService from '../../../services/category.service';
import { onInputSearch } from '../../../views/Deals/contacts/utils';
import AutoComplete from '../../AutoComplete';
import { SEARCH_FOR_CATEGORY } from '../../../utils/constants';

const IdfSelectCategory = ({
  label,
  onChange,
  selectedCat,
  getFieldState,
  fieldName,
  ...rest
}) => {
  const [categoryData, setCategoryData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [charactersRequire, setCharactersRequire] = useState('');
  const [searchCategory, setSearchCategory] = useState({
    search: '',
  });

  useEffect(() => {
    // when in edit form
    if (selectedCat?.title) {
      setSelectedCategory(selectedCat);
    }
  }, [selectedCat]);

  useEffect(() => {
    onGetCategories();
  }, [searchCategory.search]);

  const onGetCategories = async () => {
    const response = await categoryService
      .GetCategories(
        { search: searchCategory.search },
        {
          page: 1,
          limit: 1000,
        }
      )
      .catch((err) => console.log(err));

    const { data } = response || {};

    // since we changed the request, in new change it comes back in data field without any pagination object
    setCategoryData([...data].map((m) => ({ ...m, icon: null })));
  };
  const stateChange = (e) => {
    const match = e.target.value.match(/([A-Za-z])/g);
    if (match && match.length >= 2) {
      setCharactersRequire('');
      onInputSearch(e, searchCategory, setSearchCategory);
    } else {
      setSearchCategory({});
      onChange({});
      return setCharactersRequire(match?.length);
    }
  };
  return (
    <FormGroup>
      {label && <Label>{label}</Label>}
      <AutoComplete
        {...rest}
        id={fieldName}
        name={fieldName}
        placeholder={SEARCH_FOR_CATEGORY}
        onChange={(e) => stateChange(e)}
        data={categoryData}
        loading={false}
        type="organization"
        onHandleSelect={(item) => {
          setSearchCategory(item);
          onChange(item);
        }}
        fieldState={getFieldState(fieldName)}
        charactersRequire={charactersRequire}
        customKey="title"
        selected={selectedCategory?.title || ''}
        search={searchCategory.search}
      />
    </FormGroup>
  );
};

export default IdfSelectCategory;
