'use strict';

const parseName = name => name.replace(/\d+ ?- ?/g, '').replace('Ã�', 'Á');

const parseBoundingBox = box =>
  box.reduce((acc, value, index) => {
    const cloneObject = data => JSON.parse(JSON.stringify(data));
    const clone = cloneObject(acc);
    if (!(index % 2)) {
      clone.push({ longitude: value });
    } else {
      clone[Math.floor(index / 2)].latitude = value;
    }
    return clone;
  }, []);

const _transformStationBasic = ({
  id_expl: id,
  id_planeamento: planningId,
  desig_comercial: name,
  tipo_servico_niveis: type,
  num_bicicletas: bikes,
  num_docas: docks,
  racio: ratio,
  estado: status,
  ...properties
}) => ({
  id,
  ...(id !== planningId && { planningId }),
  name: parseName(name),
  type,
  bikes,
  docks,
  ratio: typeof ration === 'number' ? ratio : Number(ratio),
  status, // Status can be 'active' or 'repair'
  ...properties
});

const _transformStationItem = ({
  geometry: { coordinates: [[longitude, latitude] = []] = [] },
  properties: { update_date: updated, bbox: boundingBox, ...data }
}) => ({
  ..._transformStationBasic(data),
  position: {
    latitude,
    longitude
  },
  bounds: parseBoundingBox(boundingBox),
  updated: new Date(updated)
});

const _transformStationSingle = ({ latitude, longitude, ...data }) => ({
  ..._transformStationBasic(data),
  position: {
    latitude,
    longitude
  }
});

module.exports = {
  _transformStationBasic,
  _transformStationItem,
  _transformStationSingle
};
