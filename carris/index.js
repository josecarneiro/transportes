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

  async load(endpoint, { query } = {}) {
    const response = await this._load(endpoint, { query });
    return response.data;
  }

  // Check API Status

  async checkAPIStatus() {
    try {
      const { status } = await this._load('/busstops');
      return status >= 200 && status < 400;
    } catch (error) {
      return false;
    }
  }

  // Alerts

  // Alert listing is not available in API version 2.7,
  // the current default version.
  // listAlerts = async () => (await this.load('/alerts')).map(carrisParsers._transformAlert);

  // Bus Stops

  async listStops({ latitude, longitude, after, route } = {}) {
    let endpoint;
    if (after && after instanceof Date) {
      endpoint = `/busstops/timestamp/${after.toISOString()}`;
    } else if ([latitude, longitude].every(value => typeof value === 'number')) {
      endpoint = `/busstops/near/lat/${latitude}/lon/${longitude}`;
    } else {
      endpoint = '/busstops';
    }
    const rawStops = await this.load(endpoint);
    return rawStops.map(carrisParsers._transformStop);
  }

  // Estimates

  // A positive status returns:
  // 'Testing SIP @net.tcp://10.1.140.102:12407/SIPService => connection successfully tested :)'
  async checkEstimatesStatus() {
    const result = await this.load('/Estimations');
    return result.includes('success');
  }

  async listEstimates(stops, quantity = 99) {
    if (stops instanceof Array) {
      // Maximum size of endpoint is 299 characters, as such, including too many stops will break things
      const concatenateStops = (ids, limit) =>
        ids.reduce((acc, id) => {
          const value = acc.length ? `${acc}-${id}` : id.toString();
          return value.length > limit ? acc : value;
        }, '');
      const list = concatenateStops(stops, 300 - 40);
      const rawStopWithEstimate = await this.load(
        `/Estimations/estimationbusstop/${list}/top/${quantity}`
      );
      const estimates = rawStopWithEstimate.map(carrisParsers._transformStopWithEstimate);
      return stops.map(id => estimates.find(estimate => estimate.id === id));
    } else {
      const rawEstimates = await this.load(`/Estimations/busStop/${stops}/top/${quantity}`);
      return rawEstimates.map(carrisParsers._transformEstimate);
    }
  }

  // Geocoding

  async geocode(query) {
    const rawGeocodingResults = await this.load(`/Geocoding/${query}`);
    return rawGeocodingResults.map(carrisParsers._transformGeocodingResult);
  }

  async geocodeSuggest(query) {
    const rawGeocodingSuggestions = await this.load(`/Geocoding/suggest/${query}`);
    return rawGeocodingSuggestions.map(carrisParsers._transformGeocodingSuggestion);
  }

  async reverseGeocode({ latitude, longitude }) {
    const rawGeocodingResult = await this.load(
      `/Geocoding/reverse/lat/${latitude}/lng/${longitude}`
    );
    return carrisParsers._transformGeocodingResult(rawGeocodingResult);
  }

  async loadGeocodingLocation(id) {
    const rawGeocodingResult = await this.load(`/Geocoding/fromId/${id}`);
    return carrisParsers._transformGeocodingResult(rawGeocodingResult);
  }

  // Routes

  async listRoutes({ stop, after } = {}) {
    let endpoint = '/Routes';
    if (stop) {
      endpoint += `/busStop/${stop}`;
    } else if (after && after instanceof Date) {
      endpoint += `/timestamp/${after.toISOString()}`;
    }
    const rawRoutes = await this.load(endpoint);
    return rawRoutes.map(carrisParsers._transformRoute);
  }

  async loadRoute(id) {
    const item = await this.load(`/Routes/${id}`);
    // The API returns an empty string for some routes
    if (!item) return;
    return carrisParsers._transformRoute(item);
  }

  // Planning

  // 2020-05-06T20%3A00%3A00

  async plan({
    start: { latitude: startLatitude, longitude: startLongitude },
    end: { latitude: endLatitude, longitude: endLongitude },
    date,
    language
  }) {
    const rawPlan = await this.load(
      `/Planner/startlat/${startLatitude}/startlon/${startLongitude}/endLat/${endLatitude}/endLon/${endLongitude}/start/${date.toISOString()}/language/${language}`
    );
    return rawPlan;
  }

  // Timetables

  async loadTimetable({ route, direction, stop, date }) {
    const formatedDate = date.toISOString().split('T')[0];
    const rawTimetable = await this.load(
      `/StopTimes/routeNumber/${route}/direction/${direction}/stop/${stop}/date/${formatedDate}`
    );
    return carrisParsers._transformTimetable(rawTimetable);
  }

  // Vehicles

  async loadVehicle(id) {
    const rawVehicle = await this.load(`/SGO/busNumber/${id}`);
    return carrisParsers._transformVehicle({ id, ...rawVehicle });
  }

  async listVehicles({ route } = {}) {
    let endpoint = '/vehicleStatuses';
    if (route) endpoint += `/routeNumber/${route}`;
    const rawVehicles = await this.load(endpoint);
    return rawVehicles.map(carrisParsers._transformVehicle);
  }
}

module.exports = Carris;
