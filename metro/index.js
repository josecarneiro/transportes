'use strict';

const axios = require('axios');

const GenericTransport = require('./../generic');

const metroParsers = require('./parsers');

const CURRENT_API_VERSION = '1.0.1';

module.exports = class Metro extends GenericTransport {
  constructor({ version = CURRENT_API_VERSION, key, ...options } = {}) {
    super(options);
    this.client = axios.create({
      baseURL: `https://api.metrolisboa.pt:8243/estadoServicoML/${version}`,
      headers: {
        Authorization: `Bearer ${key}`
      }
    });
  }

  async load(endpoint, { query } = {}) {
    const response = await this._load(endpoint, { query });
    return response.data.resposta;
  }

  // API Status

  checkAPIStatus = async () => {
    try {
      const { status } = await this._load('/estadoLinha/todos');
      return status >= 200 && status < 400;
    } catch (error) {
      return false;
    }
  };

  // Line Status

  checkLineStatus = async () => {
    const result = await this.load('/estadoLinha/todos');
    return [
      ['amarela', 'tipo_msg_am'],
      ['vermelha', 'tipo_msg_vm'],
      ['verde', 'tipo_msg_vd'],
      ['azul', 'tipo_msg_az']
    ].map(([line, message]) => ({
      line,
      status: result[line] === ' Ok',
      message: result[message] !== '0' ? result[message] : null
    }));
  };

  // Stations

  listStations = async () =>
    (await this.load('/infoEstacao/todos')).map(metroParsers._transformStation);

  loadStation = async id =>
    (await this.load(`/infoEstacao/${id}`)).map(metroParsers._transformStation);

  // Destinations

  listDestinations = async () =>
    (await this.load('/infoDestinos/todos')).map(metroParsers._transformDestination);

  // Wait Times

  loadEstimates = async () =>
    (await this.load('/tempoEspera/Estacao/todos')).map(metroParsers._transformEstimates);

  loadStationEstimates = async station =>
    (await this.load(`/tempoEspera/Estacao/${station}`)).map(metroParsers._transformEstimates);
};
