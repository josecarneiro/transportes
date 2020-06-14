'use strict';

const { log, write } = require('../utilities');

const Metro = require('.');

const KEY = process.env.API_METRO_KEY;

const client = new Metro({
  key: KEY,
  allowInsecureRequests: true
  // debug: true
});

describe('Metro', () => {
  beforeAll(async () => {
    const status = await client.checkAPIStatus();
    if (!status) throw new Error('Metro API status is down');
  });

  describe('API status', () => {
    test('should check API status', async () => {
      const status = await client.checkAPIStatus();
      expect(typeof status === 'boolean').toEqual(true);
      expect(status).toEqual(true);
    });
  });

  describe('Line Status', () => {
    test('should check line status', async () => {
      const statuses = await client.checkLineStatus();
      // log(statuses);
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

    test('should throw error if station id is invalid', async () => {
      try {
        await client.loadStation('HELLO');
      } catch (error) {
        expect(error instanceof Error).toEqual(true);
      }
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
    }, 10000);

    // test('should load station', async () => {
    //   const station = await client.loadStation('CU');
    //   // log(station);
    // });
  });

  describe('Estimates', () => {
    test('should load all estimates', async () => {
      const times = await client.listEstimates();
      // log(times);
    });

    test('should load station estimates', async () => {
      const times = await client.listEstimates({ station: 'CU' });
      // log(times);
    });

    test('should load line estimates', async () => {
      const times = await client.listEstimates({ line: 'Amarela' });
      // log(times);
    });
  });

  describe('Intervals', () => {
    test('should load intervals for specific line', async () => {
      const intervals = await client.listIntervals('Amarela');
      // log(intervals);
    });

    test('should load intervals for weekend', async () => {
      const intervals = await client.listIntervals('Amarela', { weekday: false });
      // log(intervals);
    });

    test('should load intervals for weekend', async () => {
      const intervals = await client.listIntervals('Amarela', { weekday: false });
      // log(intervals);
    });
  });
});
