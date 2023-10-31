export const States = ({ pagination }) => {
  return (
    <div className="bottom-states shadow px-3 mt-5">
      <ul className="mb-0">
        <li>
          Total Companies <span className="mx-1">&bull;</span>{' '}
          {pagination?.count}
        </li>
      </ul>
    </div>
  );
};
