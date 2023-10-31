import { floorFigure, parsePercentage, setDateFormat } from '../../utils/Utils';

export const formatQueryResult = (field, result, annotation, opts = {}) => {
  const { measures, dimensions } = annotation;

  if (!measures[field] && !dimensions[field]) {
    return result[field];
  }

  const attrs = measures[field] || dimensions[field];

  if (!attrs) {
    return result[field];
  }

  if (attrs.format === 'currency') {
    return floorFigure(result[field]);
  }
  if (attrs.format === 'percent') {
    return parsePercentage(result[field]);
  }
  if (attrs.type === 'time') {
    return setDateFormat(result[field], opts.format);
  }
  if (
    attrs.type === 'number' &&
    attrs.meta &&
    attrs.meta.type === 'date-diff'
  ) {
    return result[field].days || 0;
  }
  return result[field];
};
