import { Drawer } from '@mui/material';
import { Card, CardBody, CardFooter, CardHeader } from 'reactstrap';

const RightSlidingDrawer = ({
  open,
  toggleDrawer,
  position = 'right',
  withCard,
  header,
  body,
  footer,
  containerWidth = 1030,
  children,
}) => {
  return (
    <>
      {withCard ? (
        <Drawer anchor={position} open={open} onClose={toggleDrawer}>
          <Card
            className="p-0 shadow-0 rounded-0 h-100"
            style={{ minWidth: containerWidth }}
          >
            <CardHeader className="bg-gray-5">{header}</CardHeader>
            <CardBody className="overflow-y-auto h-100 pt-0 pb-0">
              {body}
            </CardBody>
            <CardFooter className="bg-gray-5">{footer}</CardFooter>
          </Card>
        </Drawer>
      ) : (
        <Drawer anchor={position} open={open} onClose={toggleDrawer}>
          {children}
        </Drawer>
      )}
    </>
  );
};

export default RightSlidingDrawer;
