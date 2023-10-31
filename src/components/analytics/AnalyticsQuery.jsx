import { QueryRenderer } from '@cubejs-client/react';
import moment from 'moment';
import { cubeService } from '../../services';
import NoDataFound from '../commons/NoDataFound';
import React from 'react';
import { Spinner } from 'reactstrap';

export const AnalyticsQuery = ({ query = {}, setQuery = () => {}, render }) => {
  const {
    dimensions,
    limit,
    filters,
    measures,
    order,
    segments,
    timeDimensions,
  } = query;

  const validQuery = {
    dimensions,
    limit,
    filters,
    measures,
    order,
    segments,
    timeDimensions,
  };

  return (
    <>
      <QueryRenderer
        query={{ ...validQuery, timezone: moment.tz.guess() }}
        setQuery={setQuery}
        cubejsApi={cubeService.getCube()}
        resetResultSetOnChange={false}
        render={(props) => {
          if (props.error || !props.resultSet || props.loadingState.isLoading) {
            if (props.error) {
              const Title = () => {
                return (
                  <div
                    className="text-gray-search font-size-md"
                    dangerouslySetInnerHTML={{ __html: props?.error }}
                  />
                );
              };
              return (
                <NoDataFound
                  title={<Title />}
                  icon="error"
                  containerStyle="w-100 text-red py-2 h-100 my-2"
                  iconStyle="font-size-3xl"
                />
              );
            } else {
              return (
                <div className="w-100 d-flex justify-content-center h-100 overflow-hidden align-items-center py-2">
                  {' '}
                  <Spinner color="primary" />
                </div>
              );
            }
          }

          const {
            resultSet: {
              loadResponse: { results },
            },
          } = props;

          return render(results, query);
        }}
      />
    </>
  );
};
