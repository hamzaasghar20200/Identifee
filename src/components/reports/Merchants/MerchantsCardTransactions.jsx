import { Card } from 'react-bootstrap';
import MaterialIcon from '../../commons/MaterialIcon';
import { numberWithCommas, isToFixedNoRound } from '../../../utils/Utils';

export const CardTransactions = ({ item, startDownload }) => {
  return (
    <>
      <div>
        <Card
          style={{
            background: 'linear-gradient(46deg, #F8F8FA -11.7%, #FFF 65.74%);',
          }}
        >
          <Card.Body>
            <div className="d-flex justify-content-between flex-column">
              <MaterialIcon
                icon={item?.icon}
                clazz={`text-primary ${
                  startDownload ? 'font-size-2xl' : 'font-size-3xl'
                }`}
              />
            </div>
            <div className={`${startDownload ? '' : ''} mt-5`}>
              <h4 className={`mb-0`}>
                {item?.key === 'total_transactions'
                  ? numberWithCommas(item?.total)
                  : isToFixedNoRound(Math.abs(item?.total))}
              </h4>
              <p className={`mb-0 font-size-sm2`}>{item?.title}</p>
            </div>
          </Card.Body>
        </Card>
      </div>
    </>
  );
};
