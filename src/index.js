import * as Sentry from '@sentry/react';
import React from 'react';
import TagManager from 'react-gtm-module';
import { createRoot } from 'react-dom/client';

import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './styles/markdown.css';

const { NODE_ENV, REACT_APP_GTM_KEY, REACT_APP_TRACING_SENTRY_DSN } =
  process.env;

const tagManagerArgs = {
  gtmId: REACT_APP_GTM_KEY,
};

if (REACT_APP_GTM_KEY) {
  TagManager.initialize(tagManagerArgs);
}

if (REACT_APP_TRACING_SENTRY_DSN) {
  Sentry.init({
    dsn: REACT_APP_TRACING_SENTRY_DSN,
    environment: NODE_ENV,
    tracesSampleRate: 1.0,
  });
}

// react 18 way to render app now
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
