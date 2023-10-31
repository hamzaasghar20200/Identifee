import { useEffect, useState, useContext } from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { ASSIGNED_OWNERS } from '../../../utils/constants';

import Pagination from '../../Pagination';
import ContactOwnerList from '../../peopleProfile/owners/ContactOwnerList';
import { AlertMessageContext } from '../../../contexts/AlertMessageContext';

const IdfAllAdditionalOwnersList = ({
  children,
  openAllOwners,
  setOpenAllOwners,
  service,
  serviceId,
  mainOwner,
  count,
  refreshOwners,
  setRefresOwners,
  onGetOwners,
  owners,
  isPrincipalOwner,
}) => {
  const { setSuccessMessage, setErrorMessage } =
    useContext(AlertMessageContext);
  const [newContactOwners, setNewContactOwners] = useState([]);
  const [excludeOwner, setExcludeOwner] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: Math.ceil(count / 10),
    limit: 10,
  });

  useEffect(() => {
    if (service) {
      onGetOwners();
    }
  }, [pagination, refreshOwners]);

  useEffect(() => {
    if (pagination.totalPages > 1) {
      if (pagination.page === 1) {
        setExcludeOwner(owners[4]);
        const newContactOwners = owners?.slice(0, 4);

        const newContactList = [
          { user_id: mainOwner?.id, user: mainOwner, owner: true },
          ...newContactOwners,
        ];

        return setNewContactOwners(newContactList);
      }

      if (pagination.page === pagination.totalPages) {
        const newContactList = [excludeOwner, ...owners];
        return setNewContactOwners(newContactList);
      }
    }

    return setNewContactOwners(owners);
  }, [owners, mainOwner]);

  const changePage = (newPage) => {
    if (newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const onRemove = async (owner) => {
    try {
      const response = await service.removeOwner(serviceId, owner.user_id);
      if (response.data?.message) {
        return setErrorMessage(response.data?.message);
      }

      if (!refreshOwners && service) onGetOwners();

      setOpenAllOwners(false);
      setSuccessMessage(
        `${owner?.user?.first_name} ${owner?.user?.last_name} as additional owner removed`
      );
      setRefresOwners && setRefresOwners(true);
    } catch (error) {
      if (error.message) {
        return setErrorMessage(error.message);
      }
      return setErrorMessage(error);
    }
  };

  const CheckContactOwner = () => {
    return newContactOwners?.map((item) => (
      <ContactOwnerList
        key={item.user_id}
        item={item}
        handleRemove={item?.owner ? null : () => onRemove(item)}
        mainOwner={mainOwner}
        isPrincipalOwner={isPrincipalOwner}
      />
    ));
  };

  return (
    <>
      {children}

      <Modal isOpen={openAllOwners} fade={false}>
        <ModalHeader
          tag="h3"
          toggle={() => setOpenAllOwners(false)}
          className="p-3"
        >
          {ASSIGNED_OWNERS}
        </ModalHeader>
        <ModalBody className="border-top mb-0 p-3">
          <div className="list-group list-group-lg list-group-flush list-group-no-gutters">
            <CheckContactOwner />
          </div>
        </ModalBody>
        {newContactOwners?.length > 10 && (
          <ModalFooter className="px-3">
            <Pagination paginationInfo={pagination} onPageChange={changePage} />
          </ModalFooter>
        )}
      </Modal>
    </>
  );
};

export default IdfAllAdditionalOwnersList;
