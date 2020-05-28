'use strict';

const log = data => console.log(require('util').inspect(data, false, 15, true));

const write = (path, data, { pretty = false } = {}) =>
  require('fs').writeFileSync(path, JSON.stringify(data, null, pretty ? 2 : 0));

exports.log = log;
exports.write = write;
