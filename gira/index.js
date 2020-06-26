'use strict';

const axios = require('axios');

const GenericTransport = require('./../generic');

const giraParsers = require('./parsers');

class Gira extends GenericTransport {
  constructor({ key, ...options } = {}) {
    super(options);
    this.client = axios.create({
      baseURL: `https://emel.city-platform.com/opendata/`,
      headers: {
        api_key: key
      }
    });
  }

  async load(endpoint, { query } = {}) {
    const { data } = await this._load(endpoint, { query });
    return data;
  }

  // API Status

  async checkAPIStatus() {
    try {
      const { status } = await this._load('/gira/station/list');
      return status >= 200 && status < 400;
    } catch (error) {
      return false;
    }
  }

  // Line Status

  async listStations() {
    const rawStations = (await this.load('/gira/station/list')).features;
    return rawStations.map(giraParsers._transformStationItem).filter(({ ratio }) => ratio <= 1);
  }

  async loadStation(id) {
    const rawStation = await this.load(`/gira/station/${id}`);
    return giraParsers._transformStationSingle(rawStation);
  }
}

module.exports = Gira;
