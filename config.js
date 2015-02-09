var config = require('nconf');

config.argv().env().file({file:'config.json'});
config.defaults({});

module.exports = config;
