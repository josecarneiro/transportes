'use strict';

const Carris = require('.');

const client = new Carris({
  // debug: true
});

const { log } = require('./../utilities');

describe('Carris', () => {
  describe('Stops', () => {
    it('should list all bus stops', async () => {
      const stops = await client.listStops();
      // log(stops);
    }).timeout(5000);

    it('should list nearest bus stops', async () => {
      const stops = await client.listStops({ latitude: 38, longitude: -9 });
      // log(stops);
    }).timeout(5000);
  });

  describe('Routes', () => {
    it('should list all routes', async () => {
      const routes = await client.listRoutes();
      // log(routes);
    }).timeout(5000);

    it('should list routes that pass at a specific stop', async () => {
      const routes = await client.listRoutes({ stop: '13620' });
      // log(routes);
    }).timeout(5000);

    it('should list routes changed after a specific point in time', async () => {
      const routes = await client.listRoutes({ after: new Date(2019, 5, 10) });
      // log(routes);
    }).timeout(5000);

    it('should list nearest bus stops', async () => {
      const stops = await client.listStops({ latitude: 38.7539422, longitude: -9.1698717 });
      // log(stops);
    }).timeout(5000);
  });

  describe('Vehicles', () => {
    it('should list all vehicles', async () => {
      const vehicles = await client.listVehicles();
      // log(vehicles);
    }).timeout(5000);

    it('should load single vehicle', async () => {
      const vehicle = await client.loadVehicle(1711);
      // log(vehicle);
    }).timeout(5000);
  });

  describe('Estimations', () => {
    it('should check estimation status', async () => {
      const status = await client.checkEstimationsStatus();
      // log(status);
    }).timeout(5000);

    it('should load stop estimation', async () => {
      const estimations = await client.listEstimations(13620, 100);
      // log(estimations);
    }).timeout(5000);

    it('should load multiple stop estimations', async () => {
      const estimations = await client.listEstimations([13620, 13621], 100);
      // log(estimations);
    }).timeout(5000);

    it('should estimations for high volume of stops', async () => {
      const COUNT = 20;
      const stops = await client.listStops();
      const ids = stops.map(({ id }) => id);
      ids.sort(() => 0.5 - Math.random());
      const estimations = await client.listEstimations(ids.slice(0, COUNT), 100);
      // log(estimations);
    }).timeout(10000);
  });
});
