import React, { useEffect, useState } from 'react';
import { QueryBuilder } from '@cubejs-client/react';
import { cubeService } from '../../services';
import { CardHeader, Col, FormGroup, Label } from 'reactstrap';
import Asterick from '../commons/Asterick';
import _ from 'lodash';
import {
  ComponentsDisplayType,
  getFieldsLabelByComponentType,
  LimitRange,
  RelativeTimeRange,
  RelativeTimeRangePast,
  MODULES_TO_SHOW,
} from '../../views/Overview/dashboard/dashboard.constants';
import ComponentFilterCriteria from '../../views/Overview/dashboard/ComponentFilterCriteria';
import ButtonIcon from '../commons/ButtonIcon';
import InputValidation from '../commons/InputValidation';
import DropdownValidation from '../commons/DropdownValidation';

const ExploreQueryBuilder = ({
  componentStyle,
  componentFormData,
  updateFormData,
  updateFormDataRaw,
  errors,
  register,
  config,
  setValue,
  isEdited,
}) => {
  const [selectedModule, setSelectedModule] = useState({});
  const [durationList, setDurationList] = useState([]);
  const [relatedModules, setRelatedModules] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedRelatedModule, setSelectedRelatedModule] = useState({});

  const [dimensionAndDurationList, setDimensionAndDurationList] = useState([]);

  const [selectedDimension, setSelectedDimension] = useState();
  const [allDimensionList, setAllDimensionList] = useState([]);
  const [isMoreOptions, setIsMoreOptions] = useState(false);
  const [sortByList, setSortByList] = useState([]);
  const [modules, setModules] = useState([]);
  const [moduleList, setModuleList] = useState([]);
  const [measuresList, setMeasuresList] = useState([]);
  const [isTimeTypeSelected, setIsTimeTypeSelected] = useState(false);
  const fieldsLabel = getFieldsLabelByComponentType(componentStyle.displayType);
  const isChartType = componentStyle.displayType.includes('chart_');
  const isDateRange =
    componentStyle.displayType === ComponentsDisplayType.kpi_basic ||
    componentStyle.displayType === ComponentsDisplayType.kpi_rankings;

  useEffect(() => {
    const getModuleList = async () => {
      const { data } = await cubeService.getMeta();
      setModules(data.cubes);
      const modulesToShow = data.cubes.filter(
        (cube) => cube.name.toLowerCase() in MODULES_TO_SHOW
      );
      setModuleList(modulesToShow);
    };
    getModuleList();
  }, []);

  useEffect(() => {
    if (selectedType && (selectedModule || selectedRelatedModule)) {
      // if (
      //   selectedType === 'module' &&
      //   selectedModule?.name?.toLowerCase() === 'product'
      // ) {
      //   const relatedModulesDeal = modules.filter(
      //     (cube) => cube.name.toLowerCase() === 'deal'
      //   );
      //   setRelatedModules(relatedModulesDeal);
      // }

      showHideFieldsByModule(selectedType);
    }
  }, [selectedType, selectedModule, selectedRelatedModule]);

  const showHideFieldsByModule = (selectedType) => {
    let moduleFromList = modules.filter(
      (cube) =>
        cube.name.toLowerCase() === selectedModule?.name?.toLowerCase() ||
        cube.name.toLowerCase() === selectedRelatedModule?.name?.toLowerCase()
    );

    const allMeasures = _(moduleFromList)
      .map((cube) => cube.measures)
      .flatten()
      .filter((measure) => !measure.name.includes('meta'))
      .value();

    // this loops through each cube
    // and its measures array and then gets relatedTypes from inside meta and show in UI related modules dropdown
    if (selectedType === 'module') {
      let relatedModules = _(moduleFromList)
        .map((cube) => cube.measures)
        .flatten()
        .map((measure) => measure?.meta?.relatedTypes)
        .filter((related) => !!related)
        .flatten()
        .value();

      // if product selected, set deal related modules, getting issue in adding meta tag in view. need to Edit later
      if (selectedModule?.name?.toLowerCase() === 'product') {
        const relatedModulesDeal = moduleList.filter(
          (cube) => cube.name.toLowerCase() === 'deal'
        );

        relatedModules = [...relatedModules, ...[relatedModulesDeal[0].name]];
      }
      setRelatedModules(relatedModules);
    }
    // getting all dimensions
    if (
      selectedModule?.name?.toLowerCase() === 'deal' ||
      selectedRelatedModule?.name?.toLowerCase() === 'deal'
    ) {
      const getTenantDealStage = modules.filter(
        (cube) =>
          cube.name.toLowerCase().includes('tenantdealstage') ||
          cube.name.toLowerCase().includes('assigneduser')
      );
      moduleFromList = [...moduleFromList, ...getTenantDealStage];
    }
    const allDimensions = _(moduleFromList)
      .map((cube) => cube.dimensions)
      .flatten()
      .value();

    // only getting dimensions with type time for duration dropdown
    const timeDuration = allDimensions.filter(
      (dimension) => dimension.type === 'time'
    );

    // getting all dimensions except time for filter criteria dropdown
    const dimensions = allDimensions.filter(
      (dimension) => dimension.type !== 'time'
    );

    setDurationList(timeDuration);
    setDimensionAndDurationList([...dimensions, ...timeDuration]);
    setAllDimensionList(allDimensions);
    setMeasuresList(allMeasures);

    return {
      relatedModules,
      timeDuration,
      dimensions,
      allDimensions,
      allMeasures,
    };
  };

  const setValueAscendingDescending = (value, value2) => {
    let list = [
      { name: [value, 'asc'], title: 'Value Ascending' },
      { name: [value, 'desc'], title: 'Value Descending' },
    ];
    if (value2) {
      list = [
        ...list,
        ...[
          { name: [value2, 'asc'], title: 'Label Ascending' },
          { name: [value2, 'desc'], title: 'Label Descending' },
        ],
      ];
    }
    setSortByList(list);
  };

  useEffect(() => {
    if (isChartType) {
      if (isTimeTypeSelected) {
        updateFormData('analytic', 'timeDimensions', [
          {
            dateRange: componentFormData.analytic?.timeDimensions[0]?.dateRange,
            dimension: componentFormData.analytic?.dimensions[0],
          },
        ]);
      }
    }
  }, [isTimeTypeSelected]);

  useEffect(() => {
    if (isEdited) {
      const { analytic } = componentFormData;
      setSelectedModule({ name: analytic.type });
      const { allDimensions } = showHideFieldsByModule(analytic.type);
      const selectedDimension = allDimensions.find(
        (dimension) =>
          dimension.name === componentFormData.analytic.dimensions[0]
      );
      setIsTimeTypeSelected(selectedDimension?.type === 'time');

      if (analytic.dimensions.length) {
        if (isChartType && analytic.order && analytic.order.length) {
          componentFormData.analytic.dimensions = [
            ...componentFormData.analytic.dimensions,
            analytic.order[0][0],
          ];
        }
      }

      // hook form required fields set to avoid errors when hit save
      setValue('name', analytic.name);
      setValue('module', analytic.type);
      setValue('measures', analytic.measures);
      setValue(
        'dimensions',
        fieldsLabel?.one === 'Duration'
          ? analytic.timeDimensions
          : analytic.dimensions
      );
      setValue('timeDimensions', analytic.timeDimensions);

      if (isChartType) {
        if (analytic.limit && analytic.order && analytic.order.length) {
          setIsMoreOptions(true);
        }
        setValueAscendingDescending(
          analytic.dimensions[0],
          analytic.dimensions[1]
        );
      }
    }
  }, [isEdited, moduleList]);

  const handleSelectedModule = (e) => {
    const moduleName = e.target.value;
    setSelectedType('module');
    setSelectedModule({ name: moduleName });

    updateFormData('analytic', 'type', moduleName);
  };

  const handleRelatedType = (moduleName) => {
    updateFormData('analytic', 'relatedTypes', nullify(moduleName));
    setSelectedType('relatedModule');
    setSelectedRelatedModule({ name: moduleName });
  };

  const handleTimeDimension = (start, end) => {
    updateFormData('analytic', 'timeDimensions', [
      {
        compareDateRange: [start, end].filter((val) => !!val),
        dimension: selectedDimension[0],
        granularity: start?.split(' ')[1]?.trim(),
      },
    ]);
  };

  const handleTimeDimensionDateRange = (start) => {
    updateFormData('analytic', 'timeDimensions', [
      {
        dateRange: start,
        dimension: selectedDimension[0],
      },
    ]);
  };
  const handleSortBy = (value) => {
    const orderValue = value ? [value.split(',')] : [];
    updateFormData('analytic', 'order', orderValue);
  };

  const handleDimension = (value, value2) => {
    let payLoad = {};

    if (fieldsLabel?.one !== 'Duration') {
      payLoad = updateFormData(
        'analytic',
        'dimensions',
        [value, value2].filter((val) => !!val)
      );
    } else {
      if (componentFormData.analytic?.timeDimensions[0]?.dateRange) {
        updateFormData('analytic', 'timeDimensions', [
          {
            dimension: [value, value2].filter((val) => !!val)[0],
            dateRange: componentFormData.analytic?.timeDimensions[0]?.dateRange
              ? componentFormData.analytic?.timeDimensions[0]?.dateRange
              : '',
          },
        ]);
      } else if (
        componentFormData.analytic?.timeDimensions[0]?.compareDateRange
      ) {
        updateFormData('analytic', 'timeDimensions', [
          {
            compareDateRange: componentFormData.analytic?.timeDimensions[0]
              ?.compareDateRange
              ? componentFormData.analytic?.timeDimensions[0]?.compareDateRange
              : '',
            dimension: [value, value2].filter((val) => !!val)[0],
            granularity: componentFormData.analytic?.timeDimensions[0]
              ?.granularity
              ? componentFormData.analytic?.timeDimensions[0]?.granularity
              : '',
          },
        ]);
      }
    }
    setSelectedDimension([value, value2].filter((val) => !!val));
    if (isChartType) {
      setValueAscendingDescending(value, value2);

      const selectedDimension = allDimensionList.find(
        (dimension) => dimension.name === value
      );
      const isTimeType = selectedDimension?.type === 'time';
      setIsTimeTypeSelected(isTimeType);
      if (!isTimeType) {
        payLoad.analytic.timeDimensions = [];
      }
      updateFormDataRaw(payLoad);
    }
  };

  const handleRank = (value, value2) => {
    updateFormData(
      'analytic',
      'dimensions',
      [value, value2].filter((val) => !!val)
    );
  };
  const nullify = (value) => {
    return value ? [value] : [];
  };
  return (
    <QueryBuilder
      wrapWithQueryRenderer={false}
      render={() => [
        <>
          <FormGroup row className="py-1">
            <Label md={3} className="text-right font-size-sm">
              Component Name <Asterick />
            </Label>
            <Col md={9} className="pl-0">
              <InputValidation
                name="name"
                type="input"
                placeholder="Enter Component Name"
                value={componentFormData.component.name}
                validationConfig={{
                  ...config.name,
                  onChange: (e) => {
                    updateFormData('component', 'name', e.target.value);
                    // hook form method to set so that requirement meets
                    setValue('name', e.target.value);
                  },
                }}
                errors={errors}
                register={register}
                errorDisplay="mb-0"
              />
            </Col>
          </FormGroup>
          <FormGroup row className="py-1">
            <Label md={3} className="text-right font-size-sm">
              Module(s) <Asterick />
            </Label>
            <Col
              md={selectedModule?.name ? 5 : 9}
              className={`pl-0 ${selectedModule?.name ? 'pr-2' : ''}`}
            >
              <DropdownValidation
                name="module"
                value={componentFormData.analytic?.type}
                validationConfig={{
                  ...config.module,
                  onChange: (e) => {
                    handleSelectedModule(e);
                    // hook form method to set so that requirement meets
                    setValue('module', e.target.value);
                  },
                }}
                errors={errors}
                register={register}
                classNames="font-size-sm"
                options={moduleList || []}
                emptyOption="Select module"
                placeholder="Module"
                errorDisplay="mb-0"
              />
            </Col>
            {selectedModule?.name && (
              <Col md={4} className="pl-0">
                <select
                  className="form-control font-size-sm"
                  value={componentFormData.analytic?.relatedTypes[0]}
                  onChange={(e) => handleRelatedType(e.target.value)}
                >
                  <option value="">None</option>
                  {relatedModules.map((related, index) => (
                    <option key={index} value={related}>
                      {_.startCase(related)}
                    </option>
                  ))}
                </select>
              </Col>
            )}
          </FormGroup>
          {selectedModule?.name && !isChartType && (
            <FormGroup row className="py-1">
              <Label md={3} className="text-right font-size-sm">
                KPI metric <Asterick />
              </Label>
              <Col md={9} className="pl-0">
                <DropdownValidation
                  name="measures"
                  value={componentFormData.analytic?.measures[0]}
                  validationConfig={{
                    ...config.measures,
                    onChange: (e) => {
                      updateFormData(
                        'analytic',
                        'measures',
                        nullify(e.target.value)
                      );
                      // hook form method to set so that requirement meets
                      setValue('measures', [e.target.value]);
                    },
                  }}
                  errors={errors}
                  register={register}
                  classNames="font-size-sm"
                  errorDisplay="mb-0"
                  customKeys={['name', 'description']}
                  options={measuresList}
                  emptyOption="Select metric"
                  placeholder="KPI metric"
                />
              </Col>
            </FormGroup>
          )}

          {selectedModule?.name && !isChartType && (
            <ComponentFilterCriteria
              dimensionList={dimensionAndDurationList}
              componentFormData={componentFormData}
              updateFormData={updateFormData}
              isEdited={isEdited}
            />
          )}

          {selectedModule?.name && !isChartType && (
            <>
              <FormGroup row className="py-1">
                <Label md={3} className="text-right font-size-sm text-nowrap">
                  {fieldsLabel?.one} <Asterick />
                </Label>
                <Col
                  md={
                    componentFormData.analytic?.dimensions[0]?.length ||
                    componentFormData.analytic?.timeDimensions?.length > 0 ||
                    selectedDimension?.length > 0
                      ? 5
                      : 9
                  }
                  className="pl-0"
                >
                  <DropdownValidation
                    name="dimensions"
                    value={
                      componentFormData.analytic?.timeDimensions[0]?.dimension
                    }
                    validationConfig={{
                      ...config.dimensions,
                      onChange: (e) => {
                        handleDimension(e.target.value);
                        // hook form method to set so that requirement meets
                        setValue('dimensions', [e.target.value]);
                      },
                    }}
                    errors={errors}
                    register={register}
                    classNames="font-size-sm"
                    errorDisplay="mb-0"
                    options={durationList}
                    placeholder={fieldsLabel?.one}
                  />
                </Col>
                {(componentFormData.analytic?.dimensions[0]?.length > 0 ||
                  selectedDimension?.length > 0 ||
                  componentFormData.analytic?.timeDimensions?.length > 0) && (
                  <Col md={4} className="pl-0">
                    <>
                      {isDateRange ? (
                        <DropdownValidation
                          name="timeDimensions"
                          value={
                            componentFormData.analytic?.timeDimensions[0]
                              ?.dateRange
                          }
                          validationConfig={{
                            ...config.timeDimensions,
                            onChange: (e) => {
                              handleTimeDimensionDateRange(e.target.value);
                              // hook form method to set so that requirement meets
                              setValue('timeDimensions', [e.target.value]);
                            },
                          }}
                          errors={errors}
                          register={register}
                          classNames="font-size-sm"
                          errorDisplay="mb-0"
                          options={RelativeTimeRange || []}
                          placeholder="Time duration"
                        />
                      ) : (
                        <DropdownValidation
                          name="timeDimensions"
                          value={
                            componentFormData.analytic?.timeDimensions[0]
                              ?.compareDateRange?.length
                              ? componentFormData.analytic?.timeDimensions[0]
                                  ?.compareDateRange[0]
                              : componentFormData.analytic?.timeDimensions[0]
                                  ?.dateRange
                          }
                          validationConfig={{
                            ...config.timeDimensions,
                            onChange: (e) => {
                              handleTimeDimension(
                                e.target.value,
                                componentFormData.analytic?.timeDimensions[0]
                                  ?.compareDateRange[1]
                              );
                              // hook form method to set so that requirement meets
                              setValue('timeDimensions', [e.target.value]);
                            },
                          }}
                          errors={errors}
                          register={register}
                          classNames="font-size-sm"
                          errorDisplay="mb-0"
                          options={RelativeTimeRange || []}
                          placeholder="Time duration"
                        />
                      )}
                    </>
                  </Col>
                )}
              </FormGroup>
              {isChartType && (
                <FormGroup row className="py-1">
                  <Label md={3} className="text-right font-size-sm text-nowrap">
                    {fieldsLabel?.second}
                  </Label>
                  <Col md={9} className="pl-0">
                    <select
                      className="form-control font-size-sm"
                      value={componentFormData.analytic?.dimensions[1]}
                      onChange={(e) =>
                        handleDimension(
                          componentFormData.analytic?.dimensions[0],
                          e.target.value
                        )
                      }
                    >
                      <option value="">Select</option>
                      {allDimensionList.map((ms, index) => (
                        <option key={index} value={ms.name}>
                          {ms.title}
                        </option>
                      ))}
                    </select>
                  </Col>
                </FormGroup>
              )}
            </>
          )}

          {selectedModule?.name && isChartType && (
            <>
              <FormGroup row className="py-1">
                <Label md={3} className="text-right font-size-sm text-nowrap">
                  {fieldsLabel?.one} <Asterick />
                </Label>
                <Col md={9} className="pl-0">
                  <DropdownValidation
                    name="dimensions"
                    value={componentFormData.analytic?.measures[0]}
                    validationConfig={{
                      ...config.dimensions,
                      onChange: (e) => {
                        updateFormData(
                          'analytic',
                          'measures',
                          nullify(e.target.value)
                        );
                        // hook form method to set so that requirement meets
                        setValue('measures', [e.target.value]);
                      },
                    }}
                    errors={errors}
                    register={register}
                    classNames="font-size-sm"
                    errorDisplay="mb-0"
                    customKeys={['name', 'description']}
                    options={measuresList}
                    placeholder={fieldsLabel?.one}
                  />
                </Col>
              </FormGroup>
              <FormGroup row className="py-1">
                <Label md={3} className="text-right font-size-sm text-nowrap">
                  {fieldsLabel?.second}
                </Label>
                <Col
                  md={
                    componentFormData.analytic?.dimensions[0]?.length > 0 &&
                    isTimeTypeSelected
                      ? 5
                      : 9
                  }
                  className="pl-0"
                >
                  <select
                    className="form-control font-size-sm"
                    value={componentFormData.analytic?.dimensions[0]}
                    onChange={(e) => {
                      handleDimension(e.target.value);
                      // hook form method to set so that requirement meets
                      setValue('dimensions', [e.target.value]);
                    }}
                  >
                    <option value="">Select</option>
                    {allDimensionList.map((ms, index) => (
                      <option key={index} value={ms.name}>
                        {ms.title}
                      </option>
                    ))}
                  </select>
                </Col>
                {(componentFormData.analytic?.dimensions[0]?.length > 0 ||
                  componentFormData.analytic?.timeDimensions?.length > 0) &&
                  isTimeTypeSelected && (
                    <Col md={4} className="pl-0">
                      <DropdownValidation
                        name="timeDimensions"
                        value={
                          componentFormData.analytic?.timeDimensions[0]
                            ?.dateRange
                        }
                        validationConfig={{
                          ...config.timeDimensions,
                          onChange: (e) => {
                            handleTimeDimensionDateRange(e.target.value);
                            // hook form method to set so that requirement meets
                            setValue('timeDimensions', [e.target.value]);
                          },
                        }}
                        errors={errors}
                        register={register}
                        classNames="font-size-sm"
                        errorDisplay="mb-0"
                        options={RelativeTimeRange || []}
                        placeholder="Time duration"
                      />
                    </Col>
                  )}
              </FormGroup>
            </>
          )}

          {selectedModule?.name && isChartType && (
            <ComponentFilterCriteria
              dimensionList={dimensionAndDurationList}
              componentFormData={componentFormData}
              updateFormData={updateFormData}
              isEdited={isEdited}
            />
          )}

          {isChartType ? (
            <>
              {!isMoreOptions && selectedModule?.name && (
                <FormGroup row>
                  <Col md={12}>
                    <ButtonIcon
                      color="link"
                      icon="expand_more"
                      onclick={() => setIsMoreOptions(!isMoreOptions)}
                      label="More options"
                      classnames="border-0 px-0 d-flex align-items-center flex-row-reverse"
                    />
                  </Col>
                </FormGroup>
              )}
              {isMoreOptions && selectedModule?.name && (
                <div>
                  <FormGroup row className="py-1">
                    <Label md={3} className="text-right font-size-sm">
                      Sort by
                    </Label>
                    <Col md={9} className="pl-0">
                      <select
                        className="form-control font-size-sm"
                        value={componentFormData.analytic?.order}
                        onChange={(e) => handleSortBy(e.target.value)}
                      >
                        <option value="">None</option>
                        {sortByList.map((timeRange, index) => (
                          <option key={index} value={timeRange.name}>
                            {timeRange.title}
                          </option>
                        ))}
                      </select>
                    </Col>
                  </FormGroup>
                  <FormGroup row className="py-1">
                    <Label md={3} className="text-right font-size-sm">
                      Maximum grouping
                    </Label>
                    <Col md={9} className="pl-0">
                      <select
                        className="form-control font-size-sm"
                        value={componentFormData.analytic?.limit}
                        onChange={(e) =>
                          updateFormData(
                            'analytic',
                            'limit',
                            parseInt(e.target.value)
                          )
                        }
                      >
                        <option value="">Select</option>
                        {LimitRange.map((timeRange, index) => (
                          <option key={index} value={timeRange.name}>
                            {timeRange.name}
                          </option>
                        ))}
                      </select>
                    </Col>
                  </FormGroup>
                </div>
              )}
            </>
          ) : (
            <>
              {componentStyle.displayType !== ComponentsDisplayType.kpi_basic &&
                componentStyle.displayType !==
                  ComponentsDisplayType.kpi_rankings &&
                (componentFormData.analytic?.dimensions[0]?.length > 0 ||
                  componentFormData.analytic?.timeDimensions?.length > 0 ||
                  selectedDimension?.length > 0) && (
                  <>
                    <CardHeader className="pl-0 border-0">
                      <h4 className="mb-0">Comparison Indicator</h4>
                    </CardHeader>
                    <FormGroup row className="py-1">
                      <Label md={3} className="text-right font-size-sm">
                        Compare To
                      </Label>
                      <Col md={9} className="pl-0">
                        {(componentFormData.analytic?.dimensions[0]?.length >
                          0 ||
                          componentFormData.analytic?.timeDimensions?.length >
                            0 ||
                          selectedDimension?.length > 0) && (
                          <select
                            className="form-control font-size-sm"
                            value={
                              componentFormData.analytic?.timeDimensions[0]
                                ?.compareDateRange[1]
                            }
                            onChange={(e) =>
                              handleTimeDimension(
                                componentFormData.analytic?.timeDimensions[0]
                                  ?.compareDateRange[0],
                                e.target.value
                              )
                            }
                          >
                            <option value="">Select</option>
                            {RelativeTimeRangePast.map((timeRange, index) => (
                              <option key={index} value={timeRange.name}>
                                {timeRange.title}
                              </option>
                            ))}
                          </select>
                        )}
                      </Col>
                    </FormGroup>
                  </>
                )}

              {(componentStyle.displayType ===
                ComponentsDisplayType.kpi_rankings ||
                componentStyle.displayType ===
                  ComponentsDisplayType.kpi_scorecard) &&
                (componentFormData.analytic?.dimensions[0]?.length > 0 ||
                  selectedDimension?.length > 0) && (
                  <>
                    <CardHeader className="pl-0 border-0">
                      <h4 className="mb-0">Rank</h4>
                    </CardHeader>
                    <FormGroup row className="py-1">
                      <Label md={3} className="text-right font-size-sm">
                        Rank
                      </Label>
                      <Col md={9} className="pl-0">
                        {(componentFormData.analytic?.dimensions[0]?.length >
                          0 ||
                          selectedDimension?.length > 0) && (
                          <select
                            className="form-control font-size-sm"
                            value={componentFormData.analytic?.dimensions[0]}
                            onChange={(e) => handleRank(e.target.value)}
                          >
                            <option value="">Select</option>
                            {allDimensionList.map((timeRange, index) => (
                              <option
                                key={index}
                                value={timeRange.name}
                                selected={
                                  componentFormData.analytic.dimensions[0] ===
                                  timeRange.name
                                }
                              >
                                {timeRange.title}
                              </option>
                            ))}
                          </select>
                        )}
                      </Col>
                    </FormGroup>
                    <FormGroup row className="py-1">
                      <Label md={3} className="text-right font-size-sm">
                        Show
                      </Label>
                      <Col md={9} className="pl-0">
                        {(componentFormData.analytic?.dimensions[0]?.length >
                          0 ||
                          selectedDimension?.length > 0) && (
                          <select
                            className="form-control font-size-sm"
                            value={componentFormData.analytic?.limit}
                            onChange={(e) =>
                              updateFormData(
                                'analytic',
                                'limit',
                                parseInt(e.target.value)
                              )
                            }
                          >
                            <option value="">Select</option>
                            {LimitRange.map((timeRange, index) => (
                              <option key={index} value={timeRange.name}>
                                {timeRange.title}
                              </option>
                            ))}
                          </select>
                        )}
                      </Col>
                    </FormGroup>
                  </>
                )}
            </>
          )}
        </>,
      ]}
    />
  );
};

export default ExploreQueryBuilder;
