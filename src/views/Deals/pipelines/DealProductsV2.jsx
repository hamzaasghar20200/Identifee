import React, { useState, useEffect, useContext } from 'react';
import ButtonIcon from '../../../components/commons/ButtonIcon';
import NoDataFound from '../../../components/commons/NoDataFound';
import { Card, CardHeader } from 'reactstrap';
import { isToFixedNoRound, valueNumberValidator } from '../../../utils/Utils';
import { v4 as uuidv4 } from 'uuid';
import TooltipComponent from '../../../components/lesson/Tooltip';
import MaterialIcon from '../../../components/commons/MaterialIcon';
import dealService from '../../../services/deal.service';
import Skeleton from 'react-loading-skeleton';
import { onInputSearch } from '../contacts/utils';
import AutoComplete from '../../../components/AutoComplete';
import productService from '../../../services/product.service';
import { AlertMessageContext } from '../../../contexts/AlertMessageContext';
import DeleteConfirmationModal from '../../../components/modal/DeleteConfirmationModal';
import { useProfileContext } from '../../../contexts/profileContext';
import { useModuleContext } from '../../../contexts/moduleContext';

const maxPrice = 99999999.0;

const getTotal = (items) => {
  return [...items].reduce((total, b) => total + b.quantity * b.price, 0);
};

const ProductAutoComplete = ({
  moduleData,
  index,
  currentProduct,
  handleChangeProduct,
}) => {
  const [searchProduct, setSearchProduct] = useState({ search: '' });
  const [products, setProducts] = useState([]);

  const getProductsList = async (value) => {
    if (value) {
      const { data } = await productService
        .getProducts({ search: value }, { limit: 10 })
        .catch((err) => console.log(err));
      setProducts(data?.products);
    }
  };

  useEffect(() => {
    getProductsList(searchProduct.search);
  }, [searchProduct]);

  return (
    <AutoComplete
      placeholder={`Search for ${moduleData.product.singular}.`}
      name={`deal_product_search_${index}`}
      customKey="name"
      showAvatar={false}
      loading={false}
      onChange={(e) => onInputSearch(e, searchProduct, setSearchProduct)}
      data={products}
      onHandleSelect={(item) => {
        handleChangeProduct(item, currentProduct);
      }}
      selected={currentProduct?.product?.name}
      search={searchProduct.search}
    />
  );
};

const FormType = {
  DealDetail: 1,
  DealAdd: 2,
};

const ActionTypes = {
  ADD: 1,
  UPDATE: 2,
  REMOVE: 3,
  CLEAR: 4,
  SAVE: 5,
  EDIT: 6,
  CANCEL: 7,
};

