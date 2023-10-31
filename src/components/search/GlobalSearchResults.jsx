import { forwardRef, useState } from 'react';
import { Col, Container, Dropdown, ListGroup, Row } from 'react-bootstrap';
import { capitalize } from 'lodash/string';

import { ResultsItem } from './ResultsItem';
import SearchAddQuickAction from './SearchAddQuickAction';
import MaterialIcon from '../commons/MaterialIcon';
import constants from './GlobalSearch.constants.json';
import useIsTenant from '../../hooks/useIsTenant';
import { useModuleContext } from '../../contexts/moduleContext';
export const GlobalSearchResults = ({
  searchValue,
  searchResults,
  setToast,
  filterSelected,
  activityDetail,
  setShow,
}) => {
  return (
    <Dropdown.Menu
      as={CustomSearchResults}
      searchValue={searchValue}
      filterSelected={filterSelected}
      searchResults={searchResults}
      setToast={setToast}
      activityDetail={activityDetail}
      setShow={setShow}
    />
  );
};

const ResultsList = ({
  type,
  searchResults,
  setToast,
  activityDetail,
  searchValue,
  filterSelected,
  setShow,
}) => {
  const [isResultShow, setisResultShow] = useState(true);
  const { moduleMap } = useModuleContext();
  // lesson/course/category is merged into training for now
  const trainingSubCategories = ['lesson', 'course', 'category'];
  // var isResultExist = false;

  const typeAliases = {
    organization: useIsTenant().isSynovusBank
      ? 'insight'
      : moduleMap.organization.plural,
    deal: moduleMap.deal.plural,
    training: 'learn',
    contact: moduleMap.contact.plural,
    product: moduleMap.product.plural,
  };
  return (
    <div className="h-100">
      <h5
        className="font-weight-500 px-3 pt-3 pb-2 mb-0"
        dangerouslySetInnerHTML={{
          __html: isResultShow
            ? filterSelected.key
              ? `${
                  capitalize(typeAliases[type] || type) || ''
                } search results for <b>"${searchValue || ''}"</b>`
              : 'No filters selected.'
            : '',
        }}
      ></h5>
      <ListGroup className="search-options h-100">
        {Object.keys(searchResults).map((key, keyIndex) => {
          const mainIconsList = constants.mainIconsList;
          const mainIcon = mainIconsList[key];
          return (
            <div key={`search-${keyIndex}`}>
              {(filterSelected?.key === 'all'
                ? true
                : type === key || filterSelected.type === key) && (
                <h3 className="pb-0 text-capitalize pl-3 mb-0">
                  <MaterialIcon icon={mainIcon} />{' '}
                  {key
                    .replace(/organization/g, moduleMap.organization.plural)
                    .replace(/contact/g, moduleMap.contact.plural)
                    .replace(/deal/g, moduleMap.deal.plural)
                    .replace(/product/g, moduleMap.product.plural)
                    .replace(/task/g, moduleMap.task.plural)
                    .replace(/event/g, moduleMap.event.plural)
                    .replace(/call/g, moduleMap.call.plural)}
                </h3>
              )}
              {searchResults[key]?.length > 0 &&
                searchResults[key]?.map((data, index) => {
                  if (
                    !type ||
                    type === data.kind ||
                    (type === 'training' &&
                      trainingSubCategories.includes(data.kind))
                  ) {
                    if (!isResultShow) {
                      setisResultShow(true);
                    }
                    const keyResult = `search_result_${index}`;
                    return (
                      <ResultsItem
                        key={keyResult}
                        type={data.kind}
                        activityType={data.type}
                        contactId={data.contact_id}
                        contactName={data.contact_name?.trim()}
                        dealId={data.deal_id}
                        dealName={data.deal_name}
                        productName={data.product_name}
                        organizationId={data.organization_id}
                        organizationName={data.organization_name}
                        lessonId={data.lesson_id}
                        lessonName={data.lesson_name}
                        categoryId={data.category_id}
                        categoryName={data.category_name}
                        courseId={data.course_id}
                        courseName={data.course_name}
                        activityId={data.activity_id}
                        activityName={data.activity_name}
                        fileId={data.file_id}
                        fileName={data.file_name}
                        activityDetail={activityDetail}
                        setToast={setToast}
                        setShow={setShow}
                      />
                    );
                  } else return null;
                })}
            </div>
          );
        })}
      </ListGroup>
      {
        // if no result found show message and add action
        !isResultShow ? (
          <div className="h-100 text-center px-8 pt-8">
            <h4>
              No result in {typeAliases[type] || type} for <q>{searchValue}</q>
            </h4>
            <SearchAddQuickAction
              type={typeAliases[type] || type}
              searchValue={searchValue}
            ></SearchAddQuickAction>
          </div>
        ) : (
          <></>
        )
      }
    </div>
  );
};

const CustomSearchResults = forwardRef(
  (
    {
      className,
      style,
      'aria-labelledby': labeledBy,
      searchValue,
      searchResults,
      setToast,
      activityDetail,

      setShow,
      filterSelected,
    },
    ref
  ) => {
    const Results = ({ filterSelected, activityDetail }) => (
      <Col className="px-1">
        <ResultsList
          type={filterSelected.kind}
          filterSelected={filterSelected}
          searchResults={searchResults}
          setToast={setToast}
          searchValue={searchValue}
          setShow={setShow}
          activityDetail={activityDetail}
        />
      </Col>
    );

    const ResultsPanel = ({ children }) => (
      <div
        ref={ref}
        style={style}
        className={`${className} search-dropdown-menu p-0`}
        aria-labelledby={labeledBy}
      >
        <Container className="w-100 pr-0 ml-0 pl-0">
          <Row className="w-100 mx-0">{children}</Row>
        </Container>
      </div>
    );
    return (
      <ResultsPanel>
        <Results
          filterSelected={filterSelected}
          activityDetail={activityDetail}
        />
      </ResultsPanel>
    );
  }
);

CustomSearchResults.displayName = 'CustomSearchResults';
