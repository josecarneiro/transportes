'use strict';

const { log, write } = require('../utilities');

const Metro = require('.');

const KEY = process.env.API_METRO_KEY;

const client = new Metro({
  key: KEY
  // debug: true
});

describe('Metro', () => {
  describe('API status', () => {
    test('should check API status', async () => {
      const status = await client.checkAPIStatus();
      // log(status);
    });
  });

  describe('line status', () => {
    test('should check line status', async () => {
      const status = await client.checkLineStatus();
      // log(status);
    });
  });

  describe('Stations', () => {
    test('should list stations', async () => {
      const stations = await client.listStations();
      // log(stations);
    });

    test('should load station', async () => {
      const station = await client.loadStation('CU');
      // log(station);
    });
  });

  describe('Destinations', () => {
    test('should list destinations', async () => {
      const destinations = await client.listDestinations();
      const stations = await client.listStations();

      const completed = destinations.map(({ id, name }) => ({
        destinationId: id,
        name,
        ...stations.find(station => station.name === name)
      }));
      // log(completed);
      // log(destinations);
      // log(stations);
    });

    // test('should load station', async () => {
    //   const station = await client.loadStation('CU');
    //   // log(station);
    // });
  });

  describe('Estimates', () => {
    test('should load all estimates', async () => {
      const times = await client.loadEstimates();
      // log(times);
    });

    test('should load station estimates', async () => {
      const times = await client.loadStationEstimates('CU');
      // log(times);
    });
  });
});
