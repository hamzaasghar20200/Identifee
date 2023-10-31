import React, { useState, useEffect, useRef } from 'react';

export const ShortDescription = ({ content, limit, align = '' }) => {
  const [expanded, setExpanded] = useState(false);
  const descriptionRef = useRef(null);
  const toggleExpand = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };
  const contentLength = content.length;
  const renderContent = () => {
    return content.slice(0, limit) + '...';
  };

  const renderTooltip = () => {
    if (expanded) {
      return content;
    }
    return null;
  };
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        descriptionRef.current &&
        !descriptionRef.current.contains(event.target)
      ) {
        event.stopPropagation();
        setExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);
  return (
    <div
      ref={descriptionRef}
      className="d-flex align-items-center position-relative"
    >
      <p className="mb-0">
        {contentLength >= limit ? renderContent() : content}
      </p>
      {content.length > limit && (
        <button
          onClick={toggleExpand}
          className="btn bg-none text-primary fs-7 fw-bold border-0 p-0"
        >
          {expanded ? 'Less' : 'More'}
        </button>
      )}
      {expanded && (
        <div className={`tooltipMain shadow-lg ${align}`}>
          <span className="ArrowIcon"></span>
          <p className="tooltipModal fs-7 text-black text-wrap">
            {renderTooltip()}
          </p>
        </div>
      )}
    </div>
  );
};
