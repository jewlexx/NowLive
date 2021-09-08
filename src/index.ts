import { createElement, render } from 'preact';
import App from './pages/app';

// TODO Add support for multiple pages of live streams

if (process.env.PRODUCTION === 'false') {
  import('./lib/chromeapi').then(({ getChannelInfo }) => getChannelInfo());
}

render(createElement(App, null), document.body);