import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Row, Col, Container } from 'react-bootstrap';
import { Element, scroller } from 'react-scroll';

import Alert from './Alert/Alert';
import { CardButton } from './layouts/CardLayout';
import { formatNumber, valueNumberValidator } from '../utils/Utils';
import TextInput from './inputs/TextInput';
import { CardLabel } from './layouts/ActivityLayout';
import dealsProductsConstants from '../utils/constants/dealsProducts.json';
import { onInputSearch } from '../views/Deals/contacts/utils';
import productService from '../services/product.service';
import AutoComplete from './AutoComplete';
import ButtonIcon from './commons/ButtonIcon';

const constants = dealsProductsConstants.strings;

const DealProductsTable = ({
  toast,
  setToast,
  dealProducts,
  setDealProducts,
  productToEdit,
  totalAmount,
  allFields,
  products,
  setTotalAmount,
  onHandleRemove,
}) => {
  const addNewRow = () => {
    const newDealProduct = {
      id: uuidv4(),
      description: {},
      price: 0,
      quantity: 1,
    };
    setDealProducts((dealProducts) => [...dealProducts, newDealProduct]);
    setSearchProduct({ search: '' });
    setFilterDealProducts([]);
    scroller.scrollTo('endContainer', {
      duration: 700,
      delay: 10,
      smooth: true,
      containerId: 'add_row',
    });
  };
  const [filterDealProducts, setFilterDealProducts] = useState([]);

  const [searchProduct, setSearchProduct] = useState({
    search: '',
  });

  const getProductsList = async (value) => {
    if (value) {
      const resp = await productService
        .getProducts({ search: value }, { limit: 100 })
        .catch((err) => console.log(err));
      setFilterDealProducts(resp?.data?.products);
    }
  };

  useEffect(() => {
    getProductsList(searchProduct.search);
  }, [searchProduct]);

  const maxPrice = 99999999.0;
  const minQuantity = 1;
  const maxQuantity = 9999;

  const deleteRow = (id) => {
    setDealProducts(dealProducts.filter((i) => i.id !== id));
  };

  const handleUpdateDealProduct = (id, updatedDealProducts) => {
    const updatedObject = dealProducts.map((dealProduct) =>
      dealProduct.id === id ? updatedDealProducts : dealProduct
    );
    setDealProducts(updatedObject);
  };

  const handleChangeDealProduct = (value, name, dealProduct) => {
    if (name === 'price') {
      value = valueNumberValidator(value, 2, maxPrice);
    } else if (name === 'quantity') {
      value = valueNumberValidator(value, 0, maxQuantity, minQuantity);
    }

    if (name === 'description') {
      dealProduct.price = value.price;
    }

    dealProduct[name] = value;

    handleUpdateDealProduct(dealProduct.id, dealProduct);
  };

  const handleCollapse = (id) => {
    const dropdownMenu = document.getElementById(id);
    dropdownMenu?.classList.remove('show');
  };

  useEffect(() => {
    let totalAmountAcum = 0;
    dealProducts.forEach((dealProduct) => {
      const price = dealProduct.price;
      const quantity = dealProduct.quantity;
      const amount = price * quantity;
      totalAmountAcum = amount + totalAmountAcum || 0;
    });
    setTotalAmount(totalAmountAcum);
  }, [dealProducts]);

  const ProductsTableHeader = () => {
    const HeaderItem = ({ value, className, additionalClassName, xs }) => (
      <Col
        xs={xs}
        className={
          className || `px-0 mt-2 mb-0 fs-7 ${additionalClassName || ''}`
        }
      >
        {value || '\u00A0'}
      </Col>
    );

    return (
      <Row noGutters className={`align-items-center modal-header-table w-100`}>
        <HeaderItem
          xs={5}
          value="Item"
          additionalClassName="deals-product-name-dropdown"
        />
        <HeaderItem xs={2} value="Price" />
        <HeaderItem xs={2} value="Qty" />
        <HeaderItem xs={2} value="Amount" />
        <HeaderItem
          xs={1}
          className="px-0 col-auto deals-product-delete-column"
        />
      </Row>
    );
  };

  const handleChangeProduct = (product, dealProduct) => {
    const { name, id, price } = product;
    handleChangeDealProduct(
      {
        name,
        id,
        price,
      },
      'description',
      dealProduct
    );
    handleCollapse(`${dealProduct.id}_description`);
  };

  return (
    <>
      {toast && (
        <Container fluid className={`px-4`}>
          <Alert message={toast} setMessage={setToast} color="danger" />
        </Container>
      )}
      {Object.keys(allFields).map((key, index) => {
        return (
          <>
            <h5 className="pb-0">{key}</h5>
            {allFields[key]?.length > 0 &&
              allFields[key]?.map((field) => {
                const { key } = field;
                return (
                  <>
                    {key === 'Product Name' ||
                      (key !== 'Price' && (
                        <>
                          <Container
                            id={`add_row`}
                            fluid
                            className={`px-0 mt-0 pt-0 pb-0`}
                          >
                            <ProductsTableHeader />
                            {dealProducts.map((dealProduct, index) => (
                              <Row
                                noGutters
                                key={dealProduct.id}
                                className={`align-items-center product-item-modal`}
                              >
                                <Col
                                  xs={5}
                                  className={`p-0 deals-product-name-dropdown`}
                                >
                                  <CardLabel
                                    labelSize={`full`}
                                    formClassName={`mr-1 ml-0`}
                                    containerClassName="pl-0 pr-0"
                                  >
                                    <AutoComplete
                                      id={`deal_product_search_${index}`}
                                      placeholder="Search for item"
                                      name={`deal_product_search_${index}`}
                                      customKey
                                      showAvatar={false}
                                      loading={false}
                                      onChange={(e) =>
                                        onInputSearch(
                                          e,
                                          searchProduct,
                                          setSearchProduct
                                        )
                                      }
                                      data={filterDealProducts}
                                      onHandleSelect={(item) => {
                                        handleChangeProduct(item, dealProduct);
                                      }}
                                      selected={
                                        dealProduct?.description?.id
                                          ? dealProduct?.description?.name
                                          : ''
                                      }
                                      search={searchProduct.search}
                                    />
                                  </CardLabel>
                                </Col>
                                <Col xs={2} className={`p-0`}>
                                  <TextInput
                                    id={`${dealProduct.id}_price`}
                                    name={`${dealProduct.id}_price`}
                                    placeholder={`Price`}
                                    value={dealProduct.price}
                                    onChange={(e) => {
                                      handleChangeDealProduct(
                                        e.target.value,
                                        'price',
                                        dealProduct
                                      );
                                    }}
                                    className={`font-weight-500 mb-0`}
                                    containerClassName={`m-0`}
                                    formClassName={`m-0`}
                                    inputClassName={'px-2'}
                                  />
                                </Col>
                                <Col xs={2} className={`p-0`}>
                                  <TextInput
                                    id={`${dealProduct.id}_quantity`}
                                    name={`${dealProduct.id}_quantity`}
                                    placeholder={`quantity`}
                                    value={dealProduct.quantity}
                                    onChange={(e) => {
                                      handleChangeDealProduct(
                                        e.target.value,
                                        'quantity',
                                        dealProduct
                                      );
                                    }}
                                    className={`font-weight-500 mb-0`}
                                    containerClassName={`m-1`}
                                    formClassName={`m-0`}
                                    inputClassName={'px-2'}
                                  />
                                </Col>
                                <Col xs={2} className={`p-0`}>
                                  <TextInput
                                    id={`${dealProduct.id}_amount`}
                                    name={`${dealProduct.id}_amount`}
                                    placeholder={`amount`}
                                    disabled
                                    value={
                                      dealProduct.quantity &&
                                      dealProduct.price &&
                                      (dealProduct.quantity > 0 &&
                                      dealProduct.price > 0
                                        ? formatNumber(
                                            dealProduct.quantity *
                                              dealProduct.price,
                                            2,
                                            2
                                          )
                                        : `$0.00`)
                                    }
                                    className={`font-weight-500 mb-0`}
                                    containerClassName={`m-0`}
                                    formClassName={`m-0`}
                                    inputClassName={'px-1'}
                                  />
                                </Col>
                                <Col
                                  xs={1}
                                  className={`p-0 col-auto d-flex justify-content-center deals-product-close text-center`}
                                >
                                  <CardButton
                                    className={
                                      'font-weight-500 p-0 btn btn-icon btn-icon-sm icon-hover-bg'
                                    }
                                    icon={`delete`}
                                    variant={``}
                                    onClick={() => {
                                      onHandleRemove &&
                                        onHandleRemove(dealProduct.id, false);
                                      deleteRow(dealProduct.id);
                                    }}
                                  />
                                </Col>
                              </Row>
                            ))}
                            <Element name="endContainer" />
                          </Container>
                          <ButtonIcon
                            color="link"
                            icon="add"
                            onclick={(e) => {
                              e.preventDefault();
                              addNewRow();
                            }}
                            label={constants.addRowButton.title}
                            classnames="border-0 px-0 text-left font-weight-semi-bold text-primary"
                          />
                        </>
                      ))}
                  </>
                );
              })}
          </>
        );
      })}
      <Container id={`add_row`} fluid className={`px-0 mt-0 pt-0 pb-0`}>
        <ProductsTableHeader />
        {dealProducts.map((dealProduct, index) => (
          <Row
            noGutters
            key={dealProduct.id}
            className={`align-items-center product-item-modal`}
          >
            <Col xs={5} className={`p-0 deals-product-name-dropdown`}>
              <CardLabel
                labelSize={`full`}
                formClassName={`mr-1 ml-0`}
                containerClassName="pl-0 pr-0"
              >
                <AutoComplete
                  id={`deal_product_search_${index}`}
                  placeholder="Search for item"
                  name={`deal_product_search_${index}`}
                  customKey="name"
                  showAvatar={false}
                  loading={false}
                  onChange={(e) =>
                    onInputSearch(e, searchProduct, setSearchProduct)
                  }
                  data={filterDealProducts}
                  onHandleSelect={(item) => {
                    handleChangeProduct(item, dealProduct);
                  }}
                  selected={
                    dealProduct?.description?.id
                      ? dealProduct?.description?.name
                      : ''
                  }
                  search={searchProduct.search}
                />
              </CardLabel>
            </Col>
            <Col xs={2} className={`p-0`}>
              <TextInput
                id={`${dealProduct.id}_price`}
                name={`${dealProduct.id}_price`}
                placeholder={`Price`}
                value={dealProduct.price}
                onChange={(e) => {
                  handleChangeDealProduct(e.target.value, 'price', dealProduct);
                }}
                className={`font-weight-500 mb-0`}
                containerClassName={`m-0`}
                formClassName={`m-0`}
                inputClassName={'px-2'}
              />
            </Col>
            <Col xs={2} className={`p-0`}>
              <TextInput
                id={`${dealProduct.id}_quantity`}
                name={`${dealProduct.id}_quantity`}
                placeholder={`quantity`}
                value={dealProduct.quantity}
                onChange={(e) => {
                  handleChangeDealProduct(
                    e.target.value,
                    'quantity',
                    dealProduct
                  );
                }}
                className={`font-weight-500 mb-0`}
                containerClassName={`m-1`}
                formClassName={`m-0`}
                inputClassName={'px-2'}
              />
            </Col>
            <Col xs={2} className={`p-0`}>
              <TextInput
                id={`${dealProduct.id}_amount`}
                name={`${dealProduct.id}_amount`}
                placeholder={`amount`}
                disabled
                value={
                  dealProduct.quantity &&
                  dealProduct.price &&
                  (dealProduct.quantity > 0 && dealProduct.price > 0
                    ? formatNumber(
                        dealProduct.quantity * dealProduct.price,
                        2,
                        2
                      )
                    : `$0.00`)
                }
                className={`font-weight-500 mb-0`}
                containerClassName={`m-0`}
                formClassName={`m-0`}
                inputClassName={'px-1'}
              />
            </Col>
            <Col
              xs={1}
              className={`p-0 col-auto d-flex justify-content-center deals-product-close text-center`}
            >
              <CardButton
                className={
                  'font-weight-500 p-0 btn btn-icon btn-icon-sm icon-hover-bg'
                }
                icon={`delete`}
                variant={``}
                onClick={() => {
                  onHandleRemove && onHandleRemove(dealProduct.id, false);
                  deleteRow(dealProduct.id);
                }}
              />
            </Col>
          </Row>
        ))}
        <Element name="endContainer" />
      </Container>
      <ButtonIcon
        color="link"
        icon="add"
        onclick={(e) => {
          e.preventDefault();
          addNewRow();
        }}
        label={constants.addRowButton.title}
        classnames="border-0 px-0 text-left font-weight-semi-bold text-primary"
      />
      <Row className={`align-items-center mt-2`}>
        <Col xs={9} className={`text-right pr-2`}>
          Total:
        </Col>
        <Col xs={3} className={`text-left pl-0 font-weight-semi-bold`}>
          {(totalAmount !== '00' && formatNumber(totalAmount, 2, 2)) || `$0.00`}
        </Col>
      </Row>
    </>
  );
};

export default DealProductsTable;
