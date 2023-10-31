import { useState, useEffect } from 'react';
import { scrollToTop } from '../../utils/Utils';
import ButtonIcon from '../commons/ButtonIcon';

export default function Nav(props) {
  const [show, setShow] = useState(true);
  const progress = Math.ceil(props.progress * 100);

  useEffect(() => {
    if (
      props.allSteps[0].order === props.current ||
      props.allSteps[props.allSteps.length - 1].order === props.current ||
      (props.state.disable_nav &&
        props.state.retake &&
        props.state.disable_progress)
    ) {
      setShow(false);
    } else {
      setShow(true);
    }
  }, [props.allSteps, props.state.disable_nav]);

  const handleNextPrev = (nextPrev) => {
    scrollToTop();
    props[nextPrev]();
  };

  return (
    <>
      {show && (
        <div className="row justify-content-between card-footer align-items-center mt-2 d-flex px-0 border-top-0">
          <div className="col-auto w-40">
            <div className="d-flex flex-row align-items-center justify-content-between font-size-sm font-weight-medium text-black mb-2">
              <span
                className="card-header-title"
                data-uw-styling-context="true"
              >
                Lesson Completion
              </span>
            </div>
            <div className="progress w-50 bg-soft-primary">
              <div
                className="progress-bar bg-primary"
                role="progressbar"
                style={{ width: progress + '%' }}
                aria-valuenow="100"
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
          </div>
          {!props.state.disable_nav && (
            <div className="col-auto">
              <div className="d-flex align-items-center justify-content-between">
                {props.progress !== 0 && (
                  <ButtonIcon
                    icon="arrow_back_ios"
                    label="Previous"
                    color={'outline-primary'}
                    classnames="btn-sm font-weight-medium pl-2 pr-3 mr-2"
                    iconClass="font-size-md font-weight-medium"
                    onClick={() => handleNextPrev('prev')}
                  />
                )}

                {props.progress !== 1 && (
                  <ButtonIcon
                    label={
                      <div className="d-flex align-items-center gap-1 pl-1">
                        <span>Next</span>
                        <i
                          className={`material-icons-outlined font-size-md font-weight-medium`}
                          data-uw-styling-context="true"
                        >
                          arrow_forward_ios
                        </i>
                      </div>
                    }
                    color={'primary'}
                    classnames={`btn-sm`}
                    onClick={() => handleNextPrev('next')}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
