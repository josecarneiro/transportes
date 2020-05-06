'use strict';

const log = data => console.log(require('util').inspect(data, false, 15, true));

const write = (path, data) => require('fs').writeFileSync(path, JSON.stringify(data, null, 2));

exports.log = log;
exports.write = write;
