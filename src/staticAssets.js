// @flow
import {dirname} from 'path';
import {match, serve} from 'midori';
import {path} from 'midori/match';
import readStatsFile from './internal/readStatsFile';

import type {AppCreator} from 'midori/types';
type Options = {root: string};

/**
 * Serve webpack assets from your local filesystem. This is normally not used
 * in development since the dev server is responsible for serving assets. In
 * production if you use some kind of blob storage (e.g. S3) this is also not
 * necessary since you'll just be fetching data from there instead. In the
 * case you do use this your `publicPath` should be a local one and that is
 * checked for here.
 * @param {String} file Path to local stats file.
 * @param {Object} options Additional options. These options are exactly the
 * same as the ones taken by midori's `serve` which is an extension of this
 * library: https://www.npmjs.com/package/send.
 * @returns {Function} Midori app creator.
 */
const staticAssets = (
  file: string,
  options: Options = {root: dirname(file)}
): AppCreator => {
  const {publicPath} = readStatsFile(file);
  if (publicPath.charAt(0) !== '/') {
    throw new TypeError('Given `publicPath` is not a local URL.');
  }
  return match(path(publicPath), serve(options));
};

export default staticAssets;
