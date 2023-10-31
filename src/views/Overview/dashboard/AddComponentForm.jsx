import React, { useState } from 'react';
import {
  Row,
  Col,
  CardBody,
  CardFooter,
  Card,
  CardHeader,
  Form,
} from 'reactstrap';
import WidgetWrapper from './components/WidgetWrapper';
import { ComponentsDisplayType } from './dashboard.constants';
import ExploreQueryBuilder from '../../../components/analytics/ExploreQueryBuilder';
import ButtonIcon from '../../../components/commons/ButtonIcon';
import DashboardService from '../../../services/dashboard.service';
import Alert from '../../../components/Alert/Alert';
import AlertWrapper from '../../../components/Alert/AlertWrapper';
import { useForm } from 'react-hook-form';

const validateFilters = (filters) => {
  return filters.map((m) => {
    if (m.operator === 'notSet') {
      m.values = [''];
      delete m.error;
      return m;
    }
    if (!m.values.length || !m.values[0].trim()) {
      return {
        ...m,
        error: m.member
          ? `Please provide a valid ${m.title}.`
          : 'Please select.',
      };
    } else {
      return m;
    }
  });
};

const AddComponentForm = ({
  componentData,
  componentStyle,
  handleChangeStyle,
  selectedDashboard,
  hideAddComponentModal,
  hideBothModals,
}) => {
  // only adding those that are required
  const defaultComponentForm = {
    name: '',
    module: '',
    measures: [],
    dimensions: [],
    timeDimensions: [],
  };

  // config of each field that is required on a form
  const validationConfig = {
    name: {
      required: 'Component Name is required.',
      inline: false,
    },
    module: {
      required: true,
    },
    measures: {
      required: true,
    },
    dimensions: {
      required: true,
    },
    timeDimensions: {
      required: true,
    },
  };

  const defaultComponentObject = {
    analytic: {
      name: '',
      type: '', // module name
      relatedTypes: [], // relatedType
      displayType: componentStyle.displayType, // component display type
      icon: '',
      isMulti: true,
      dimensions: [], // selected duration
      filters: [],
      limit: 1000,
      measures: [], // selected KPI metric
      order: [], // not doing at the moment
      segments: [], // not doing at the moment
      timeDimensions: [], // {compareDateRange: ["this month", "last month"], dimension: "Deal.dateModified"} relative time range
    },
    component: {
      name: '',
    },
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: defaultComponentForm,
  });

  const [componentFormData, setComponentFormData] = useState(
    componentData || defaultComponentObject
  );

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const updateFormDataRaw = (mewPayload) => {
    setComponentFormData(mewPayload);
  };

  const updateFormData = (keyType, keyFilter, newData) => {
    const payLoad = {
      ...componentFormData,
      [keyType]: {
        ...componentFormData[keyType],
        [keyFilter]: newData,
      },
    };
    setComponentFormData(payLoad);
    return payLoad;
  };

  const checkFiltersIfNotEmpty = () => {
    if (componentFormData.analytic.filters.length) {
      // if we have filters and user didn't add any values in each value field then return and show error in form
      // update state so that it updates in the respective component and show error behind each row
      const filtersWithErrors = validateFilters([
        ...componentFormData.analytic.filters,
      ]);
      updateFormData('analytic', 'filters', filtersWithErrors);

      return filtersWithErrors.some((f) => f.error);
    }
  };

  const handleSave = async () => {
    if (checkFiltersIfNotEmpty()) {
      return;
    }

    setLoading(true);
    const newComponentFormData = { ...componentFormData };
    const isChartType = componentStyle.displayType.includes('chart_');

    if (isChartType) {
      // IDF-2253 change, when there is compare date range use its dimension and send empty .dimensions[]
      const { timeDimensions } = componentFormData.analytic;
      if (
        timeDimensions &&
        timeDimensions.length &&
        timeDimensions[0].compareDateRange
      ) {
        newComponentFormData.analytic.dimensions = [];
      }

      // IDF-2298 change, updating timeDimension inner dimension with the selected dimension
      if (timeDimensions && timeDimensions.length) {
        newComponentFormData.analytic.timeDimensions = [
          {
            ...newComponentFormData.analytic.timeDimensions[0],
            dimension: newComponentFormData.analytic.dimensions[0],
          },
        ];
      }
    }

    // for filters array removing FE generated id when sending to API
    if (componentFormData.analytic.filters.length) {
      newComponentFormData.analytic.filters =
        componentFormData.analytic.filters.map((filter) => {
          const filterWithoutId = { ...filter };
          delete filterWithoutId.id;
          delete filterWithoutId.title;
          return filterWithoutId;
        });
    }

    // whatever set for component.name also set for analytic.name as BE api requires that
    newComponentFormData.analytic.name = newComponentFormData.component.name;

    try {
      if (newComponentFormData.id) {
        const updatedComponentData = {
          component: {
            name: newComponentFormData.component.name,
            analyticId: componentFormData.analytic.id,
            enabled: true, // why would you make it required when sending update request, why!!! API guys
          },
        };
        const updateComponentAnalyticData = {
          ...componentFormData.analytic,
          name: newComponentFormData.component.name,
          displayType: componentStyle.displayType,
        };

        // deleting extra nodes as update API doesnt require them checked from docs.
        delete updateComponentAnalyticData.id;
        delete updateComponentAnalyticData.createdAt;
        delete updateComponentAnalyticData.updatedAt;
        delete updateComponentAnalyticData.createdById;

        const requests = [];
        requests.push(
          DashboardService.updateDashboardComponent(
            selectedDashboard.id,
            newComponentFormData.id,
            updatedComponentData
          )
        );
        requests.push(
          DashboardService.updateDashboardComponentAnalytics(
            selectedDashboard.id,
            newComponentFormData.id,
            updateComponentAnalyticData
          )
        );
        await Promise.all(requests);
      } else {
        await DashboardService.createDashboardComponent(
          selectedDashboard.id,
          newComponentFormData
        );
      }
      hideAddComponentModal();
    } catch (err) {
      setErrorMessage(
        `${err.response.status}: ${err.response.data.error}. Check console for errors.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Form
        className="pl-0 card-body pt-0 overflow-y-auto overflow-x-hidden add-component-form"
        onSubmit={handleSubmit(handleSave)}
      >
        <div>
          <AlertWrapper>
            <Alert
              message={errorMessage}
              setMessage={setErrorMessage}
              color="danger"
            />
          </AlertWrapper>
          <Row className="p-0">
            <Col md={4}>
              <div className="pr-0 pl-3 py-3 position-sticky top-0">
                <WidgetWrapper
                  component={{
                    ...componentStyle,
                  }}
                  withFooter={false}
                  withHeader={!componentStyle.displayType.includes('chart')}
                  containerStyle={
                    componentStyle.displayType.includes('chart') &&
                    componentStyle.displayType !==
                      ComponentsDisplayType.chart_table
                      ? 'align-items-center'
                      : ''
                  }
                />
                <ButtonIcon
                  color="link"
                  onclick={handleChangeStyle}
                  label="Change style"
                  classnames="border-0 px-0 btn-block fs-7"
                />
              </div>
            </Col>
            <Col md={8} className="pl-0">
              <Card className="mt-3 border-md-left">
                <CardHeader>
                  <h4 className="mb-0">Component</h4>
                </CardHeader>
                <CardBody>
                  <ExploreQueryBuilder
                    componentStyle={componentStyle}
                    componentFormData={componentFormData}
                    updateFormData={updateFormData}
                    updateFormDataRaw={updateFormDataRaw}
                    errors={errors}
                    register={register}
                    config={validationConfig}
                    setValue={setValue}
                    isEdited={!!componentFormData?.id}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </Form>
      <CardFooter>
        <div className="d-flex justify-content-end align-items-center">
          <ButtonIcon
            color="white"
            label="Cancel"
            onclick={() => {
              reset(defaultComponentForm);
              hideBothModals();
            }}
            classnames="mr-2 btn-sm"
          />
          <ButtonIcon
            color="primary"
            label="Save"
            loading={loading}
            classnames="btn-sm"
            onclick={handleSubmit((d) => handleSave(d), checkFiltersIfNotEmpty)}
          />
        </div>
      </CardFooter>
    </>
  );
};

export default AddComponentForm;
