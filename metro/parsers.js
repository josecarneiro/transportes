'use strict';

const { localeDateToDate } = require('./../utilities');

const formatDate = string =>
  [
    [string.slice(0, 4), string.slice(4, 6), string.slice(6, 8)].join('-'),
    [string.slice(8, 10), string.slice(10, 12), string.slice(12, 14)].join(':')
  ].join('T');

const parseDate = string => localeDateToDate(formatDate(string));

const intervalToSeconds = time =>
  time
    .split(':')
    .map(value => Number(value))
    .reduce((total, value, index) => total + (!index ? value * 60 : index === 1 ? value : 0), 0);

const formatLineName = line => line.toLowerCase();

const formatStationName = name => name.replace(/\/Chiado/g, '-Chiado'); // The name for "Baixa-Chiado" comes misformated as "Baixa/Chiado"

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
  name: formatStationName(name),
  lines: line.replace(/\[|\]/g, '').split(', ').map(formatLineName),
  zone,
  position: {
    latitude: Number(latitude),
    longitude: Number(longitude)
  }
});

const parseArrival = (id, currentTime, time) => ({
  train: id,
  time: new Date(Number(parseDate(currentTime)) + Number(time) * 1000)
});

const _transformEstimates = ({
  stop_id: station, //  'CA'
  cais: platform, //  'PT4CAO'
  hora: time, //  '20200215185211'
  comboio: train1, //  '7A'
  tempoChegada1: time1, //  '402'
  comboio2: train2, //  '8A'
  tempoChegada2: time2, //  '782'
  comboio3: train3, //  '1A'
  tempoChegada3: time3, //  '1296'
  destino: destination, //  '33'
  sairServico: exit, //  '0'
  UT: UT //  '2'
}) => ({
  station,
  platform,
  time: parseDate(time),
  destination,
  exit,
  UT,
  arrivals: [
    parseArrival(train1, time, time1),
    parseArrival(train2, time, time2),
    parseArrival(train3, time, time3)
  ]
});

const _transformDestination = ({ id_destino: id, nome_destino: name }) => ({ id, name });

const _transformInterval = ({
  Linha: line,
  HoraInicio: start,
  HoraFim: end,
  Intervalo: interval,
  UT,
  Dia: day
}) => ({
  line: formatLineName(line),
  start,
  end,
  interval: intervalToSeconds(interval),
  UT,
  // day,
  weekday: day.toLowerCase() === 's'
});

module.exports = {
  _transformEstimates,
  _transformStation,
  _transformDestination,
  _transformInterval
};
