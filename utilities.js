'use strict';

const log = data => console.log(require('util').inspect(data, false, 15, true));

exports.log = log;

const write = (path, data, { pretty = false } = {}) =>
  require('fs').writeFileSync(path, JSON.stringify(data, null, pretty ? 2 : 0));

exports.write = write;

const moment = require('moment-timezone');

const localeDateToDate = date => moment.tz(date, 'Europe/Lisbon').toDate();

exports.localeDateToDate = localeDateToDate;
