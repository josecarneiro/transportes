'use strict';

const { localeDateToDate } = require('./../utilities');

const _transformStop = ({
  publicId: id,
  id: internalId,
  name,
  lat: latitude,
  lng: longitude,
  isPublicVisible: visible,
  timestamp,
  distance,
  ...stop
}) => ({
  id,
  internalId,
  name,
  position: {
    latitude,
    longitude
  },
  visible,
  updateDate: localeDateToDate(timestamp),
  ...(distance && { distance: distance * 1000 }),
  ...stop
});

const _transformStopWithEstimate = ({ estimationList: estimates, ...busStop }) => ({
  ..._transformStop(busStop),
  estimates: estimates.map(_transformEstimate)
});

const _transformVehicleBase = ({ busNumber: id, plateNumber: plate, ...vehicle }) => ({
  id: id || null,
  plate,
  ...vehicle
});

const _transformEstimate = ({
  publicId: stop,
  routeNumber: route,
  voyageNumber: voyage,
  time,
  ...vehicle
}) => ({
  stop,
  route,
  voyage,
  ..._transformVehicleBase(vehicle),
  time: localeDateToDate(time)
});

const _transformIteneraryConnections = ({
  id,
  direction,
  orderNum: order,
  busStop: stop,
  distance,
  ...connection
}) => ({
  id,
  direction,
  order,
  distance,
  stop: _transformStop(stop),
  ...connection
});

const _transformShape = string => {
  try {
    const data = JSON.parse(string);
    return data;
  } catch (error) {
    return null;
  }
};

const _transformItenerary = ({ id, type, direction, connections, shape, ...itenerary }) => ({
  id,
  type: type.toUpperCase(),
  direction,
  ...(shape && { shape: _transformShape(shape) }),
  ...(connections && { connections: connections.map(_transformIteneraryConnections) }),
  ...itenerary
});

const _transformRouteVariant = ({
  id,
  variantNumber: variant,
  isActive: active,
  upItinerary,
  downItinerary,
  circItinerary,
  ...other
}) => ({
  id,
  variant,
  active,
  iteneraries: [
    ...(upItinerary ? [_transformItenerary({ direction: 'ASC', ...upItinerary })] : []),
    ...(downItinerary ? [_transformItenerary({ direction: 'DESC', ...downItinerary })] : []),
    ...(circItinerary ? [_transformItenerary({ direction: 'CIRC', ...circItinerary })] : [])
  ],
  ...other
});

const _transformRoute = ({
  routeNumber: id,
  id: internalId,
  name,
  isPublicVisible: visible,
  timestamp: creationDate,
  isCirc: circular,
  variants,
  ...route
}) => ({
  id,
  internalId,
  name,
  visible,
  creationDate: localeDateToDate(creationDate),
  ...(typeof circular === 'boolean' && { circular }),
  ...(variants && { variants: variants.map(_transformRouteVariant) }),
  ...route
});

const _transformVehicle = ({
  routeNumber: route,
  lastGpsTime,
  lastReportTime,
  timeStamp,
  dataServico,
  lat: latitude,
  lng: longitude,
  state,
  previousReportTime,
  previousLatitude,
  previousLongitude,
  ...vehicle
}) => ({
  ..._transformVehicleBase(vehicle),
  route,
  active: state === 'InVoyage',
  position: {
    latitude,
    longitude
  },
  ...((previousLatitude || previousLongitude) && {
    previousPosition: {
      latitude: previousLatitude,
      longitude: previousLongitude
    }
  }),
  ...((lastGpsTime || lastReportTime || dataServico || timeStamp) && {
    time: {
      ...(timeStamp && { current: localeDateToDate(timeStamp) }),
      ...(lastReportTime && { lastReport: localeDateToDate(lastReportTime) }),
      ...(previousReportTime && { previousReport: localeDateToDate(previousReportTime) }),
      ...(lastGpsTime && { lastGps: localeDateToDate(lastGpsTime) }),
      ...(dataServico && { serviceStart: localeDateToDate(dataServico) })
    }
  })
});

const _transformAlert = ({
  id,
  alertType: type,
  alertDescription: description,
  publishDate: published,
  expirationDate: expires,
  routeNumber: route,
  busStopNumber: stop
}) => ({
  id,
  type: { Informative: 'informative', Ocurrence: 'ocurrence' }[type],
  description,
  published: published && localeDateToDate(published),
  expires: expires && localeDateToDate(expires),
  route,
  stop
});

const _transformGeocodingResult = ({
  lat: latitude,
  lng: longitude,
  address,
  header,
  isLocalMatch: localMatch
}) => ({
  position: {
    latitude,
    longitude
  },
  address,
  // header, // Rename title?
  title: header,
  localMatch
});

const _transformGeocodingSuggestion = ({ locationId: id, address, header }) => ({
  id,
  address,
  // header // Rename title?
  title: header
});

const _transformTimetableEntry = ({ stopId: stop, routeNumber: route, direction, time }) => ({
  stop,
  route,
  direction,
  time
  // time: '09:45:00'
});

const _transformTimetable = ({ dayId, seasonId, dayName, seasonName, stopTimes }) => ({
  day: {
    id: dayId,
    name: dayName
  },
  season: {
    id: seasonId,
    name: seasonName
  },
  stopTimes: stopTimes.map(_transformTimetableEntry)
});

module.exports = {
  _transformStop,
  _transformStopWithEstimate,
  _transformVehicleBase,
  _transformEstimate,
  _transformRoute,
  _transformVehicle,
  _transformAlert,
  _transformGeocodingResult,
  _transformGeocodingSuggestion,
  _transformTimetable
};
