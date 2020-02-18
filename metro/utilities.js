const log = data => console.log(require('util').inspect(data, false, 15, true));

const write = (file, data) =>
  require('fs').writeFileSync(__dirname + '/' + file, JSON.stringify(data, null, 2));

exports.log = log;
exports.write = write;
