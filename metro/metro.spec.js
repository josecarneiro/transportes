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
    it('should check API status', async () => {
      const status = await client.checkAPIStatus();
      // log(status);
    });
  });

  describe('line status', () => {
    it('should check line status', async () => {
      const status = await client.checkLineStatus();
      // log(status);
    });
  });

  describe('stations', () => {
    it('should list stations', async () => {
      const stations = await client.listStations();
      // log(stations);
    });

    it('should load station', async () => {
      const station = await client.loadStation('CU');
      // log(station);
    });
  });

  describe('estimates', () => {
    it('should load all estimates', async () => {
      const times = await client.loadEstimates();
      // log(times);
      // write('wait-times.json', times);
    });

    it('should load station estimates', async () => {
      const times = await client.loadStationEstimates('CU');
      // log(times);
      // write('wait-times.json', times);
    });
  });
});
