# demo

Run the demo using normal `webpack-dev-server`:

```sh
./node_modules/.bin/webpack-dev-server --config ./demo/webpack.config.js
node ./demo/server.js
```

Run the demo in universal mode using `webpack-udev-server`:

```sh
./node_modules/.bin/webpack-udev-server \
  --config ./demo/webpack.config.js \
  --config ./demo/server.webpack.config.js
```

Run the demo in "production" mode:

```sh
./node_modules/.bin/webpack -p --config ./demo/webpack.config.js
node ./demo/server.js
```

Run the demo in universal "production" mode:

```sh
./node_modules/.bin/webpack -p --config ./demo/webpack.config.js
./node_modules/.bin/webpack -p --config ./demo/server.webpack.config.js
node ./demo/dist/server.js
```
