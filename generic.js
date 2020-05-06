'use strict';

module.exports = class GenericTransport {
  constructor({ debug } = {}) {
    this.options = {
      debug
    };
  }

  debug(...data) {
    if (this.options.debug) for (let item of data) console.log(item);
  }

  async _load(endpoint, { query } = {}) {
    this.debug(`Loading endpoint: "${endpoint}"`);
    try {
      const response = await this.client.get(endpoint, { ...(query && { query }) });
      return response;
    } catch (error) {
      this.debug(`Error loading endpoint: "${endpoint}"`, error);
      throw error;
    }
  }
};
