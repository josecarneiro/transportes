'use strict';

require('dotenv').config();

describe('Transportes', () => {
  require('./../carris/carris.spec');
  require('./../metro/metro.spec');
  require('./../gira/gira.spec');
});
