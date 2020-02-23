module.exports = class GenericTransport {
  constructor({ debug } = {}) {
    this.options = {
      debug
    };
  }

  debug(...data) {
    if (this.options.debug) for (let item of data) console.log(item);
  }
};
