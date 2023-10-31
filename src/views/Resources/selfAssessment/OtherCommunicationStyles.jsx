import { Accordion, Card } from 'react-bootstrap';
import React from 'react';
import MaterialIcon from '../../../components/commons/MaterialIcon';
import { COMMUNICATION_STYLES } from './assessmentConstants';
import Bullets from './Bullets';

const AccordionItem = ({ item }) => {
  return (
    <Card className="flex-column-reverse other-accordion">
      <Accordion.Collapse eventKey={item.id}>
        <Card.Body>
          <Bullets list={item.points} listStyle={{ marginLeft: 0 }} />
        </Card.Body>
      </Accordion.Collapse>
      <Accordion.Toggle
        as={Card.Header}
        className="cursor-pointer"
        eventKey={item.id}
      >
        <div className="d-flex w-100 align-items-center justify-content-between">
          <div className="d-flex gap-2 flex-grow-1 align-items-center">
            <img
              src={item.icon}
              style={{ width: 48, height: 48 }}
              className="rounded-circle"
            />{' '}
            <h5 className="mb-0">{item.description}:</h5>
          </div>
          <MaterialIcon
            icon="navigate_next"
            clazz="font-size-2xl ml-auto accordion-arrow"
          />
        </div>
      </Accordion.Toggle>
    </Card>
  );
};
const OtherCommunicationStyles = () => {
  return (
    <div className="text-left px-1">
      <h3>Adjusting to Other Communication Styles</h3>
      <Accordion defaultActiveKey="0" className="mt-3">
        {Object.values(COMMUNICATION_STYLES).map((item) => (
          <AccordionItem item={item} key={item.id} />
        ))}
      </Accordion>
    </div>
  );
};

export default OtherCommunicationStyles;
