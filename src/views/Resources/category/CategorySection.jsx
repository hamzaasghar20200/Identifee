import Card from '../../../components/lesson/card';
import SubHeading from '../../../components/subheading';
import React from 'react';
import CardSkeleton from '../../../components/lesson/CardSkeleton';
import StatsAndFilter from '../../../components/lesson/StatsAndFilter';

const CategorySection = ({
  data,
  setData,
  loading,
  slug,
  title,
  sectionType,
  category,
  self,
  topics,
  handleFilterSelect,
  filterOptionSelected,
  overview,
}) => {
  const sectionCcontent = () => {
    if (loading)
      return (
        <>
          <SubHeading title={title} />
          <div className="px-1">
            <CardSkeleton count={3} cols="row-cols-md-3" />
          </div>
        </>
      );

    if (data.length > 0) {
      return (
        <>
          <div
            className={
              title === 'Lessons'
                ? 'd-flex mb-3 align-items-center justify-content-between page-header-divider'
                : 'page-header-divider mb-3'
            }
          >
            <SubHeading title={title} headingStyle="mt-0 mb-0" />
            {title === 'Lessons' && (
              <StatsAndFilter
                handleFilterSelect={handleFilterSelect}
                filterOptionSelected={filterOptionSelected}
                stats={overview}
                loading={loading}
                lessonKey="total_lessons"
                type="Categories"
                categoryInfo={category}
              />
            )}
          </div>

          <div className="px-1">
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3">
              {data?.map((item) => (
                <div key={item.id} className="col mb-5 px-2">
                  <Card
                    item={item}
                    setItem={setData}
                    self={self}
                    icon={item?.category?.icon || 'summarize'}
                    sectionType={sectionType}
                    topics={topics}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      );
    }

    return '';
  };

  return <>{sectionCcontent()}</>;
};

export default CategorySection;
