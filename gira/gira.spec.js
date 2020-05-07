'use strict';

const { log } = require('./../utilities');

const Gira = require('.');

const KEY = process.env.API_EMEL_KEY;

const client = new Gira({ key: KEY });

describe('Gira', () => {
  describe('API status', () => {
    it('should check API status', async () => {
      const status = await client.checkAPIStatus();
      // log(status);
      // expect(status).to.be.true;
    });
  });

  describe('Stations', () => {
    it('should list stations', async () => {
      const stations = await client.listStations();
      // log(stations);
    });

    it('should load station', async () => {
      const station = await client.loadStation('216');
      // log(station);
    });
  });
});
