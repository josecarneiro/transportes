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

  load = async (endpoint, { query } = {}) => {
    const { data } = await this._load(endpoint, { query });
    return data;
  };

  // API Status

  checkAPIStatus = async () => {
    try {
      const { status } = await this._load('/gira/station/list');
      return status >= 200 && status < 400;
    } catch (error) {
      return false;
    }
  };

  // Line Status

  listStations = async () =>
    (await this.load('/gira/station/list')).features
      .map(giraParsers._transformStationItem)
      .filter(({ ratio }) => ratio <= 1);

  loadStation = async id =>
    giraParsers._transformStationSingle(await this.load(`/gira/station/${id}`));
}

module.exports = Gira;
