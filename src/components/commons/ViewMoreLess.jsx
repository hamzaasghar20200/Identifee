import { useState } from 'react';

const ViewMoreLess = ({
  text,
  limit,
  byWords,
  splitOn = ', ',
  children,
  showMoreText = '(View more)',
  showLessText = '(Show fewer)',
  showMoreStyle = 'font-size-sm2 font-weight-bold',
}) => {
  const [showMore, setShowMore] = useState(false);

  const limitByWords = () => {
    if (byWords) {
      return text.split(splitOn).slice(0, byWords).join(splitOn);
    }
    return text.substring(0, limit);
  };

  const handleShowMore = (e) => {
    e.preventDefault();
    setShowMore(true);
  };

  const handleShowLess = (e) => {
    e.preventDefault();
    setShowMore(false);
  };
  return (
    <>
      {children ? (
        <>
          {!showMore && (
            <>
              <a
                href=""
                className="font-size-sm2 font-weight-bold d-inline-block mb-4"
                onClick={handleShowMore}
              >
                Read More ...
              </a>
            </>
          )}
          {showMore && (
            <>
              {children}
              <a
                href=""
                className="font-size-sm2 font-weight-bold d-inline-block mb-4"
                onClick={handleShowLess}
              >
                Read Less
              </a>
            </>
          )}
        </>
      ) : (
        <>
          {limit > text.length ? (
            text
          ) : (
            <>
              {!showMore && (
                <>
                  {limitByWords()}{' '}
                  <a href="" className={showMoreStyle} onClick={handleShowMore}>
                    {showMoreText}
                  </a>{' '}
                </>
              )}
              {showMore && (
                <>
                  {text.substring(0, text.length)}
                  <a href="" className={showMoreStyle} onClick={handleShowLess}>
                    {showLessText}
                  </a>{' '}
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default ViewMoreLess;
