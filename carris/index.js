const axios = require('axios');

const CURRENT_API_VERSION = '2.7';

module.exports = class Carris {
  constructor({ version = CURRENT_API_VERSION } = {}) {
    this.client = axios.create({
      baseURL: `https://carris.tecmic.com/api/v${version}`
    });
  }

  async load(endpoint, { query } = {}) {
    const response = await this.client.get(endpoint, { ...(query && { query }) });
    return response.data;
  }

  // Bus Stops

  listBusStops = () => this.load('/busstops');

  listNearestBusStops = (latitude, longitude) =>
    this.load(`/busstops/near/lat/${latitude}/lon/${longitude}`);

  // Estimations

  // A positive status returns:
  // 'Testing SIP @net.tcp://10.1.140.102:12407/SIPService => connection successfully tested :)'
  checkEstimationsStatus = async () => (await this.load('/Estimations')).includes('success');

  _transformEstimation = ({ time, ...estimation }) => ({ time: new Date(time), ...estimation });

  listEstimations = async (stop, quantity) =>
    (await this.load(`/Estimations/busStop/${stop}/top/${quantity}`)).map(
      this._transformEstimation
    );

  // Routes

  listRoutes = () => this.load(`/routes`);

  listRoutesAtBusStop = id => this.load(`/Routes/busStop/${id}`);

  // Vehicles

  _transformVehicle = ({
    busNumber: id,
    routeNumber: route,
    lastGpsTime,
    lastReportTime,
    timeStamp,
    dataServico,
    lat: latitude,
    lng: longitude,
    state,
    plateNumber: plate,
    ...vehicle
  }) => ({
    id,
    route,
    active: state === 'InVoyage',
    plate,
    position: {
      latitude,
      longitude
    },
    lastGpsTime: new Date(lastGpsTime),
    lastReportTime: new Date(lastReportTime),
    timeStamp: new Date(timeStamp),
    serviceTime: new Date(dataServico),
    ...vehicle
  });

  listVehicles = async () => (await this.load('/vehicleStatuses')).map(this._transformVehicle);
};
