import React from 'react';

const FullNameInitials = ({ fullName }) => {
  const names = fullName.split(' ');

  const initials = names
    .filter((name) => name.length > 0)
    .map((name) => name[0].toUpperCase()) // Get the first letter of each name and capitalize it
    .join('');

  return (
    <div className="visibility-size bg-purpel text-purpel font-size-mini rounded-circle fw-bold">
      {initials}
    </div>
  );
};

export default FullNameInitials;
