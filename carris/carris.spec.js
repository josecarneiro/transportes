const Carris = require('.');

const client = new Carris();

const { log } = require('./../metro/utilities');

describe('Metro', () => {
  describe('Stops', () => {
    it('should list all bus stops', async () => {
      const stops = await client.listBusStops();
      // log(stops);
    }).timeout(5000);

    it('should list nearest bus stops', async () => {
      const stops = await client.listNearestBusStops(38, -9);
      // log(stops);
    }).timeout(5000);
  });

  describe('Vehicles', () => {
    it('should list all vehicles', async () => {
      const vehicles = await client.listVehicles();
      // log(vehicles);
      // console.log(vehicles.filter(({ state }) => state !== 'InVoyage'));
      // const sorted = vehicles
      //   .filter(({ lastGpsTime, lastReportTime }) => lastGpsTime !== lastReportTime)
      //   .sort(({ lastGpsTime: a }, { lastGpsTime: b }) => b - a);
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
  });
});
