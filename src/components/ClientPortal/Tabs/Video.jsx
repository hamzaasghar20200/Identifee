import React, { useState, useEffect } from 'react';
import Pagination from '../../Pagination';
import { VideoPlaylist } from './VideoPlaylist';
import categoryService from '../../../services/category.service';
import Skeleton from 'react-loading-skeleton';
import MaterialIcon from '../../commons/MaterialIcon';
import IdfTooltip from '../../idfComponents/idfTooltip';

import TransitionGroup from 'react-transition-group/TransitionGroup';
import Collapse from '@mui/material/Collapse';
export const PublicVideo = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [loader, setLoader] = useState(false);
  const [catPagination, setCatPagination] = useState({ page: 1, limit: 10 });

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
    <>
      {loader ? (
        <div className="p-3">
          <Skeleton count={5} height={10} className={'mb-2'} />
        </div>
      ) : (
        <>
          {selectedCategory ? (
            <VideoPlaylist
              category={selectedCategory}
              setCategory={setSelectedCategory}
            />
          ) : (
            <div className="overflow-x-hidden">
              <TransitionGroup appear={true}>
                {categories?.map((item, index) => (
                  <Collapse key={item.id}>
                    <div
                      className="row align-items-center cursor-pointer px-3 py-2 border-bottom"
                      onClick={(e) => handleCategoryVideo(e, item)}
                      key={`video-listes-${index}`}
                    >
                      <div className="col">
                        <h5 className="d-flex align-items-center py-1 gap-2 mb-0">
                          <MaterialIcon icon={item.icon || 'all_inbox'} />
                          <span>{item.title}</span>
                        </h5>
                      </div>
                      <div className="col-auto">
                        <a className="icon-hover-bg cursor-pointer">
                          <IdfTooltip text="Play all">
                            <MaterialIcon
                              icon="play_circle"
                              clazz="font-size-2xl"
                            />
                          </IdfTooltip>
                        </a>
                      </div>
                    </div>
                  </Collapse>
                ))}
              </TransitionGroup>
              <div className="text-center mt-3 d-flex justify-content-center">
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
          )}
        </>
      )}
    </>
  );
};
