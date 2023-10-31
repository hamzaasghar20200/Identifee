import React from 'react';

const Bullets = ({
  list,
  listStyle = { marginLeft: 0 },
  itemStyle = 'ml-4',
}) => {
  return (
    <ul className="list-disc" style={listStyle}>
      {list.map((txt) => (
        <li
          className={itemStyle}
          key={txt}
          style={txt.includes('<ul') ? { listStyleType: 'none' } : {}}
        >
          <p className="mb-2" dangerouslySetInnerHTML={{ __html: txt }} />
        </li>
      ))}
    </ul>
  );
};

export default Bullets;
