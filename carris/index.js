const axios = require('axios');

const GenericTransport = require('./../generic');

const CURRENT_API_VERSION = '2.7';

module.exports = class Carris extends GenericTransport {
  constructor({ version = CURRENT_API_VERSION, ...options } = {}) {
    super(options);
    this.client = axios.create({
      baseURL: `https://carris.tecmic.com/api/v${version}`
    });
  }

  async load(endpoint, { query } = {}) {
    this.debug(`Loading endpoint ${endpoint}`);
    const response = await this.client.get(endpoint, { ...(query && { query }) });
    return response.data;
  }

  // Bus Stops

  _transformStop = ({
    id,
    name,
    publicId,
    lat: latitude,
    lng: longitude,
    isPublicVisible: visible,
    timestamp
  }) => ({
    id,
    publicId,
    name,
    position: {
      latitude,
      longitude
    },
    visible,
    creationDate: new Date(timestamp)
  });

  listStops = async ({ latitude, longitude } = {}) => {
    let endpoint = [latitude, longitude].every(value => typeof value === 'number')
      ? `/busstops/near/lat/${latitude}/lon/${longitude}`
      : '/busstops';
    return (await this.load(endpoint)).map(this._transformStop);
  };

  // Estimations

  // A positive status returns:
  // 'Testing SIP @net.tcp://10.1.140.102:12407/SIPService => connection successfully tested :)'
  checkEstimationsStatus = async () => (await this.load('/Estimations')).includes('success');

  _transformStopWithEstimation = ({ estimationList, ...busStop }) => ({
    ...this._transformStop(busStop),
    estimations: estimationList.map(this._transformEstimation)
  });

  _transformVehicleBase = ({ busNumber: id, publicId: stop, plateNumber: plate, ...vehicle }) => ({
    id,
    plate,
    stop,
    ...vehicle
  });

  _transformEstimation = ({ voyageNumber: voyage, routeNumber: route, time, ...vehicle }) => ({
    ...this._transformVehicleBase(vehicle),
    route,
    voyage,
    time: new Date(time)
  });

  listEstimations = async (stops, quantity = 100) => {
    if (stops instanceof Array) {
      return (
        await this.load(`/Estimations/estimationbusstop/${stops.join('-')}/top/${quantity}`)
      ).map(this._transformStopWithEstimation);
    } else {
      return (await this.load(`/Estimations/busStop/${stops}/top/${quantity}`)).map(
        this._transformEstimation
      );
    }
  };

  // Routes

  _transformRoute = ({
    id,
    routeNumber: number,
    name,
    isPublicVisible: visible,
    timestamp: creationDate,
    ...route
  }) => ({
    id,
    number,
    name,
    visible,
    creationDate: new Date(creationDate),
    ...route
  });

  listRoutes = async () => (await this.load(`/routes`)).map(this._transformRoute);

  listRoutesAtBusStop = async id =>
    (await this.load(`/Routes/busStop/${id}`)).map(this._transformRoute);

  // Vehicles

  _transformVehicle = ({
    routeNumber: route,
    lastGpsTime,
    lastReportTime,
    timeStamp,
    dataServico,
    lat: latitude,
    lng: longitude,
    state,
    ...vehicle
  }) => ({
    ...this._transformVehicleBase(vehicle),
    route,
    active: state === 'InVoyage',
    position: {
      latitude,
      longitude
    },
    ...((lastGpsTime || lastReportTime || dataServico || timeStamp) && {
      time: {
        ...(lastGpsTime && { lastGps: new Date(lastGpsTime) }),
        ...(lastReportTime && { lastReport: new Date(lastReportTime) }),
        ...(dataServico && { serviceStart: new Date(dataServico) }),
        ...(timeStamp && { current: new Date(timeStamp) })
      }
    })
  });

  loadVehicle = async id => {
    const value = await this.load(`/SGO/busNumber/${id}`);
    console.log(value);
    return this._transformVehicle({ id, ...value });
  };

  listVehicles = async () => (await this.load('/vehicleStatuses')).map(this._transformVehicle);
};
