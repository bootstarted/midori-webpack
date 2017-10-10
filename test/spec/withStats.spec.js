import {expect} from 'chai';
import http from 'http';
import webpack from 'webpack';
import {output} from 'webpack-partial';
import path from 'path';
import {connect, compose, status, send, request, get} from 'midori';
import fetch from 'node-fetch';
import Server from 'webpack-udev-server/lib/Server';

import _config from '../../demo/webpack.config.js';
import withStats from '../../src/withStats';
import readStatsFile from '../../src/internal/readStatsFile';

const config = output({
  publicPath: '/potato',
  path: path.join(__dirname, 'dist'),
}, _config);
const statsFile = path.join(config.output.path, 'stats.json');

describe('withStats', () => {
  let server;
  let url;
  let statsApp;

  const createApp = compose(
    get('/error', request(() => {
      throw new Error();
    })),
    get('/fakestats', request(() => {
      return send(JSON.stringify(readStatsFile(statsFile)));
    })),
    request(() => statsApp),
    request((req) => {
      return compose(
        status(200),
        send(JSON.stringify({assetsByChunkName: req.stats.assetsByChunkName}))
      );
    }),
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

  describe('local files', () => {
    it('should assign local `stats` file to the request', async () => {
      statsApp = withStats(statsFile);
      const result = await fetch(`${url}/`);
      const json = await result.json();
      expect(json).to.have.property('assetsByChunkName');
    });

    it('should fail when local file does not exist', async () => {
      statsApp = withStats('poop.json');
      const result = await fetch(`${url}/`);
      expect(result).to.have.property('ok', false);
    });
  });

  describe('remote urls', () => {
    it('should work with remote urls', async () => {
      statsApp = withStats(`${url}/fakestats`);
      const result = await fetch(`${url}/`);
      const json = await result.json();
      expect(json).to.have.property('assetsByChunkName');
    });

    it('should fail when remote URL fails', async () => {
      statsApp = withStats(`${url}/error`);
      const result = await fetch(`${url}/`);
      expect(result).to.have.property('ok', false);
    });
  });

  describe('udev-server', () => {
    let devServer;
    let devUrl;

    beforeEach((done) => {
      devServer = new Server([
        require.resolve('../../demo/webpack.config.js'),
      ]);
      devServer.listen((err) => {
        if (!err) {
          devUrl = `http://localhost:${devServer.address().port}`;
          process.env.IPC_URL = devUrl;
          global.__webpack_dev_token__ = 'foo'; // eslint-disable-line
        }
        done(err);
      });
    });

    afterEach((done) => {
      delete process.env.IPC_URL;
      delete global.__webpack_dev_token__;
      devServer.close(done);
    });

    it('should work with udev-server', async () => {
      statsApp = withStats(
        path.join(_config.output.path, 'stats.json'),
        {timeout: 4000}
      );
      const result = await fetch(`${url}/`);
      const json = await result.json();
      expect(json).to.have.property('assetsByChunkName');
    }).timeout(5000);
  });
});
