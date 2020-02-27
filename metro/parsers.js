'use strict';

const _transformStation = ({
  stop_id: id, // 'AP',
  stop_name: name, // 'Aeroporto',
  stop_lat: latitude, // '38.7686',
  stop_lon: longitude, // '-9.12833',
  // stop_url: stop_url, // '[https://www.metrolisboa.pt/viajar/aeroporto/]',
  linha: line, // '[Vermelha]',
  zone_id: zone // 'L'
}) => ({
  id,
  name,
  latitude: Number(latitude),
  longitude: Number(longitude),
  lines: line
    .toLowerCase()
    .replace(/\[|\]/g, '')
    .split(', '),
  zone
});

const _transformEstimates = ({
  stop_id: station, //  'CA'
  cais: pier, //  'PT4CAO'
  hora: time, //  '20200215185211'
  comboio: train1, //  '7A'
  tempoChegada1: time1, //  '402'
  comboio2: train2, //  '8A'
  tempoChegada2: time2, //  '782'
  comboio3: train3, //  '1A'
  tempoChegada3: time3, //  '1296'
  destino: destiny, //  '33'
  sairServico: exit, //  '0'
  UT: UT //  '2'
}) => ({
  station,
  pier,
  time: parseDate(time),
  destiny,
  exit,
  UT,
  arrivals: [
    {
      train: train1,
      time: new Date(Number(parseDate(time)) + Number(time1) * 1000)
    },
    {
      train: train2,
      time: new Date(Number(parseDate(time)) + Number(time2) * 1000)
    },
    {
      train: train3,
      time: new Date(Number(parseDate(time)) + Number(time3) * 1000)
    }
  ]
});

const parseDate = string =>
  new Date(
    string.slice(0, 4),
    Number(string.slice(4, 6)) - 1,
    string.slice(6, 8),
    string.slice(8, 10),
    string.slice(10, 12),
    string.slice(12, 14)
  );

module.exports = {
  _transformEstimates,
  _transformStation
};
