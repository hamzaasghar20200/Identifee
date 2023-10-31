import React, { useEffect, useReducer, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import Filters from '../components/Filters';
import Search from '../components/manageUsers/Search';
import { reducer } from '../views/Deals/contacts/utils';
import ProductTable from '../components/Products/ProductTable';
import productService from '../services/product.service';
import ValidateAdminAccess from '../components/validateAdminAccess/ValidateAdminAccess';
import tenantService from '../services/tenant.service';
import ProductCreateModal from '../components/Products/ProductCreateModal';
import Alert from '../components/Alert/Alert';
import AlertWrapper from '../components/Alert/AlertWrapper';
import stringConstants from '../utils/stringConstants.json';
import ModalConfirmationDeleteWithResult from '../components/Products/ModalConfirmationDelete';
import LayoutHead from '../components/commons/LayoutHead';
import fieldService from '../services/field.service';
import { groupBy } from 'lodash';

const constants = stringConstants.settings.products;

export const initialFiltersItems = [
  {
    id: 1,
    label: 'Tenants',
    name: 'tenant',
    options: [],
    type: 'search',
    key: true,
  },
];

const productInitial = {
  name: '',
  code: '',
  price: '',
  description: '',
  category: '',
  unit: '0',
  tax: '0',
};

const initialConf = { items: [], done: false };

const Products = () => {
  const [filters, dispatch] = useReducer(reducer, {});
  const [filtersItems, setFiltersItems] = useState(initialFiltersItems);
  const [pagination, setPagination] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(productInitial);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productsToRemove, setProductsToRemove] = useState(initialConf);
  const [loading, setLoading] = useState(false);
  const [dataInDB, setDataInDB] = useState(false);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [isFieldsData, setIsFieldsData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const currentView = 'product';
  const groupBySection = (fieldsList) => {
    const data = groupBy(fieldsList, 'section');
    setIsFieldsData(data);
  };
  const getFields = async () => {
    setLoading(true);
    const { data } = await fieldService.getFields(currentView, {
      preferred: true,
    });
    if (data.length > 0) {
      groupBySection(data);
    } else {
      const { data } = await fieldService.createDefaultFields(currentView);
      groupBySection(data);
    }
    setLoading(false);
  };
  const EditFields = async () => {
    setLoading(true);
    const { data } = await fieldService.getFields(currentView, {
      usedField: true,
    });
    if (data.length > 0) {
      groupBySection(data);
    } else {
      const { data } = await fieldService.createDefaultFields(currentView);
      groupBySection(data);
    }
    setLoading(false);
  };
  const getProducts = async (count, search = '', page = 1, limit = 10) => {
    try {
      const params = { tenant_id: filters?.tenant?.id };

      if (search) {
        params.search = search;
      }
      const { data } = await productService.getProducts(params, {
        page,
        limit,
      });

      setPagination(data.pagination);
      setProducts(data.products);

      setDataInDB(count ? Boolean(data?.pagination?.totalPages) : false);
    } catch (e) {
      return setErrorMessage(`An error has ocurred`);
    }
  };

  const onChangeSearch = (e) => {
    const { value } = e.target;
    getProducts(true, value);
  };

  const onHandleFilter = () => {
    getProducts(true);
  };

  useEffect(() => {
    setFiltersItems(initialFiltersItems);
    getProducts(true);
  }, []);

  const onSubmit = async () => {
    setButtonSpinner(true);
    const { price } = currentProduct;
    const newProduct = {
      ...currentProduct,
      price: Number(price),
    };

    try {
      await productService.saveProduct(newProduct);
      setCurrentProduct({
        name: '',
        code: '',
        price: '',
        description: '',
        category: '',
        unit: '0',
        tax: '0',
      });
      setSuccessMessage(constants.createMessage);
      setShowModal(false);
      await getProducts(true);
    } catch (e) {
      setErrorMessage(constants.AlreadyExistMessage);
    }
    setButtonSpinner(false);
  };

  const onUpdate = async () => {
    setIsLoading(true);
    setButtonSpinner(true);

    const { name, description, code, id, price } = currentProduct;
    const newProduct = {
      ...currentProduct,
      name,
      description,
      code,
      price: Number(price),
    };

    try {
      await productService.updateProduct(id, newProduct);

      setSuccessMessage(constants.updateMessage);
      setShowModal(false);
      await getProducts(true);
    } catch (e) {
      setErrorMessage(constants.notUpdateMessage);
    }
    setIsLoading(false);
    setButtonSpinner(false);
    setCurrentProduct({
      name: '',
      code: '',
      price: '',
      description: '',
      category: '',
      unit: 0,
      tax: 0,
    });
  };

  const onHandleEdit = (item) => {
    setCurrentProduct(item);
    EditFields();
    setShowModal(true);
  };

  const onHandleChangePage = (page) => {
    getProducts(true, '', page);
  };

  const onHandleDelete = async () => {
    setLoading(true);
    const success = [];
    const productClone = [...products];

    for (const productId of selectedProducts) {
      const { name } = productClone.find((product) => product.id === productId);

      try {
        const { data } = await productService.getProductsDeals(productId, {});

        if (data.length === 0) {
          try {
            await productService.deleteProduct(productId);

            getProducts(true);
            success.push({ id: productId, name, isDeleted: true });
          } catch (e) {
            success.push({ id: productId, name, isDeleted: false });
          }
        } else {
          success.push({ id: productId, name, isDeleted: false });
        }
      } catch (e) {
        success.push({ id: productId, name, isDeleted: false });
      }
    }

    setProductsToRemove({ done: true, items: success });
    setLoading(false);
  };

  const toogleModalDelete = () => {
    const productClone = selectedProducts.map((id) => ({
      id,
      name: products.find((product) => product.id === id)?.name || '',
      isDeleted: false,
    }));

    setProductsToRemove((prev) => ({ ...prev, items: productClone }));
    setShowModalDelete(true);
  };

  const onCreate = () => {
    setCurrentProduct(productInitial);
    setShowModal(true);
    getFields();
  };
  const permissions = {
    collection: 'products',
    action: 'create',
  };
  const onClose = () => {
    setCurrentProduct({
      name: '',
      code: '',
      price: '',
      description: '',
      category: '',
      unit: 0,
      tax: 0,
    });
    setShowModal(false);
    setIsLoading(false);
    setSelectAll(false);
  };
  const handleCloseModal = () => {
    if (productsToRemove.done) {
      setSelectedProducts([]);
    }
    setShowModalDelete(false);
    setSelectAll(false);
    setSelectedProducts([]);
    setProductsToRemove(initialConf);
  };
  return (
    <>
      <AlertWrapper>
        <Alert
          color="success"
          message={successMessage}
          setMessage={setSuccessMessage}
        />
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
      </AlertWrapper>
      <ProductCreateModal
        fields={isFieldsData}
        show={showModal}
        onHandleClose={onClose}
        product={currentProduct}
        setProduct={setCurrentProduct}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        onHandleSubmit={onSubmit}
        buttonSpinner={buttonSpinner}
        onHandleUpdate={onUpdate}
        loading={loading}
        setLoading={setLoading}
      />
      <ModalConfirmationDeleteWithResult
        show={showModalDelete}
        onHandleClose={() => handleCloseModal()}
        icon={
          productsToRemove?.items.find((item) => !item.isDeleted)
            ? 'report_problem'
            : 'check_circle_outline'
        }
        items={productsToRemove.items}
        done={productsToRemove.done}
        message={
          productsToRemove.done
            ? productsToRemove?.items.find((item) => !item.isDeleted)
              ? constants.notDeleteAllProductMessage
              : constants.messageRemoveDone
            : constants.messageModalDelete
        }
        onHandleDelete={onHandleDelete}
        loading={loading}
      />

      <LayoutHead
        onHandleCreate={onCreate}
        buttonLabel={'Add Product'}
        selectedData={selectedProducts}
        onDelete={toogleModalDelete}
        allRegister={`${pagination.count || 0} Products`}
        dataInDB={dataInDB}
        permission={permissions}
      >
        <ValidateAdminAccess onlyAdmin>
          <Filters
            onHandleFilterContact={onHandleFilter}
            dispatch={dispatch}
            filtersItems={filtersItems}
            customTitle={'name'}
            callbackService={tenantService}
            callbackRequest={'getTenants'}
            callbackResponseData={''}
            searchPlaceholder={'Tenants'}
            customKey
          />
        </ValidateAdminAccess>
      </LayoutHead>

      <Card>
        <Card.Header>
          <Row noGutters className="w-100">
            <Col xs={6} sm={3}>
              <Search
                classnames="col-xs col-md-12 p-0"
                searchPlaceholder={'Search'}
                onHandleChange={onChangeSearch}
              />
            </Col>
            <Col
              sm={9}
              className="d-flex justify-content-end align-items-center"
            ></Col>
          </Row>
        </Card.Header>
        <Card.Body className="p-0">
          <ProductTable
            data={products}
            permission={permissions}
            paginationInfo={pagination}
            selectAll={selectAll}
            setSelectAll={setSelectAll}
            handleEdit={onHandleEdit}
            onPageChange={onHandleChangePage}
            selectedProducts={selectedProducts}
            setSelectedProducts={setSelectedProducts}
            dataInDB={dataInDB}
            onCreate={onCreate}
          />
        </Card.Body>
      </Card>
    </>
  );
};

export default Products;
