import React, { Fragment, useState, useEffect } from 'react';
import { VideoPlaylist } from './VideoPlaylist';
import categoryService from '../../../services/category.service';
import Skeleton from 'react-loading-skeleton';
import Pagination from '../../Pagination';
// import IdfTooltip from '../../idfComponents/idfTooltip';
import MaterialIcon from '../../commons/MaterialIcon';
import NoDataFound from '../../commons/NoDataFound';

const VideoListings = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [loader, setLoader] = useState(false);
  const [catPagination, setCatPagination] = useState({ page: 1, limit: 12 });

  const getCategories = async () => {
    setLoader(true);
    try {
      const { data, pagination } = await categoryService
        .GetCategories(null, catPagination)
        .catch((err) => console.log(err));

      setCatPagination(pagination);
      setCategories(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, [catPagination?.page]);

  const handleCategoryVideo = (e, category) => {
    e.preventDefault();
    setSelectedCategory(category);
  };

  return (
    <Fragment>
      {loader ? (
        <div className="p-3">
          <Skeleton count={5} height={10} className={'mb-2'} />
        </div>
      ) : (
        <Fragment>
          {selectedCategory ? (
            <VideoPlaylist
              category={selectedCategory}
              setCategory={setSelectedCategory}
            />
          ) : (
            <Fragment>
              {categories?.length > 0 ? (
                <Fragment>
                  <div className="page-title pt-3 p-3 d-flex justify-content-between align-items-center">
                    <h1 className="mb-0">Videos</h1>
                  </div>
                  <div className="videos-grid p-4 vh-100">
                    <div className="row g-2">
                      {categories?.map((item, index) =>
                        item?.lessons?.length ? (
                          <div
                            className="col-xxl-4 col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12"
                            key={item.id}
                          >
                            <div
                              className="card video-card v2"
                              onClick={(e) => handleCategoryVideo(e, item)}
                              key={`video-listes-${index}`}
                            >
                              <div className="card-body d-flex gap-2 align-items-center justify-content-between">
                                <div className="text">
                                  <h2 className="d-flex align-items-center gap-2 mb-5">
                                    {item.title}
                                  </h2>
                                  <div className="btn-player d-flex gap-2 align-items-center bg-primary text-white mb-5">
                                    <MaterialIcon
                                      icon="play_circle"
                                      clazz="font-size-2xl"
                                    />
                                    Play all
                                  </div>
                                </div>
                                <div
                                  className="icon-cicle d-flex justify-content-center align-items-center rounded-circle bg-primary"
                                  style={{ width: 96, height: 96 }}
                                >
                                  <MaterialIcon
                                    icon={item.icon || 'all_inbox'}
                                    clazz="font-size-3xl text-white"
                                    filled
                                  />
                                </div>
                              </div>
                              <p className="videos-count weight7">
                                {item.lessons.length} Videos
                              </p>
                            </div>
                          </div>
                        ) : (
                          <></>
                        )
                      )}
                      <div className="col-xxl-12 col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12 text-center mb-3 mt-4 d-flex justify-content-center">
                        <Pagination
                          className="m-auto"
                          paginationInfo={catPagination}
                          onPageChange={(page) => {
                            setCatPagination((prevState) => ({
                              ...prevState,
                              page,
                            }));
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Fragment>
              ) : (
                <NoDataFound
                  icon="play_arrow"
                  containerStyle="text-muted my-6 py-6"
                  title={'Video not found for the selected page.'}
                />
              )}
            </Fragment>
          )}
        </Fragment>
      )}
    </Fragment>
  );
};

export default VideoListings;
