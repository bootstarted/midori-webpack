'use strict'; // For node@4.

class StatsPlugin {
  constructor(output, options) {
    this.output = output;
    this.options = options;
  }

  apply(compiler) {
    const output = this.output;
    const options = this.options;
    compiler.plugin('emit', (compilation, done) => {
      let result;
      compilation.assets[output] = {
        size: () => {
          return result && result.length || 0;
        },
        source: () => {
          const stats = compilation.getStats().toJson(options);
          result = JSON.stringify(stats);
          return result;
        },
      };
      done();
    });
  }
}

module.exports = StatsPlugin;
