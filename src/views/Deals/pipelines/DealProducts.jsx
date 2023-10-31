import { useState, useEffect } from 'react';
import { groupBy, isEmpty } from 'lodash';
import { Col } from 'react-bootstrap';

import ModalConfirmDefault from '../../../components/modal/ModalConfirmDefault';
import dealsProductsConstants from '../../../utils/constants/dealsProducts.json';
import { CardButton } from '../../../components/layouts/CardLayout';
import productService from '../../../services/product.service';
import dealService from '../../../services/deal.service';
import {
  DEAL_UPDATED,
  QUANTITY,
  REMOVE_PRODUCT_CONFIRM,
  CANT_ADDEDIT_PRODUCTS,
  CANT_REMOVE_PRODUCTS,
} from '../../../utils/constants';
import MoreActions from '../../../components/MoreActions';
import {
  Button,
  ButtonRounded,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardItem,
  CardList,
} from '../../../components/layouts/DealsLayout';
import DealProductsTable from '../../../components/DealProductsTable';
import SimpleModalCreation from '../../../components/modal/SimpleModalCreation';
import fieldService from '../../../services/field.service';

const DealProducts = ({
  dealProducts,
  dealId,
  getDeal,
  setErrorMessage,
  setSuccessMessage,
  totalAmount,
  setTotalAmount,
}) => {
  const [products, setProducts] = useState([]);
  const [openRemoveProductModal, setOpenRemoveProductModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [productToRemove, setProductToRemove] = useState(null);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  const getProducts = async () => {
    const resp = await productService
      .getProducts(null, { limit: 100 })
      .catch((err) => console.log(err));
    setProducts(resp?.data?.products);
  };

  const removeProductHandler = async () => {
    setModalLoading(true);
    const removeProductResponse = await dealService
      .deleteDealProduct(productToRemove)
      .catch(() => {
        setModalLoading(false);
        setOpenRemoveProductModal(false);
        return setErrorMessage(CANT_REMOVE_PRODUCTS);
      });

    if (removeProductResponse?.response?.data?.errors?.[0].message) {
      setModalLoading(false);
      setOpenRemoveProductModal(false);
      return setErrorMessage(CANT_REMOVE_PRODUCTS);
    }

    if (removeProductResponse) {
      const getAmountAfterRemove = () => {
        let totalAmountAcum = 0;
        dealProducts.forEach((dealProduct) => {
          const id = dealProduct.id;
          const price = dealProduct.price;
          const quantity = dealProduct.quantity;
          const amount = price * quantity;
          if (id !== productToRemove) {
            totalAmountAcum = amount + totalAmountAcum || 0;
          }
        });

        return totalAmountAcum;
      };

      const totalAmountAcum = getAmountAfterRemove();

      await dealService
        .updateDealProducts(dealId, {
          amount: totalAmountAcum,
        })
        .then(() => setSuccessMessage(DEAL_UPDATED))
        .catch(() =>
          setErrorMessage(
            `The product was removed but an error has occurred updating the amount`
          )
        );
      setModalLoading(false);

      await getDeal();
    }

    toggleModal();
  };

  const toggleModal = () => {
    setOpenRemoveProductModal((prev) => !prev);
    openRemoveProductModal === false && setModalLoading(false);
  };

  const removeProduct = (productId, confirm = true) => {
    setProductToRemove(productId);
    if (confirm) setOpenRemoveProductModal(true);
    else removeProductHandler();
  };

  const editProduct = (productId) => {
    setShowProductsModal(true);
    setProductToEdit(productId);
  };

  const CardProducts = ({ children }) => {
    const lessThanMinimumProducts = dealProducts?.length <= 5;
    return (
      <Card className={lessThanMinimumProducts && ' pb-3'}>{children}</Card>
    );
  };

  const ProductsHeader = () => {
    const addProductsButton = () => {
      setShowProductsModal(true);
      setProductToEdit(null);
    };

    return (
      isEmpty(dealProducts) === false && (
        <div className="ml-auto">
          <ButtonRounded
            type={'roundedCircle'}
            icon={'add'}
            onClick={addProductsButton}
          />
        </div>
      )
    );
  };

  const ProductsList = () => {
    const productsWithNames = dealProducts?.map((product) => {
      const productName = products?.filter((prod) => {
        return prod.id === product.product_id;
      })[0]?.name;
      return { ...product, name: productName };
    });

    const firstProductsList = productsWithNames?.map((product, index) => {
      const itemNumber = index + 1;
      const maxItemsNumber = 5;

      if (itemNumber <= maxItemsNumber) {
        return product;
      } else {
        return null;
      }
    });

    const options = [
      {
        id: 'edit',
        icon: 'edit',
        name: 'Edit Product',
      },
      {
        id: 'remove',
        icon: 'delete',
        name: 'Remove',
        className: 'text-danger',
      },
    ];

    const EmptyProductItem = () => (
      <Col className="justify-content-center mt-6 mb-4 text-center">
        <CardButton
          title={`Add products`}
          variant={`primary`}
          onClick={() => setShowProductsModal(true)}
          className={`btn-sm`}
          icon={`add`}
        />
      </Col>
    );

    const ProductItem = ({ id, name, price, quantity }) =>
      id ? (
        <CardItem>
          <div className="d-flex align-items-center justify-content-between products-item">
            <div className="flex-grow-1">
              <div className="d-flex w-100 align-items-center">
                <div className="w-50">
                  <p className="mb-0 fs-7 font-weight-semi-bold">{name}</p>
                  <p className="mb-0 fs-8">$ {price}</p>
                </div>
                <p className="mb-0 fs-8">
                  <span className="font-weight-semi-bold">{QUANTITY}:</span>{' '}
                  {quantity}
                </p>
              </div>
            </div>
            <MoreActions
              items={options}
              onHandleRemove={() => removeProduct(id)}
              onHandleEdit={() => editProduct(id)}
            />
          </div>
        </CardItem>
      ) : null;

    const ProductsItems = () =>
      firstProductsList?.map((product) => (
        <ProductItem
          key={product?.id}
          id={product?.id}
          name={product?.name}
          price={product?.price}
          quantity={product?.quantity}
        />
      ));

    return (
      <CardList>
        {isEmpty(dealProducts) ? <EmptyProductItem /> : <ProductsItems />}
      </CardList>
    );
  };

  const openProductsModal = () => {
    setShowProductsModal(true);
  };

  const ProductsFooter = () => {
    return (
      dealProducts?.length > 5 && (
        <CardFooter>
          <Button
            text={`View all`}
            icon={'chevron_right'}
            onClick={openProductsModal}
          />
        </CardFooter>
      )
    );
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <>
      <CardProducts>
        <CardHeader title={'Products'}>
          <ProductsHeader />
        </CardHeader>
        <CardBody>
          <ProductsList />
        </CardBody>
        <ProductsFooter />
      </CardProducts>
      <ProductsModal
        showModal={showProductsModal}
        setShowModal={setShowProductsModal}
        deal_products={dealProducts}
        dealId={dealId}
        getDeal={getDeal}
        setSuccessMessage={setSuccessMessage}
        setErrorMessage={setErrorMessage}
        totalAmount={totalAmount}
        setTotalAmount={setTotalAmount}
        productToEdit={productToEdit}
        onHandleRemove={removeProduct}
      />
      <ModalConfirmDefault
        open={openRemoveProductModal}
        onHandleConfirm={removeProductHandler}
        onHandleClose={toggleModal}
        textBody={REMOVE_PRODUCT_CONFIRM}
        labelButtonConfirm="Yes, Delete"
        iconButtonConfirm="delete"
        colorButtonConfirm="outline-danger"
        loading={modalLoading}
      />
    </>
  );
};

const constants = dealsProductsConstants.strings;

const ProductsModal = ({
  showModal,
  setShowModal,
  dealId,
  deal_products,
  getDeal,
  setSuccessMessage,
  setErrorMessage,
  totalAmount,
  setTotalAmount,
  productToEdit,
  onHandleRemove,
}) => {
  const [products, setProducts] = useState([]);
  const [toast, setToast] = useState(null);
  const [dealProducts, setDealProducts] = useState([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isFieldsData, setIsFieldsData] = useState([]);
  const groupBySection = (fieldsList) => {
    setIsFieldsData(groupBy(fieldsList, 'section'));
  };
  const currentView = 'product';
  const getFields = async () => {
    const fieldsData = await fieldService.getFields(currentView, {
      usedField: true,
    });
    groupBySection(fieldsData?.data);
  };
  useEffect(() => {
    if (showModal === true) {
      getFields();
    }
  }, [showModal]);
  const handleCloseModal = () => {
    setShowModal(false);
  };

  const getProductsList = async () => {
    const resp = await productService
      .getProducts(null, { limit: 100 })
      .catch((err) => console.log(err));
    setProducts(resp?.data?.products);
  };

  const getDealProducts = () => {
    setDealProducts([]);
    if (!deal_products?.length) {
      setDealProducts([
        {
          description: {},
          price: 0,
          quantity: 1,
        },
      ]);
    } else {
      const dealProductsList = deal_products?.map((dealProduct) => {
        const specificProduct = products?.find((product) => {
          return product.id === dealProduct.product_id;
        });

        return {
          id: dealProduct.id,
          description: {
            name: specificProduct?.name,
            id: specificProduct?.id,
          },
          price: dealProduct.price,
          quantity: dealProduct.quantity,
        };
      });
      setDealProducts(dealProductsList);
    }
  };

  const saveDealProducts = async () => {
    setSaveLoading(true);
    const newDealProducts = dealProducts
      ?.filter(({ description }) => description?.id)
      ?.map((product) => ({
        id: product.id,
        product_id: product.description.id,
        quantity: parseFloat(product.quantity),
        price: parseFloat(product.price),
        deal_id: dealId,
      }));

    const resp = await dealService
      .updateDealProducts(dealId, {
        products: newDealProducts,
        amount: totalAmount,
      })
      .catch(() => setErrorMessage(CANT_ADDEDIT_PRODUCTS));

    const { data } = resp || {};

    if (data?.length) {
      setSuccessMessage(`Products of the deal has been successfully updated`);
      getDeal();
    }
    setSaveLoading(false);
    handleCloseModal();
  };

  useEffect(() => {
    getProductsList();
    getDealProducts();
  }, [showModal]);

  return (
    <SimpleModalCreation
      modalTitle={constants.productsModal.title}
      open={showModal}
      toggle={handleCloseModal}
      handleSubmit={saveDealProducts}
      onHandleCloseModal={handleCloseModal}
      setErrorMessage={setErrorMessage}
      setSuccessMessage={setSuccessMessage}
      isLoading={saveLoading}
      size={`lg`}
      onClick={() => document.dispatchEvent(new MouseEvent('click'))}
    >
      <DealProductsTable
        toast={toast}
        setToast={setToast}
        dealProducts={dealProducts}
        setDealProducts={setDealProducts}
        productToEdit={productToEdit}
        allFields={isFieldsData}
        totalAmount={totalAmount}
        setTotalAmount={setTotalAmount}
        products={products}
        onHandleRemove={onHandleRemove}
      />
    </SimpleModalCreation>
  );
};

export default DealProducts;
