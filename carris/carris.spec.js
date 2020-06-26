'use strict';

const Carris = require('.');

const client = new Carris({
  // debug: true
  // version: '2.9'
});

const { log, write } = require('./../utilities');

describe('Carris', () => {
  beforeAll(async () => {
    const status = await client.checkAPIStatus();
    if (!status) throw new Error('Carris API status is down');
  });

  describe('API status', () => {
    test('should check API status', async () => {
      const status = await client.checkAPIStatus();
      expect(typeof status).toBe('boolean');
      expect(status).toBe(true);
    });
  });

  // describe('Alerts', () => {
  //   test('should list alerts', async () => {
  //     const alerts = await client.listAlerts();
  //     expect(alerts).toBeInstanceOf(Array);
  //     // log(alerts);
  //     for (let alert of alerts) {
  //       expect(typeof alert).toBe('object');
  //       expect(typeof alert.id).toBe('number');
  //       expect(typeof alert.type).toBe('string');
  //       expect(typeof alert.route === 'string' || alert.route === null).toBeTruthy();
  //       expect(typeof alert.stop === 'string' || alert.stop === null).toBeTruthy();
  //       expect(alert.published instanceof Date || alert.published === null).toBeTruthy();
  //       expect(alert.expires instanceof Date || alert.expires === null).toBeTruthy();
  //     }
  //   });
  // });

  describe('Stops', () => {
    test('should list all stops', async () => {
      const stops = await client.listStops();
      // log(stops);
    });

    test('should list all stops that suffered changes after a certain date', async () => {
      const allStops = await client.listStops();
      const date = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365);
      const stopsChangedRecently = await client.listStops({
        after: date
      });
      // log(allStops);
      // Compare total of stops with amount changed since last year
      // log([allStops.length, stopsChangedRecently.length]);
    }, 10000);

    test('should list nearest stops', async () => {
      const stops = await client.listStops({ latitude: 38, longitude: -9 });
      // log(stops);
    });
  });

  describe('Estimates', () => {
    test('should check estimate status', async () => {
      const status = await client.checkEstimatesStatus();
      // log(status);
    });

    test('should load stop estimate', async () => {
      const estimates = await client.listEstimates(13620, 100);
      // log(estimates);
    });

    test('should load multiple stop estimates', async () => {
      const estimates = await client.listEstimates([13620, 13621], 100);
      // log(estimates);
    });

    test('should estimates for high volume of stops', async () => {
      const COUNT = 40;
      const stops = await client.listStops();
      const ids = stops.map(({ id }) => id);
      ids.sort(() => 0.5 - Math.random());
      const estimates = await client.listEstimates(ids.slice(0, COUNT), 100);
      // log(estimates);
    }, 10000);
  });

  describe('Geocoding', () => {
    test('should list locations matching an address', async () => {
      const locations = await client.geocode('Rua Joaquim Rocha Cabral');
      // log(locations);
    });

    test('should suggest locations matching an address', async () => {
      const suggestions = await client.geocodeSuggest('Rua Joaquim Rocha Cabral');
      // log(suggestions);
    });

    test('should list locations matching a set of coordinates', async () => {
      const location = await client.reverseGeocode({ latitude: 38.75, longitude: -9.15 });
      // log(location);
    });

    test('should load location based on its id', async () => {
      const suggestions = await client.geocodeSuggest('Rua Joaquim Rocha Cabral');
      const suggestion = suggestions[0];
      const location = await client.loadGeocodingLocation(suggestion.id);
      // log(location);
    }, 10000);
  });

  describe('Planner', () => {
    test('should allow planning of trip', async () => {
      const plan = await client.plan({
        start: { latitude: 38.75, longitude: -9.5 },
        end: { latitude: 38.75, longitude: -9.15 },
        date: new Date(),
        language: 'PT'
      });
      // log(plan);
    });
  });

  describe('Routes', () => {
    test('should list all routes', async () => {
      const routes = await client.listRoutes();
      // log(routes);
    });

    test('should list routes that pass at a specific stop', async () => {
      const routes = await client.listRoutes({ stop: '13620' });
      // log(routes);
    });

    test('should list routes changed after a specific point in time', async () => {
      const routes = await client.listRoutes({ after: new Date(2019, 5, 10) });
      // log(routes);
    });

    // test('should list nearest bus stops', async () => {
    //   const stops = await client.listStops({ latitude: 38.7539422, longitude: -9.1698717 });
    //   // log(stops);
    // }).timeout(5000);

    test('should load single route', async () => {
      const route = await client.loadRoute('701');
      // log(route);
    });
  });

  describe('Timetable', () => {
    test('should load timetable', async () => {
      const timetable = await client.loadTimetable({
        stop: 13620,
        direction: 'DESC',
        route: '701',
        date: new Date(2020, 9, 15)
      });
      // log(timetable);
    });
  });

  describe('Vehicles', () => {
    test('should list all vehicles', async () => {
      const vehicles = await client.listVehicles();
      // log(vehicles);
    });

    test('should list vehicles for a certain route', async () => {
      const vehicles = await client.listVehicles({ route: '701' });
      // log(vehicles);
    });

    test('should load single vehicle', async () => {
      const vehicle = await client.loadVehicle(1711);
      // log(vehicle);
    });
  });
});
