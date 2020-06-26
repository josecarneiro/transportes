'use strict';

const axios = require('axios');

const GenericTransport = require('./../generic');

const metroParsers = require('./parsers');

const CURRENT_API_VERSION = '1.0.1';

class Metro extends GenericTransport {
  constructor({
    version = CURRENT_API_VERSION,
    key,
    allowInsecureRequests = false,
    ...options
  } = {}) {
    super(options);
    this.client = axios.create({
      baseURL: `https://api.metrolisboa.pt:8243/estadoServicoML/${version}`,
      headers: {
        Authorization: `Bearer ${key}`
      },
      ...(allowInsecureRequests && {
        httpsAgent: new (require('https').Agent)({
          rejectUnauthorized: false
        })
      })
    });
  }

  async load(endpoint, { query } = {}) {
    const response = await this._load(endpoint, { query });
    const { resposta: result, codigo: code } = response.data;
    if (code && Number(code) >= 400) {
      if (typeof result === 'string') {
        throw new Error(result);
      } else {
        throw new Error();
      }
    }
    return result;
  }

  // API Status

  async checkAPIStatus() {
    try {
      const { status } = await this._load('/estadoLinha/todos');
      return status >= 200 && status < 400;
    } catch (error) {
      return false;
    }
  }

  // Line Status

  async checkLineStatus() {
    const result = await this.load('/estadoLinha/todos');
    return [
      ['amarela', 'tipo_msg_am'],
      ['vermelha', 'tipo_msg_vm'],
      ['verde', 'tipo_msg_vd'],
      ['azul', 'tipo_msg_az']
    ].map(([line, message]) => ({
      line,
      active: result[line] === ' Ok',
      ...(result[message] !== '0' && { message: result[message] })
    }));
  }

  // Stations

  async listStations() {
    const rawStations = await this.load('/infoEstacao/todos');
    return rawStations.map(metroParsers._transformStation);
  }

  async loadStation(id) {
    const result = await this.load(`/infoEstacao/${id}`);
    if (result instanceof Array && result.length) {
      return metroParsers._transformStation(result[0]);
    } else {
      return null;
    }
  }

  // Wait Times

  async listEstimates({ line, station } = {}) {
    let endpoint = '/tempoEspera';
    if (line) {
      endpoint += `/Linha/${line}`;
    } else if (station) {
      endpoint += `/Estacao/${station}`;
    } else {
      endpoint += '/Estacao/todos';
    }
    const rawEstimates = await this.load(endpoint);
    return rawEstimates.map(metroParsers._transformEstimates);
  }

  // Destinations

  async listDestinations() {
    const rawDestinations = await this.load('/infoDestinos/todos');
    return rawDestinations.map(metroParsers._transformDestination);
  }

  // Intervals

  async listIntervals(line, { weekday = true } = {}) {
    const rawEstimates = await this.load(`/infoIntervalos/${line}/${weekday ? 'S' : 'F'}`);
    return rawEstimates.map(metroParsers._transformInterval);
  }
}

module.exports = Metro;
