// @flow
import {request, assign} from 'midori';
import fetch from 'node-fetch';
import readStatsFile from './internal/readStatsFile';

import type {AppCreator} from 'midori/types';
type Handler = (stats: Object) => AppCreator;
type Options = {
  handler: Handler,
  dynamic: boolean,
};

const isUrl = (s) => /:\/\/.+/.test(s);

// TODO: Should be replaced with `import()` eventually.
const getWatchImport = () => {
  return new Promise((resolve) => {
    resolve(require('webpack-udev-server/watch').default);
  });
};

const getDevServer = (file, handler, options) => {
  const watchImport = getWatchImport();
  const result = watchImport.then((createWatcher) => {
    const watcher = createWatcher(file);
    return Promise.resolve(watcher);
  });
  return () => result.then((watcher) => watcher.poll(options).then(handler));
};

const getUrl = (url, handler, _options) => {
  return () => fetch(url).then((res) => {
    if (res.ok) {
      return res.json().then(handler);
    }
    return Promise.reject(new Error(`Could not get stats from ${url}`));
  });
};

const getFile = (file, handler, options) => {
  if (typeof global.__webpack_dev_token__ !== 'undefined') {
    return getDevServer(file, handler, options);
  }
  return () => handler(readStatsFile(file));
};

const get = (x, y, options) => {
  if (isUrl(x)) {
    return getUrl(x, y, options);
  }
  return getFile(x, y, options);
};

/**
 * Alter the request based on a webpack stats file. This function allows you
 * to take arbtirary actions based on recieving a webpack stats object, but
 * typically users just assign the stats object to the request and then make
 * use of it later in their application. This function also detects the use of
 * `webpack-udev-server` and invokes its internal watcher when necessary.
 * @param {String} file URL or local path to a webpack stats file.
 * @param {Object} options Additional configuration options.
 * @param {Function} options.handler Invoked when stats are collected to
 * determine the next app to return. By default it just assigns the stats
 * object to the request, though you can do whatever you want with it.
 * @param {Boolean} options.dynamic True to re-fetch stats every request.
 * This defaults to true in development mode since stats change regularly.
 * @returns {Function} Midori app creator.
 */
const withStats = (file: string, {
  handler = (stats) => assign({stats}),
  dynamic = process.env.NODE_ENV !== 'production',
  ...options
}: Options = {}): AppCreator => {
  const getNext = get(file, handler, options);
  if (!dynamic) {
    const result = getNext();
    return request(() => result);
  }
  return request(getNext);
};

export default withStats;
