import {expect} from 'chai';
import http from 'http';
import webpack from 'webpack';
import {output} from 'webpack-partial';
import path from 'path';
import {connect, compose, status, send, request} from 'midori';
import fetch from 'node-fetch';

import _config from '../../demo/webpack.config.js';
import staticAssets from '../../src/staticAssets';

const config = output({
  publicPath: '/potato',
  path: path.join(__dirname, 'dist'),
}, _config);
const statsFile = path.join(config.output.path, 'stats.json');

describe('staticAssets', () => {
  let server;
  let url;
  const createApp = compose(
    request(() => staticAssets(statsFile)),
    status(418),
    send(''),
  );
  const app = createApp();

  beforeEach((done) => {
    webpack(config, (err, _stats) => {
      done(err);
    });
  });
  beforeEach((done) => {
    server = connect(app, http.createServer());
    server.listen((err) => {
      if (!err) {
        url = `http://localhost:${server.address().port}`;
      }
      done(err);
    });
  });
  afterEach((done) => {
    server.close(done);
  });

  it('should serve assets at the `publicPath`', async () => {
    const result = await fetch(`${url}/potato/main.js`);
    expect(result).to.have.property('status', 200);
  });

  it('should fail assets not found', async () => {
    const result = await fetch(`${url}/potato/foo.js`);
    expect(result).to.have.property('status', 404);
  });

  it('should not mangle things outside of `publicPath`', async () => {
    const result = await fetch(`${url}/`);
    expect(result).to.have.property('status', 418);
  });
});
