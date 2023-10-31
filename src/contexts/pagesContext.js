import { useState, createContext, useContext } from 'react';

// this is created for pages/views where we want to persist state of selection i.e., dropdown, like if any dropdown value is selected
// and user switch to other view and comes back then we want to persist the selection
// so, creating a abstract context to cater each view needs
// we will be saving it like: {name: 'Name of Page (dashboard/contacts etc), value: { this can save as json so that it has flexibility})}
// for usage check View.jsx file, and try using this page context wherever we want to persist state of some page/module.

export const PagesContext = createContext({
  pageContext: {},
  setPageContext: () => null,
});

export const PagesContextProvider = (props) => {
  const [pageContext, setPageContext] = useState({});

  return (
    <PagesContext.Provider value={{ pageContext, setPageContext }}>
      {props.children}
    </PagesContext.Provider>
  );
};

export const usePagesContext = () => {
  return useContext(PagesContext);
};
