'use strict';

const axios = require('axios');

const GenericTransport = require('./../generic');

const carrisParsers = require('./parsers');

const DEFAULT_API_VERSION = '2.7';

class Carris extends GenericTransport {
  constructor({ version = DEFAULT_API_VERSION, ...options } = {}) {
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

  // Alerts

  // Alert listing is not available in API version 2.7,
  // the current default version.
  // listAlerts = async () => (await this.load('/alerts')).map(carrisParsers._transformAlert);

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

  // Estimates

  // A positive status returns:
  // 'Testing SIP @net.tcp://10.1.140.102:12407/SIPService => connection successfully tested :)'
  checkEstimatesStatus = async () => (await this.load('/Estimations')).includes('success');

  listEstimates = async (stops, quantity = 99) => {
    if (stops instanceof Array) {
      // Maximum size of endpoint is 299 characters, as such, including too many stops will break things
      const concatenateStops = (ids, limit) =>
        ids.reduce((acc, id) => {
          const value = acc.length ? `${acc}-${id}` : id.toString();
          return value.length > limit ? acc : value;
        }, '');
      const list = concatenateStops(stops, 300 - 40);
      const estimates = (
        await this.load(`/Estimations/estimationbusstop/${list}/top/${quantity}`)
      ).map(carrisParsers._transformStopWithEstimate);
      return stops.map(id => estimates.find(estimate => estimate.id === id));
    } else {
      return (await this.load(`/Estimations/busStop/${stops}/top/${quantity}`)).map(
        carrisParsers._transformEstimate
      );
    }
  };

  // Geocoding

  geocode = async query =>
    (await this.load(`/Geocoding/${query}`)).map(carrisParsers._transformGeocodingResult);

  geocodeSuggest = async query =>
    (await this.load(`/Geocoding/suggest/${query}`)).map(
      carrisParsers._transformGeocodingSuggestion
    );

  reverseGeocode = async ({ latitude, longitude }) =>
    carrisParsers._transformGeocodingResult(
      await this.load(`/Geocoding/reverse/lat/${latitude}/lng/${longitude}`)
    );

  loadGeocodingLocation = async id =>
    carrisParsers._transformGeocodingResult(await this.load(`/Geocoding/fromId/${id}`));

  // Routes

  listRoutes = async ({ stop, after } = {}) => {
    let endpoint = '/Routes';
    if (stop) {
      endpoint += `/busStop/${stop}`;
    } else if (after && after instanceof Date) {
      endpoint += `/timestamp/${after.toISOString()}`;
    }
    return (await this.load(endpoint)).map(carrisParsers._transformRoute);
  };

  loadRoute = async id => {
    const item = await this.load(`/Routes/${id}`);
    // The API returns an empty string for some routes
    if (!item) return;
    return carrisParsers._transformRoute(item);
  };

  // Planning

  // 2020-05-06T20%3A00%3A00

  plan = async ({
    start: { latitude: startLatitude, longitude: startLongitude },
    end: { latitude: endLatitude, longitude: endLongitude },
    date,
    language
  }) =>
    await this.load(
      `/Planner/startlat/${startLatitude}/startlon/${startLongitude}/endLat/${endLatitude}/endLon/${endLongitude}/start/${date.toISOString()}/language/${language}`
    );

  // Timetables

  loadTimetable = async ({ route, direction, stop, date }) =>
    carrisParsers._transformTimetable(
      await this.load(
        `/StopTimes/routeNumber/${route}/direction/${direction}/stop/${stop}/date/${
          date.toISOString().split('T')[0]
        }`
      )
    );

  // Vehicles

  loadVehicle = async id =>
    carrisParsers._transformVehicle({
      id,
      ...(await this.load(`/SGO/busNumber/${id}`))
    });

  listVehicles = async ({ route } = {}) => {
    let endpoint = '/vehicleStatuses';
    if (route) endpoint += `/routeNumber/${route}`;
    return (await this.load(endpoint)).map(carrisParsers._transformVehicle);
  };
}

module.exports = Carris;
