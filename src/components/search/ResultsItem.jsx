import { Col, ListGroup, Row } from 'react-bootstrap';
import filesService from '../../services/files.service';
import fileDownload from 'js-file-download';
import routes from '../../utils/routes.json';
import {
  clearMenuSelection,
  replaceSpaceWithCharacter,
} from '../../utils/Utils';
import { useHistory } from 'react-router-dom';
import IdfTooltip from '../idfComponents/idfTooltip';
import MaterialIcon from '../commons/MaterialIcon';
import useIsTenant from '../../hooks/useIsTenant';

export const ResultsItem = ({
  keyMap,
  type,
  dealName,
  dealId,
  contactName,
  contactId,
  organizationName,
  organizationId,
  setGetActivityId,
  activityDetail,
  lessonId,
  lessonName,
  categoryName,
  courseId,
  courseName,
  activityId,
  activityName,
  activityType,
  productName,
  fileId,
  fileName,
  setToast,
  setShow,
}) => {
  const history = useHistory();
  const getSubItemData = () => {
    const subIconOwner =
      (contactId && 'person') ||
      (organizationId && 'corporate_fare') ||
      (dealId && 'monetization_on') ||
      '';

    const subTextOwner =
      (contactId && contactName) ||
      (organizationId && organizationName) ||
      (dealId && dealName) ||
      '';

    const subItemData = {
      deal: {
        iconA: 'person',
        textA: contactName,
        iconB: 'corporate_fare',
        textB: organizationName,
      },
      contact: {
        iconA: 'corporate_fare',
        textA: organizationName,
      },
      organization: {
        iconA: 'person',
        textA: contactName,
      },
      lesson: lessonName,
      course: courseName,
      category: categoryName,
      activity: {
        iconA: subIconOwner,
        textA: subTextOwner,
      },
      file: {
        iconA: subIconOwner,
        textA: subTextOwner,
      },
    };

    return {
      iconA: subItemData[type]?.iconA,
      textA: subItemData[type]?.textA,
      iconB: subItemData[type]?.iconB,
      textB: subItemData[type]?.textB,
    };
  };

  const queryTitles = {
    contact: contactName,
    deal: dealName,
    organization: organizationName,
    lesson: lessonName,
    course: courseName,
    category: categoryName,
    product: productName,
    task: activityName,
    call: activityName,
    event: activityName,
    file: fileName,
  };
  const isSynovus = useIsTenant().isSynovusBank;
  const contactPath = `${routes.contacts}/${contactId}/profile`;
  const organizationPath = isSynovus
    ? `${routes.insightsCompanies}/${organizationId}/organization/profile`
    : `${routes.companies}/${organizationId}/organization/profile`;
  const dealPath = `${routes.dealsPipeline}/${dealId}`;

  const ownerPath =
    (contactId && contactPath) ||
    (organizationId && organizationPath) ||
    (dealId && dealPath) ||
    '';

  const productPath = `/settings/products`;

  const queryPaths = {
    contact: contactPath,
    deal: dealPath,
    organization: organizationPath,
    lesson: `${routes.lesson.replace(':id', lessonId)}`,
    category: `${routes.categories}/${replaceSpaceWithCharacter(
      categoryName?.toLowerCase()
    )}`,
    course: `${routes.courses}/${courseId}`,
    product: productPath,
    file: ownerPath,
  };

  const getItemTitle = (type) => {
    return queryTitles[type] || '';
  };

  const getItemPath = (type) => {
    return queryPaths[type] || '';
  };

  const redirectHandler = (e, path) => {
    e.preventDefault();
    clearMenuSelection(e);
    history.push(path);
    setShow(false);
  };

  const fileRedirectHandler = () => {
    history.push(
      (contactId && contactPath) ||
        (organizationId && organizationPath) ||
        (dealId && dealPath)
    );
    setShow(false);
  };

  const getSingleActivity = async () => {
    activityDetail(activityId);
  };
  const downloadFile = (e) => {
    e.preventDefault();
    filesService
      .getFile(fileId)
      .then((response) => {
        fileDownload(response?.data, response?.data?.filename_download);
        setToast({ message: 'Download started', color: 'success' });
      })
      .catch((err) => setToast({ message: err.message, color: 'danger' }));
  };
  let title = getItemTitle(type);
  let path = getItemPath(type);
  const subItemData = getSubItemData();
  if (type === 'activity') {
    path = getItemPath(activityType);
    title = queryTitles[activityType];
  } else {
    title = queryTitles[type];
  }
  const ResultItem = ({ children }) => (
    <ListGroup.Item
      key={keyMap}
      action
      className="fw-bold fs-7 global-search-item py-1"
    >
      <Row className="pl-3">
        <Col
          className="p-0"
          onClick={(e) => {
            type === 'file'
              ? fileRedirectHandler()
              : type === 'activity'
              ? getSingleActivity()
              : redirectHandler(e, path);
          }}
        >
          <Row>
            <Col>{title}</Col>
          </Row>
          {children}
        </Col>
        {type === 'file' && (
          <Col className="col-auto p-0 main-icon">
            <IdfTooltip text="Download">
              <a
                href=""
                className="text-hover-gray rounded-circle"
                onClick={(e) => downloadFile(e)}
              >
                <MaterialIcon icon="file_download" clazz="mr-2 text-gray-700" />
              </a>
            </IdfTooltip>
          </Col>
        )}
      </Row>
    </ListGroup.Item>
  );

  const stripText = (text, maxLength) => {
    if (text && text.length > maxLength) {
      return text.substr(0, maxLength) + '...';
    }
    return text;
  };

  const SubItem = ({ icon, text }) => {
    return text ? (
      <div className="pr-2">
        <div className="d-flex align-items-center">
          <div className="pr-1">
            <span className="material-icons-outlined fs-7 item-text-secondary">
              {icon || ''}
            </span>
          </div>
          <div className="p-0 item-text-secondary">
            {stripText(text, 20) || ''}
          </div>
        </div>
      </div>
    ) : null;
  };

  return (
    <>
      <ResultItem>
        {(subItemData?.textA || subItemData?.textB) && (
          <div className="d-flex align-items-center">
            <SubItem icon={subItemData?.iconA} text={subItemData?.textA} />
            <SubItem icon={subItemData?.iconB} text={subItemData?.textB} />
          </div>
        )}
      </ResultItem>
    </>
  );
};
