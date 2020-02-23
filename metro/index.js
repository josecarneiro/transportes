const axios = require('axios');

const GenericTransport = require('./../generic');

const CURRENT_API_VERSION = '1.0.1';

const parseDate = string =>
  new Date(
    string.slice(0, 4),
    Number(string.slice(4, 6)) - 1,
    string.slice(6, 8),
    string.slice(8, 10),
    string.slice(10, 12),
    string.slice(12, 14)
  );

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
      const response = await this.client.get('/estadoLinha/todos');
      return response.status >= 200 && response.status < 400;
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
    ].map(([id, message]) => ({
      line: id,
      status: result[id] === ' Ok',
      message: result[message] !== '0' ? result[message] : null
    }));
  };

  // Stations

  _transformStation = ({
    stop_id: id, // 'AP',
    stop_name: name, // 'Aeroporto',
    stop_lat: latitude, // '38.7686',
    stop_lon: longitude, // '-9.12833',
    // stop_url: stop_url, // '[https://www.metrolisboa.pt/viajar/aeroporto/]',
    linha: line, // '[Vermelha]',
    zone_id: zone // 'L'
  }) => ({
    id,
    name,
    latitude: Number(latitude),
    longitude: Number(longitude),
    lines: line
      .toLowerCase()
      .replace(/\[|\]/g, '')
      .split(', '),
    zone
  });

  listStations = async () => (await this.load('/infoEstacao/todos')).map(this._transformStation);

  loadStation = async id =>
    (await this.load(`/infoEstacao/${id}`)).map(this._transformStation).find(() => true);

  // Wait Times

  _transformEstimates = ({
    stop_id: station, //  'CA'
    cais: pier, //  'PT4CAO'
    hora: time, //  '20200215185211'
    comboio: train1, //  '7A'
    tempoChegada1: time1, //  '402'
    comboio2: train2, //  '8A'
    tempoChegada2: time2, //  '782'
    comboio3: train3, //  '1A'
    tempoChegada3: time3, //  '1296'
    destino: destiny, //  '33'
    sairServico: exit, //  '0'
    UT: UT //  '2'
  }) => ({
    station,
    pier,
    time: parseDate(time),
    destiny,
    exit,
    UT,
    arrivals: [
      {
        train: train1,
        time: new Date(Number(parseDate(time)) + Number(time1) * 1000)
      },
      {
        train: train2,
        time: new Date(Number(parseDate(time)) + Number(time2) * 1000)
      },
      {
        train: train3,
        time: new Date(Number(parseDate(time)) + Number(time3) * 1000)
      }
    ]
  });

  loadEstimates = async () =>
    (await this.load('/tempoEspera/Estacao/todos')).map(this._transformEstimates);

  loadStationEstimates = async station =>
    (await this.load(`/tempoEspera/Estacao/${station}`)).map(this._transformEstimates);
};