const ProductItem = ({
  moduleData,
  index,
  product,
  mode,
  updateRow,
  removeRow,
  editRow,
  isOwner,
}) => {
  return (
    <>
      {!product.isNew && !product.isEdited ? (
        <>
          <tr>
            <td>{product?.product?.name}</td>
            <td>{isToFixedNoRound(product.price)}</td>
            <td>{product.quantity}</td>
            <td>{isToFixedNoRound(product.quantity * product.price)}</td>
            <td>
              {isOwner && (
                <div className="d-flex align-items-center gap-1">
                  <TooltipComponent title="Edit">
                    <a
                      onClick={() => editRow(ActionTypes.EDIT, index, product)}
                      className="cursor-pointer icon-hover-bg"
                    >
                      <MaterialIcon icon="edit" clazz="icon-action" />
                    </a>
                  </TooltipComponent>
                  <TooltipComponent title="Delete">
                    <a
                      onClick={() =>
                        removeRow(ActionTypes.REMOVE, index, product)
                      }
                      className="cursor-pointer icon-hover-bg"
                    >
                      <MaterialIcon icon="delete" clazz="icon-action" />
                    </a>
                  </TooltipComponent>
                </div>
              )}
            </td>
          </tr>
        </>
      ) : (
        <tr>
          <td>
            <ProductAutoComplete
              moduleData={moduleData}
              currentProduct={product}
              index={index}
              handleChangeProduct={(selected, current) => {
                updateRow(ActionTypes.UPDATE, index, {
                  ...current,
                  product: selected,
                  price: selected.price,
                  quantity: parseInt(selected.unit) || 1,
                });
              }}
            />
          </td>
          <td
            className={
              product?.product?.id ||
              product.isEdited ||
              mode === FormType.DealAdd
                ? 'opacity-1'
                : 'opacity-0'
            }
          >
            <input
              type="number"
              placeholder="Unit price"
              value={product.price}
              className="form-control"
              onChange={(e) => {
                updateRow(ActionTypes.UPDATE, index, {
                  ...product,
                  price: valueNumberValidator(e.target.value, 2, maxPrice),
                });
              }}
            />
          </td>
          <td
            className={
              product?.product?.id ||
              product.isEdited ||
              mode === FormType.DealAdd
                ? 'opacity-1'
                : 'opacity-0'
            }
          >
            <input
              type="number"
              placeholder="Quantity"
              value={product.quantity}
              className="form-control"
              onChange={(e) => {
                updateRow(ActionTypes.UPDATE, index, {
                  ...product,
                  quantity: parseInt(e.target.value),
                });
              }}
            />
          </td>
          <td
            className={
              product?.product?.id ||
              product.isEdited ||
              mode === FormType.DealAdd
                ? 'opacity-1'
                : 'opacity-0'
            }
          >
            <input
              type="text"
              placeholder="Total"
              disabled
              readOnly
              value={isToFixedNoRound(product.quantity * product.price)}
              className="form-control border-0 pl-0 disabled opacity-11"
            />
          </td>
          <td>
            <div className="d-flex align-items-center gap-1">
              {(product?.product?.id || product.isEdited) &&
                mode === FormType.DealDetail && (
                  <TooltipComponent title="Save">
                    <a
                      className="cursor-pointer icon-hover-bg"
                      onClick={() => {
                        updateRow(ActionTypes.SAVE, index, product);
                      }}
                    >
                      <MaterialIcon
                        icon="check_circle"
                        clazz="text-green font-size-em text-success"
                        filled
                      />{' '}
                    </a>
                  </TooltipComponent>
                )}
              {product.isEdited ? (
                <TooltipComponent title="Cancel">
                  <a
                    onClick={() =>
                      removeRow(ActionTypes.CANCEL, index, product)
                    }
                    className="cursor-pointer icon-hover-bg"
                  >
                    <MaterialIcon icon="cancel" filled clazz="font-size-em" />
                  </a>
                </TooltipComponent>
              ) : (
                <TooltipComponent title="Delete">
                  <a
                    onClick={() =>
                      removeRow(ActionTypes.REMOVE, index, product)
                    }
                    className="cursor-pointer icon-hover-bg"
                  >
                    <MaterialIcon
                      icon="remove_circle"
                      clazz="icon-action text-danger-soft"
                    />
                  </a>
                </TooltipComponent>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const ProductItems = ({
  moduleData,
  deal,
  getDeal,
  dealProducts,
  clearAll,
  setGetDealProducts,
  mode,
  setLoader,
  isOwner,
}) => {
  const [componentsToDelete, setComponentsToDelete] = useState([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [productItems, setProductItems] = useState([...dealProducts]);
  const { setSuccessMessage, setErrorMessage } =
    useContext(AlertMessageContext);

  useEffect(() => {
    setProductItems(dealProducts);
  }, [dealProducts]);

  useEffect(() => {
    if (mode === FormType.DealAdd) {
      setGetDealProducts(productItems);
    }
  }, [productItems]);

  const handleAddEditDeleteProductItem = async (type, index, payload) => {
    let newArr = [];
    let newDealProducts = [];
    const defaultProduct = {
      id: uuidv4(),
      name: '',
      price: 0,
      quantity: 1,
      isNew: true,
    };
    const dealId = deal?.id;
    const totalAmount = getTotal(productItems);
    switch (type) {
      case ActionTypes.ADD: // add new product row
        newArr = [...productItems, defaultProduct];
        setProductItems(newArr);
        break;
      case ActionTypes.UPDATE: // any input change should update the product in its respective index in array
        newArr = [...productItems].map((p) =>
          p.id === payload.id ? payload : p
        );
        setProductItems(newArr);
        break;
      case ActionTypes.REMOVE: // remove product row
        if (payload.isNew) {
          newArr = [...productItems];
          newArr.splice(index, 1);
          setProductItems(newArr);
          if (newArr.length === 0) {
            clearAll();
          }
        } else {
          setOpenDeleteModal(true);
          setComponentsToDelete([{ p: payload, i: index }]);
        }
        break;
      case ActionTypes.SAVE: // means call api and save or update product item
        // call update api
        newDealProducts = productItems?.map((product) => {
          const newProduct = {
            product_id: product.product.id,
            quantity: parseFloat(product.quantity),
            price: parseFloat(product.price),
            deal_id: dealId,
          };
          // for update case
          if (!product.isNew) {
            newProduct.id = product.id;
          }
          return newProduct;
        });
        setLoader(true);
        try {
          await dealService.updateDealProducts(dealId, {
            products: newDealProducts,
            amount: totalAmount,
          });
          setSuccessMessage('Deal products updated.');
          getDeal();
          setProductItems(
            [...productItems].map((p) => ({
              ...p,
              isEdited: false,
              isNew: false,
            }))
          );
        } catch (e) {
          console.log(e);
          setErrorMessage(
            'Error in updating deal product. Please check console for details.'
          );
        } finally {
          setLoader(false);
        }
        break;
      case ActionTypes.EDIT: // open current product in edit mode
        newArr = [...productItems].map((p) =>
          p.id === payload.id ? { ...payload, isEdited: true } : p
        );
        setProductItems(newArr);
        break;
      case ActionTypes.CANCEL: // open current product in edit mode
        newArr = [...productItems].map((p) =>
          p.id === payload.id ? { ...payload, isEdited: false } : p
        );
        setProductItems(newArr);
        break;
      default:
        setProductItems([]);
        break;
    }
  };

  const handleConfirmDeleteItem = async () => {
    const payload = componentsToDelete[0]?.p;
    const index = componentsToDelete[0]?.i;
    const newArr = [...productItems];
    // show prompt and remove this product from deal and refresh
    try {
      await dealService.deleteDealProduct(payload.id);
      await dealService.updateDealProducts(deal.id, {
        amount: getTotal(newArr),
      });
      setSuccessMessage('Deal product deleted.');
      setOpenDeleteModal(false);
      setComponentsToDelete([]);
      newArr.splice(index, 1);
      setProductItems(newArr);
      getDeal();
      if (newArr.length === 0) {
        clearAll();
      }
    } catch (e) {
      console.log(e);
      setErrorMessage(
        'Error in deleting deal product. Please check console for details.'
      );
    } finally {
      setLoader(false);
    }
  };
  const DeleteFieldBody = () => {
    return (
      <div>
        <h3>Delete Product line item?</h3>
        <p>
          You&apos;re about to delete the line item{' '}
          <b>{componentsToDelete[0]?.p.product?.name}</b> from this Deal.
        </p>
      </div>
    );
  };
  return (
    <>
      <DeleteConfirmationModal
        showModal={openDeleteModal}
        setShowModal={setOpenDeleteModal}
        setSelectedCategories={setComponentsToDelete}
        event={handleConfirmDeleteItem}
        itemsConfirmation={componentsToDelete}
        itemsReport={[]}
        customBody={<DeleteFieldBody />}
      />
      {productItems.map((product, index) => (
        <ProductItem
          moduleData={moduleData}
          key={product.id}
          index={index}
          product={product}
          addRow={() => handleAddEditDeleteProductItem(ActionTypes.ADD)}
          updateRow={handleAddEditDeleteProductItem}
          removeRow={handleAddEditDeleteProductItem}
          editRow={handleAddEditDeleteProductItem}
          mode={mode}
          isOwner={isOwner}
        />
      ))}
      {((isOwner && mode === FormType.DealDetail && productItems.length > 0) ||
        (mode === FormType.DealAdd && productItems.length > 0)) && (
        <tr className="bg-gray-2 font-size-sm">
          <td colSpan="2" className="px-2">
            <ButtonIcon
              color="link"
              icon="add"
              type="button"
              onclick={() => handleAddEditDeleteProductItem(ActionTypes.ADD)}
              label={moduleData.product.singular}
              classnames="border-0 text-primary p-0"
              disabled={
                mode === FormType.DealDetail &&
                productItems.some((s) => s.isNew || s.isEdited)
              }
            />
          </td>
          <td className="text-right font-weight-medium">Grand total</td>
          <td className="text-primary font-weight-medium" colSpan="2">
            {isToFixedNoRound(getTotal(productItems))}
          </td>
        </tr>
      )}
    </>
  );
};

const DealProductsV2 = ({
  deal,
  getDeal,
  setGetDealProducts,
  heading = 'Products',
  toggle = () => {},
}) => {
  const { moduleMap: moduleData } = useModuleContext();
  const [dealProducts, setDealProducts] = useState([]);
  const [loader, setLoader] = useState(false);
  const [loaderSave, setLoaderSave] = useState(false);
  const mode = deal ? FormType.DealDetail : FormType.DealAdd; // this mode will tell whether its opened from deal details or deal add form, for deal add form deal will null
  const { profileInfo } = useProfileContext();
  // if current user has admin_access or the item is created by the user then allow add/edit/delete only
  const isOwner =
    profileInfo?.role?.admin_access || deal?.created_by === profileInfo?.id;
  const clearAll = () => {
    setDealProducts([]);
    if (mode === FormType.DealAdd) {
      toggle();
    }
  };
  const handleNewProduct = () => {
    setDealProducts([
      {
        id: uuidv4(),
        name: '',
        price: 0,
        quantity: 1,
        isNew: true,
      },
    ]);
  };

  const getDealProducts = async () => {
    setLoader(true);
    try {
      const { data } = await dealService.getDealProducts(deal?.id, {
        page: 1,
        limit: 10,
      });
      setDealProducts(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (mode === FormType.DealDetail) {
      getDealProducts();
    } else {
      handleNewProduct();
    }
  }, []);

  return (
    <Card className="border-0 rounded-0 p-0 shadow-none">
      {loader ? (
        <div className="p-3">
          <Skeleton count={3} height={10} className={'mb-2'} />
        </div>
      ) : (
        <>
          <CardHeader
            className={`align-items-center ${
              mode === FormType.DealDetail ? 'p-3' : 'px-0'
            } justify-content-between`}
          >
            <h5 className="mb-0">{moduleData?.product.plural || heading}</h5>
            {dealProducts.length <= 0 && isOwner && (
              <ButtonIcon
                icon="add"
                label={moduleData.product.singular}
                color="primary"
                classnames="btn-sm pl-2 pr-3"
                onclick={handleNewProduct}
              />
            )}
          </CardHeader>
          <div
            className={`position-relative ${
              mode === FormType.DealAdd
                ? 'border-left border-right rounded mb-3'
                : ''
            }`}
          >
            {loaderSave && (
              <div
                style={{ opacity: 0.7 }}
                className="position-absolute top-0 z-index-99 left-0 h-100 w-100 bg-gray-2"
              ></div>
            )}
            <table
              className={`table table-align-middle w-100 ${
                mode === FormType.DealAdd ? 'mb-0' : 'mb-4'
              }`}
            >
              <thead className="thead-light">
                <tr>
                  <th className="col-md-4 pl-3">
                    {moduleData.product.singular}
                  </th>
                  <th>List Price ($)</th>
                  <th>Quantity</th>
                  <th>Total ($)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <ProductItems
                  moduleData={moduleData}
                  deal={deal}
                  mode={mode}
                  clearAll={clearAll}
                  setGetDealProducts={setGetDealProducts}
                  setLoader={setLoaderSave}
                  dealProducts={dealProducts}
                  getDeal={getDeal}
                  isOwner={isOwner}
                />
              </tbody>
            </table>
          </div>
          {dealProducts?.length <= 0 && (
            <NoDataFound
              icon="edit_note"
              containerStyle="text-gray-search my-4 py-4"
              title={
                <div className="font-size-sm2 text-gray-search">
                  This record doesn&apos;t have associated{' '}
                  {moduleData?.product.plural || heading}.
                </div>
              }
            />
          )}
        </>
      )}
    </Card>
  );
};

export default DealProductsV2;
