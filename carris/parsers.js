'use strict';

const _transformStop = ({
  id,
  publicId,
  name,
  lat: latitude,
  lng: longitude,
  isPublicVisible: visible,
  timestamp,
  distance,
  ...stop
}) => ({
  id,
  publicId,
  name,
  position: {
    latitude,
    longitude
  },
  visible,
  updateDate: new Date(timestamp),
  ...(distance && { distance: distance * 1000 }),
  ...stop
});

const _transformStopWithEstimation = ({ estimationList, ...busStop }) => ({
  ..._transformStop(busStop),
  estimations: estimationList.map(_transformEstimation)
});

const _transformVehicleBase = ({
  busNumber: id,
  publicId: stop,
  plateNumber: plate,
  ...vehicle
}) => ({
  id,
  plate,
  stop,
  ...vehicle
});

const _transformEstimation = ({ voyageNumber: voyage, routeNumber: route, time, ...vehicle }) => ({
  ..._transformVehicleBase(vehicle),
  route,
  voyage,
  time: new Date(time)
});

const _transformRoute = ({
  id,
  routeNumber: number,
  name,
  isPublicVisible: visible,
  timestamp: creationDate,
  ...route
}) => ({
  id,
  number,
  name,
  visible,
  creationDate: new Date(creationDate),
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
  ...vehicle
}) => ({
  ..._transformVehicleBase(vehicle),
  route,
  active: state === 'InVoyage',
  position: {
    latitude,
    longitude
  },
  ...((lastGpsTime || lastReportTime || dataServico || timeStamp) && {
    time: {
      ...(lastGpsTime && { lastGps: new Date(lastGpsTime) }),
      ...(lastReportTime && { lastReport: new Date(lastReportTime) }),
      ...(dataServico && { serviceStart: new Date(dataServico) }),
      ...(timeStamp && { current: new Date(timeStamp) })
    }
  })
});

module.exports = {
  _transformStop,
  _transformStopWithEstimation,
  _transformVehicleBase,
  _transformEstimation,
  _transformRoute,
  _transformVehicle
};
