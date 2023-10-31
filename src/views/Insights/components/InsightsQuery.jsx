import { Card } from 'react-bootstrap';
import { AnalyticsQuery } from '../../../components/analytics';

export const InsightsQuery = ({ query, render, setQuery }) => {
  return (
    <>
      <Card.Body className="overflow-x-auto p-0 h-100">
        <AnalyticsQuery query={query} setQuery={setQuery} render={render} />
      </Card.Body>
    </>
  );
};
