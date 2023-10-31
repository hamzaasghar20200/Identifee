import Avatar from '../../Avatar';

export const GetOwnersAction = ({ content }) => {
  if (content?.owners?.length) {
    const ownerUser = content?.owners;
    return (
      <>
        {ownerUser?.map((item, i) => (
          <span key={`ownersData${i}`} className="text-black fw-bold">
            <div className="d-flex align-items-center gap-1 pb-2">
              <Avatar user={item} defaultSize="xs" />
              <span>{item?.name}</span>
            </div>
          </span>
        ))}
      </>
    );
  }
};
