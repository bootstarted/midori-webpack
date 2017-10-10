# midori-webpack

If you're serving [webpack] assets or need to attach information about your webpack assets to your [midori] request handler then you can use `midori-webpack` to do just that. Usage is simple and also supports development mode using both [webpack-dev-server] and [webpack-udev-server].

## Usage

```sh
npm install --save midori-webpack
```

Simple example:

```javascript
import {compose, request, send, get} from 'midori';
import {withStats, serveStatic} from 'midori-webpack';

const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

const createApp = compose(
  // Attach `stats` to the `request` object. This can be a URL if you're using
  // `webpack-dev-server` since nothing is generated on the local filesystem.
  // If you're using `webpack-udev-server` then everything is handled for you
  // internally and you can just use the normal filename.
  withStats(
    isDev ? 'http://localhost:8080/js/stats.json' : './dist/stats.json'
  ),

  // Serve all your webpack assets with the correct `publicPath`. This assumes
  // all your generated assets live in the same folder as your `stats.json`.
  serve('./dist/stats.json'),

  // Dump the stats for fun.
  get('/stats', request((req) => {
    return send(JSON.stringify(req.stats));
  })),
);

const app = createApp();
app.listen(8888);
```

You can find a complete example including instructions on how to run it in various modes in the [demo] folder.

[webpack]: https://webpack.github.io/
[midori]: https://github.com/metalabdesign/midori
[webpack-dev-server]: https://github.com/webpack/webpack-dev-server
[webpack-udev-server]: https://github.com/metalabdesign/webpack-udev-server
