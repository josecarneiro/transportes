const axios = require('axios');

const GenericTransport = require('./../generic');

const carrisParsers = require('./parsers');

const CURRENT_API_VERSION = '2.7';

class Carris extends GenericTransport {
  constructor({ version = CURRENT_API_VERSION, ...options } = {}) {
    super(options);
    this.client = axios.create({
      baseURL: `https://carris.tecmic.com/api/v${version}`
    });
  }

  load = async (endpoint, { query } = {}) => {
    const response = await this._load(endpoint, { query });
    return response.data;
  };

  // Check API Status

  checkAPIStatus = async () => {
    try {
      const { status } = await this._load('/busstops');
      return status >= 200 && status < 400;
    } catch (error) {
      return false;
    }
  };

  // Bus Stops

  listStops = async ({ latitude, longitude, after, route } = {}) => {
    let endpoint;
    if (after && after instanceof Date) {
      endpoint = `/busstops/timestamp/${after.toISOString()}`;
    } else if ([latitude, longitude].every(value => typeof value === 'number')) {
      endpoint = `/busstops/near/lat/${latitude}/lon/${longitude}`;
    } else {
      endpoint = '/busstops';
    }
    return (await this.load(endpoint)).map(carrisParsers._transformStop);
  };

  // Estimations

  // A positive status returns:
  // 'Testing SIP @net.tcp://10.1.140.102:12407/SIPService => connection successfully tested :)'
  checkEstimationsStatus = async () => (await this.load('/Estimations')).includes('success');

  listEstimations = async (stops, quantity = 99) => {
    if (stops instanceof Array) {
      // Maximum size of endpoint is 299 characters, as such, including too many stops will break things
      const concatenateStops = (ids, limit) =>
        ids.reduce((acc, id) => {
          const value = acc.length ? `${acc}-${id}` : id.toString();
          return value.length > limit ? acc : value;
        }, '');
      const list = concatenateStops(stops, 300 - 40);
      const estimations = (
        await this.load(`/Estimations/estimationbusstop/${list}/top/${quantity}`)
      ).map(carrisParsers._transformStopWithEstimation);
      return stops.map(id => estimations.find(estimation => estimation.id === id));
    } else {
      return (await this.load(`/Estimations/busStop/${stops}/top/${quantity}`)).map(
        carrisParsers._transformEstimation
      );
    }
  };

  // Routes

  listRoutes = async ({ stop, after } = {}) => {
    let endpoint;
    if (stop) {
      endpoint = `/Routes/busStop/${stop}`;
    } else if (after && after instanceof Date) {
      endpoint = `/Routes/timestamp/${after.toISOString()}`;
    } else {
      endpoint = `/Routes`;
    }
    return (await this.load(endpoint)).map(carrisParsers._transformRoute);
  };

  listRoutesAtBusStop = async id =>
    (await this.load(`/Routes/busStop/${id}`)).map(carrisParsers._transformRoute);

  // Vehicles

  loadVehicle = async id => {
    return carrisParsers._transformVehicle({
      id,
      ...(await this.load(`/SGO/busNumber/${id}`))
    });
  };

  listVehicles = async () =>
    (await this.load('/vehicleStatuses')).map(carrisParsers._transformVehicle);
}

module.exports = Carris;
