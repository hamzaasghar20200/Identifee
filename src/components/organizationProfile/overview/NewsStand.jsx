import { useEffect, useState } from 'react';
import { OverlayTrigger, Tooltip, Image } from 'react-bootstrap';
import RightPanelModal from '../../../components/modal/RightPanelModal';
import { GetFriendlyDate } from '../../../components/news/utils';
import MaterialIcon from '../../commons/MaterialIcon';
import newsService from '../../../services/news.service';
import ShareButton from '../../news/ShareButton';
import ReadLaterButton from '../../news/ReadLaterButton';
import PublisherIcon from '../../news/PublisherIcon';
import SkeletonNewsLoader from '../../../components/loaders/NewsLoader';
import { Link } from 'react-router-dom';
import { overflowing, PROSPECT_RIGHT_PANEL_WIDTH } from '../../../utils/Utils';

const NewsStandPanel = ({ newsstandModal, setNewsstandModal, profileInfo }) => {
  // const [headlines, setHeadlines] = useState([]);
  const [companyNews, setCompanyNews] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    getCompanyNews();
  }, []);

  const getCompanyNews = async () => {
    setIsFetching(true);
    const resp = await newsService.getNews({
      page: 1,
      q: profileInfo.name,
      count: 5,
      country: 'us',
      category: '',
    });

    setIsFetching(false);

    if (resp.data && resp.data.articles) {
      // slice to 5
      setCompanyNews(resp.data.articles.slice(0, 4));
    }
  };

  return (
    <RightPanelModal
      showModal={newsstandModal}
      setShowModal={setNewsstandModal}
      profileInfo={profileInfo}
      containerWidth={PROSPECT_RIGHT_PANEL_WIDTH}
      Title={
        <div className="d-flex py-2 align-items-center">
          <MaterialIcon
            icon="feed"
            clazz="font-size-xl text-white bg-secondary p-1 icon-circle mr-2"
          />
          <h4 className="mb-0">News</h4>
        </div>
      }
    >
      <div>
        {isFetching ? (
          <div className="p-3">
            <SkeletonNewsLoader count={5} />{' '}
          </div>
        ) : (
          ''
        )}
        {companyNews.map((article, idx) => (
          <div className="card m-3" key={idx}>
            <div className="card-body">
              <div className={`d-flex`}>
                <div className="text-left flex-grow-1">
                  <p className="prospect-typography-h4 p-0 mb-1 text-wrap font-weight-semi-bold">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-dark"
                    >
                      {article.title}
                    </a>
                  </p>
                  <ul
                    className="d-flex m-0 p-0"
                    style={{ alignItems: 'center', listStyle: 'none' }}
                  >
                    <li className="mr-1">
                      <PublisherIcon article={article} />
                    </li>
                    <li>
                      <span className="text-muted">
                        {'·  ' + GetFriendlyDate(article.published)}
                      </span>
                    </li>
                    <li>
                      <ReadLaterButton article={article} />
                    </li>
                    <li>
                      <ShareButton article={article} orgId={profileInfo.id} />
                    </li>
                  </ul>
                </div>
                <div className="ml-3">
                  <a href={article.url} target="_blank" rel="noreferrer">
                    {article.image ? (
                      <Image
                        className="cursor-pointer"
                        rounded="true"
                        src={`${article.image}&w=100`}
                      />
                    ) : (
                      <Image
                        className="cursor-pointer"
                        style={{ 'max-height': '100px' }}
                        rounded="true"
                        src="/img/placeholders/news-placeholder-sm.png"
                      />
                    )}
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
        {!isFetching ? (
          <div className="p-3">
            <Link to={`/resources?tab=news`} onClick={() => overflowing()}>
              Load More
            </Link>
          </div>
        ) : (
          ''
        )}
      </div>
    </RightPanelModal>
  );
};

const NewsStand = ({ profileInfo }) => {
  const [newsstandModal, setNewsstandModal] = useState(false);

  const onNewsClick = () => {
    setNewsstandModal(true);
  };

  return (
    <>
      <OverlayTrigger
        key="newsStand"
        placement="bottom"
        overlay={
          <Tooltip
            id={`tooltip-niacs}`}
            className={`tooltip-profile font-weight-bold`}
          >
            <p>News</p>
          </Tooltip>
        }
      >
        <div className="nav-item mb-2" onClick={onNewsClick}>
          <div className="nav-icon cursor-pointer">
            <span className="material-icons-outlined text-white bg-secondary rounded-circle p-1">
              feed
            </span>
          </div>
        </div>
      </OverlayTrigger>
      {newsstandModal && (
        <NewsStandPanel
          newsstandModal={newsstandModal}
          setNewsstandModal={setNewsstandModal}
          profileInfo={profileInfo}
        />
      )}
    </>
  );
};

export default NewsStand;
